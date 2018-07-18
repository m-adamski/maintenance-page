var gulp = require("gulp");
var sass = require("gulp-sass");
var sassLint = require("gulp-sass-lint");
var sourceMaps = require("gulp-sourcemaps");
var cleanCSS = require("gulp-clean-css");
var rename = require("gulp-rename");

function lintSass() {
    return gulp.src("./source/scss/**/*.scss")
        .pipe(sassLint())
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError());
}

function compileSass() {
    return gulp.src("./source/scss/template.scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(gulp.dest("./public/assets/css"));
}

function compileCss() {
    return gulp.src(["./public/assets/css/**/*.css", "!./public/assets/css/**/*.min.css"])
        .pipe(sourceMaps.init())
        .pipe(cleanCSS())
        .pipe(rename({suffix: ".min"}))
        .pipe(sourceMaps.write("./"))
        .pipe(gulp.dest("./public/assets/css"));
}

gulp.task("compile-css",
    gulp.series(lintSass, compileSass, compileCss)
);
