const gulp = require('gulp'),
	browserSync = require('browser-sync').create(),
	sass = require('gulp-sass'),
	postcss = require('gulp-postcss'),
	autoprefixer = require('autoprefixer'),
	babel = require('gulp-babel'),
	concat = require('gulp-concat'),
	sourcemaps = require('gulp-sourcemaps'),
	uglify = require('gulp-uglify'),
	inject = require('gulp-inject'),
	{parallel, series, dest} = require('gulp'),
	imagemin = require('gulp-imagemin'),
	clean = require('gulp-clean'),
	plumber = require('gulp-plumber');

const paths = {
	styles: {
		src: ['./front/scss/**/*.scss'],
		dest: './dist/css/',
	},
	scripts: {
		src: ['./front/script/**/*.js', '!./front/script/lib/*.js'],
		dest: './dist/js/',
		concat: './dist/js/*.js',
		lib: './front/script/lib/*.js',
		libDest: './dist/js/lib',
	},
	images: {
		src: './front/images/**/*.{jpg,jpeg,png,gif,svg,JPG}',
		dest: './dist/images/',
	},
	fonts: {
		src: './front/fonts/**/*.{woff,woff2,eot,ttf,svg,otf}',
		dest: './dist/fonts/',
	},
	html: {
		src: './front/**/*.html',
	},
};

function injectHtml() {
	return gulp
		.src('./front/**/*.html')
		.pipe(gulp.dest('./dist/'))
		.pipe(browserSync.stream());
}

function imagesCopy() {
	return gulp
		.src(paths.images.src)
		.pipe(imagemin())
		.pipe(gulp.dest(paths.images.dest));
}

function fontsCopy() {
	return gulp.src(paths.fonts.src).pipe(gulp.dest(paths.fonts.dest));
}

function style() {
	return gulp
		.src(paths.styles.src)
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(
			sass({
				outputStyle: 'expanded',
				sourceComments: true,
				indentWidth: 1,
			}),
		)
		.on('error', sass.logError)
		.pipe(postcss([autoprefixer({grid: true})]))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.styles.dest))
		.pipe(browserSync.stream());
}

function preprocessJs() {
	return (
		gulp
			.src(paths.scripts.src)
			.pipe(plumber())
			.pipe(
				babel({
					presets: ['@babel/env'],
				}),
			)
			.pipe(uglify())
			// .pipe(concat('chunk.js'))
			.pipe(gulp.dest(paths.scripts.dest))
			.pipe(browserSync.stream())
	);
}

function reload(done) {
	browserSync.reload();
	done();
}

function libScripts() {
	return gulp.src(paths.scripts.lib).pipe(gulp.dest(paths.scripts.libDest));
}

function cleanDist() {
	return gulp.src('./dist/*', {read: false}).pipe(clean());
}

// do stm
function doScripts(done) {
	return gulp.series(preprocessJs)(done);
}
function doStyles(done) {
	return gulp.series(style)(done);
}
function doFontsCopy(done) {
	return gulp.series(fontsCopy)(done);
}
function doImagesCopy(done) {
	return gulp.series(imagesCopy)(done);
}
function doInject(done) {
	return gulp.series(injectHtml)(done);
}

function doLibScripts(done) {
	return gulp.series(libScripts)(done);
}
function doCleanDist(done) {
	return gulp.series(cleanDist)(done);
}

function watch() {
	browserSync.init({
		server: {
			baseDir: './dist/',
		},
	});
	gulp.watch(paths.images.src, doImagesCopy);
	gulp.watch(paths.fonts.src, doFontsCopy);
	gulp.watch(paths.styles.src, doStyles);
	gulp.watch(paths.scripts.src, doScripts);
	gulp.watch(paths.scripts.lib, doLibScripts);
	gulp.watch(paths.html.src, doInject);
}

exports.build = series(
	doCleanDist,
	doImagesCopy,
	doFontsCopy,
	doStyles,
	doScripts,
	doLibScripts,
	doInject,
);
exports.default = parallel(watch);
