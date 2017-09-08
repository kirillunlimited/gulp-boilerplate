'use strict';

var gulp = require('gulp');

var sass = require('gulp-sass');
var csso = require('gulp-csso');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('sass', function () {
  return gulp
    .src('./demo/src/sass/index.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write({includeContent: false}))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(autoprefixer())
    .pipe(csso())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./demo/dist/css'));
});

var clean = require('gulp-clean');

gulp.task('clean', function () {
  return gulp.src('./demo/dist', {read: false})
    .pipe(clean({force: true}));
});

gulp.task('watch', function(){
  gulp.watch('demo/src/sass/**/*.{sass,scss}', ['sass']);
});

gulp.task('build', ['sass']);

gulp.task('default', ['build', 'watch']);