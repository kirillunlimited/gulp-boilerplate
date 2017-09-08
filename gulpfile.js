'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');

var sass = require('gulp-sass');
var csso = require('gulp-csso');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('sass', function () {
  return gulp.src('./demo/src/sass/index.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write({includeContent: false}))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(autoprefixer())
    .pipe(csso())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./demo/dist/css'));
});

var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var jsValidate = require('gulp-jsvalidate');

gulp.task('js', function() {
  return gulp.src('./demo/src/js/**/*.js')
    .pipe(jsValidate())
    .on('error', function(error) {
      gutil.log(gutil.colors.red('Error') + ' in JavaScript');
      gutil.log('  Filename:');
      gutil.log('      ' + error.fileName);
      gutil.log('  Error:');
      gutil.log('      ' + error.message );
      this.emit('end');
    })
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(sourcemaps.write({includeContent: false}))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./demo/dist/js'));
});

var browserSync = require('browser-sync').create();

gulp.task('serve', ['default'], function() {
  browserSync.init({
    server: {
      baseDir: "./demo"
    }
  });
  gulp.watch('./demo/dist/**').on('change', browserSync.reload);
});

gulp.task('serve:proxy', ['default'], function() {
  browserSync.init({
    startPath: "/demo",
    proxy: {
      target: "domain"
    }
  });
  gulp.watch('./dist/**').on('change', browserSync.reload);
});

var clean = require('gulp-clean');

gulp.task('clean', function () {
  return gulp.src('./demo/dist', {read: false})
    .pipe(clean({force: true}));
});

gulp.task('watch', function(){
  gulp.watch('demo/src/sass/**/*.{sass,scss}', ['sass']);
  gulp.watch('demo/src/js/**/*.js', ['js']);
});

gulp.task('build', ['sass', 'js']);

gulp.task('default', ['build', 'watch']);