const gulp = require("gulp"),
    browserSync = require("browser-sync").create(),
    sass = require("gulp-sass"),
    postcss = require("gulp-postcss"),
    autoprefixer = require("autoprefixer"),
    babel = require("gulp-babel"),
    concat = require("gulp-concat"),
    sourcemaps = require("gulp-sourcemaps"),
    uglify = require("gulp-uglify"),
    inject = require("gulp-inject"),
    { parallel } = require("gulp"),
    imagemin = require("gulp-imagemin");

const paths = {
    styles: {
        src: ["./front/scss/**/*.scss"],
        dest: "./dist/css/",
    },
    scripts: {
        src: ["./front/script/**/*.js", "!./front/script/libs/*.js"],
        dest: "./dist/js/",
        concat: "./dist/js/*.js",
    },
    images: {
        src: "./front/images/**/*.{jpg,jpeg,png,gif,svg,JPG}",
        dest: "./dist/images/",
    },
    fonts: {
        src: "./front/fonts/**/*.{woff,woff2,eot,ttf,svg,otf}",
        dest: "./dist/fonts/",
    },
    html: {
        src: "./front/**/*.html",
    },
};

function doInject() {
    const target = gulp.src("./front/**/*.html");
    const sources = gulp.src(
        ["./dist/js/lib/*.js", "./dist/js/*.js", "./dist/css/**/*.css"],
        {
            read: false,
        }
    );

    return target
        .pipe(
            inject(sources, {
                ignorePath: "dist",
                addRootSlash: true,
            })
        )
        .pipe(gulp.dest("./dist/"));
}

function doImagesCopy(done) {
    return gulp.series(imagesCopy)(done);
}

function imagesCopy() {
    return gulp
        .src(paths.images.src)
        .pipe(imagemin())
        .pipe(gulp.dest(paths.images.dest));
}

function doFontsCopy(done) {
    return gulp.series(fontsCopy)(done);
}

function fontsCopy() {
    return gulp.src(paths.fonts.src).pipe(gulp.dest(paths.fonts.dest));
}

function doStyles(done) {
    return gulp.series(style)(done);
}

function style() {
    return gulp
        .src(paths.styles.src)
        .pipe(sourcemaps.init())
        .pipe(
            sass({
                outputStyle: "expanded",
                sourceComments: true,
                indentWidth: 1,
            })
        )
        .on("error", sass.logError)
        .pipe(postcss([autoprefixer({ grid: true })]))
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(browserSync.stream());
}

function doScripts(done) {
    return gulp.series(preprocessJs)(done);
}

function preprocessJs() {
    return gulp
        .src(paths.scripts.src)
        .pipe(
            babel({
                presets: ["@babel/env"],
            })
        )
        .pipe(uglify())
        .pipe(concat("chunk.js"))
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(browserSync.stream());
}

function reload(done) {
    doInject();
    browserSync.reload();
    done();
}

function watch() {
    browserSync.init({
        server: {
            baseDir: "./dist/",
        },
    });

    gulp.watch(paths.images.src, doImagesCopy);
    gulp.watch(paths.fonts.src, doFontsCopy);
    gulp.watch(paths.styles.src, doStyles);
    gulp.watch(paths.scripts.src, doScripts);
    gulp.watch(paths.html.src, reload);
}

exports.build = parallel(
    doImagesCopy,
    doFontsCopy,
    doStyles,
    doScripts,
    doInject
);
exports.default = parallel(doInject, watch);
