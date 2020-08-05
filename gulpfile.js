const gulp = require('gulp'),
	browserSync = require('browser-sync').create(),
	sass = require('gulp-sass'),
	postcss = require('gulp-postcss'),
	autoprefixer = require('autoprefixer'),
	babel = require('gulp-babel'),
	sourcemaps = require('gulp-sourcemaps'),
	uglify = require('gulp-uglify'),
	inject = require('gulp-inject'),
	{parallel, series, lastRun} = require('gulp'),
	imagemin = require('gulp-imagemin'),
	clean = require('gulp-clean'),
	plumber = require('gulp-plumber'),
	header = require('gulp-header'),
	newer = require('gulp-newer'),
	cached = require('gulp-cached'),
	remember = require('gulp-remember'),
	fileinclude = require('gulp-file-include');

const pkg = require('./package.json');
const banner = [
	'/**',
	' * <%= pkg.name %> - <%= pkg.description %>',
	' * author : <%= pkg.author %>',
	' * company : <%= pkg.company %>',
	' * license : <%= pkg.license %>',
	' * release date : <%= date %>',
	' */',
	'',
].join('\n');

const paths = {
	styles: {
		src: ['./front/scss/**/*.scss'],
		dest: './dest/css/',
	},
	scripts: {
		src: ['./front/script/**/*.js', '!./front/script/lib/*.js'],
		dest: './dest/js/',
		concat: './dest/js/*.js',
		lib: './front/script/lib/*.js',
		libDest: './dest/js/lib',
	},
	images: {
		src: './front/images/**/*.{jpg,jpeg,png,gif,svg,JPG}',
		dest: './dest/images/',
	},
	fonts: {
		src: './front/fonts/**/*.{woff,woff2,eot,ttf,svg,otf}',
		dest: './dest/fonts/',
	},
	html: {
		src: './front/**/*.html',
		dest: './dest/html/common/',
	},
};

function injectHtml() {
	const target = gulp.src('./front/html/front/**/*.html');
	const sources = gulp.src(
		[
			'./dest/js/lib/*.js',
			'./dest/js/*.js',
			'./dest/css/common/*.css',
			'./dest/css/*.css',
		],
		{
			read: false,
		},
	);

	return target

		.pipe(
			inject(sources, {
				ignorePath: 'dest',
				addRootSlash: true,
			}),
		)

		.pipe(gulp.dest('./dest/html/front/'));
}
function doInject(done) {
	return gulp.series(injectHtml)(done);
}

function adminInjectHtml() {
	const target = gulp.src('./front/html/admin/**/*.html');
	const sources = gulp.src(
		[
			'./dest/js/admin/lib/*.js',
			'./dest/js/admin/*.js',
			'./dest/css/admin/common/*.css',
			'./dest/css/admin/*.css',
		],
		{
			read: false,
		},
	);

	return target

		.pipe(
			inject(sources, {
				ignorePath: 'dest',
				addRootSlash: true,
			}),
		)

		.pipe(gulp.dest('./dest/html/admin/'));
}
function doAdminInject(done) {
	return gulp.series(adminInjectHtml)(done);
}

function includeCommon() {
	return gulp
		.src(['./dest/html/**/*.html', '!./dest/html/common/*.html'])
		.pipe(newer('./dest/html/common/*.html'))
		.pipe(
			fileinclude({
				prefix: '@@',
				basepath: '@file',
			}),
		)
		.pipe(gulp.dest('./dest/html/'));
}

function doInclude(done) {
	return gulp.series(includeCommon)(done);
}

function imagesCopy() {
	return gulp
		.src(paths.images.src)
		.pipe(newer(paths.images.dest))
		.pipe(imagemin())
		.pipe(gulp.dest(paths.images.dest));
}
function doImagesCopy(done) {
	return gulp.series(imagesCopy)(done);
}

function fontsCopy() {
	return gulp.src(paths.fonts.src).pipe(gulp.dest(paths.fonts.dest));
}
function doFontsCopy(done) {
	return gulp.series(fontsCopy)(done);
}

function style() {
	return gulp
		.src(paths.styles.src, {since: lastRun(style)})
		.pipe(cached('styles'))
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(
			sass({
				outputStyle: 'compressed',
				indentType: 'tab',
				precision: 6,
				indentWidth: 2,
				sourceComments: true,
			}),
		)
		.on('error', sass.logError)
		.pipe(postcss([autoprefixer({grid: true})]))
		.pipe(sourcemaps.write('./'))
		.pipe(remember('styles'))
		.pipe(header(banner, {pkg: pkg, date: new Date().toLocaleString()}))
		.pipe(gulp.dest(paths.styles.dest));
}
function doStyles(done) {
	return gulp.series(style)(done);
}

function preprocessJs() {
	return gulp
		.src(paths.scripts.src, {since: lastRun(preprocessJs)})
		.pipe(cached('scripts'))
		.pipe(plumber())
		.pipe(
			babel({
				presets: ['@babel/env'],
			}),
		)
		.pipe(uglify())
		.pipe(remember('scripts'))
		.pipe(header(banner, {pkg: pkg, date: new Date().toLocaleString()}))
		.pipe(gulp.dest(paths.scripts.dest));
}
function doScripts(done) {
	return gulp.series(preprocessJs)(done);
}
function libScripts() {
	return gulp
		.src(paths.scripts.lib)
		.pipe(newer(paths.scripts.libDest))
		.pipe(gulp.dest(paths.scripts.libDest));
}
function doLibScripts(done) {
	return gulp.series(libScripts)(done);
}

function cleanDist() {
	return gulp.src('./dest/*', {read: false}).pipe(clean());
}

function doCleanDist(done) {
	return gulp.series(cleanDist)(done);
}

function watch() {
	browserSync.init({
		server: {
			baseDir: './dest/',
		},
	});
	gulp.watch(paths.html.src, doInject).on('change', browserSync.reload);
	gulp.watch(paths.html.src, doAdminInject).on('change', browserSync.reload);
	gulp.watch(paths.images.src, doImagesCopy);
	gulp.watch(paths.fonts.src, doFontsCopy);
	gulp.watch(paths.styles.src, doStyles).on('change', browserSync.reload);
	gulp.watch(paths.scripts.src, doScripts).on('change', browserSync.reload);
	gulp.watch(paths.scripts.lib, doLibScripts);
	// gulp.watch(paths.html.dest, doInclude).on('change', browserSync.reload);
}

exports.build = series(
	doCleanDist,
	doImagesCopy,
	doFontsCopy,
	doStyles,
	doScripts,
	doLibScripts,
	doInject,
	doAdminInject,
	// doInclude,
);
exports.default = parallel(watch);
