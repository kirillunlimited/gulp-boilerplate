
const gulp = require('gulp');
const gutil = require('gulp-util');
const sourcemaps = require('gulp-sourcemaps');

const CONFIG = {
  DEST: "./demo/dist",
  SASS: {
    SRC: "./demo/src/sass/**/*.{sass,scss}",
    SRC_FILE: "./demo/src/sass/index.scss",
    DEST: "./demo/dist/css",
  },
  JS: {
    SRC: "./demo/src/js/**/*.js",
    DEST: "./demo/dist/js",
    DEST_FILE: "main.js"
  },
  IMAGES: {
    SRC: "./demo/src/img/**/*.{jpg,png,svg,gif}",
    DEST: "./demo/dist/img"
  },
  BROWSERSYNC: {
    DEST: "./demo/dist/**",
    BASE: "./demo",
    DOMAIN: "domain"
  }
};

const sass = require('gulp-sass');
const csso = require('gulp-csso');
const autoprefixer = require('gulp-autoprefixer');

gulp.task('sass', function () {
  return gulp.src(CONFIG.SASS.SRC_FILE)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write({includeContent: false}))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(autoprefixer())
    .pipe(csso())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(CONFIG.SASS.DEST));
});

const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const jsValidate = require('gulp-jsvalidate');

gulp.task('js', function() {
  return gulp.src(CONFIG.JS.SRC)
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
    .pipe(concat(CONFIG.JS.DEST_FILE))
    .pipe(sourcemaps.write({includeContent: false}))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(CONFIG.JS.DEST));
});

const imagemin = require('gulp-imagemin');
const changed = require('gulp-changed');
const imageminPngquant = require('imagemin-pngquant');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');

gulp.task('images', function() {
  return gulp.src(CONFIG.IMAGES.SRC)
    .pipe(changed(CONFIG.IMAGES.DEST))
    .pipe(imagemin([
      imageminPngquant({quality: '50-75'}),
      imageminJpegRecompress({
        progressive: true,
        max: 75,
        min: 50,
        quality: 'medium'
      }),
      imagemin.gifsicle({interlaced: true}),
      imagemin.svgo({plugins: [{removeViewBox: true}]})
    ]))
    .pipe(gulp.dest(CONFIG.IMAGES.DEST));
});

const browserSync = require('browser-sync').create();

gulp.task('serve', ['default'], function() {
  browserSync.init({
    server: {
      baseDir: CONFIG.BROWSERSYNC.BASE
    }
  });
  gulp.watch(CONFIG.BROWSERSYNC.DEST).on('change', browserSync.reload);
});

gulp.task('serve:proxy', ['default'], function() {
  browserSync.init({
    startPath: CONFIG.BROWSERSYNC.BASE,
    proxy: {
      target: CONFIG.BROWSERSYNC.DOMAIN
    }
  });
  gulp.watch(CONFIG.BROWSERSYNC.DEST).on('change', browserSync.reload);
});

const clean = require('gulp-clean');

gulp.task('clean', function () {
  return gulp.src(CONFIG.DEST, {read: false})
    .pipe(clean({force: true}));
});

gulp.task('watch', function(){
  gulp.watch(CONFIG.SASS.SRC, ['sass']);
  gulp.watch(CONFIG.JS.SRC, ['js']);
  gulp.watch(CONFIG.IMAGES.SRC, ['images']);
});

gulp.task('build', ['sass', 'js', 'images']);

gulp.task('default', ['build', 'watch']);