const gulp = require('gulp');
const $ = require('gulp-load-plugins')({
  pattern: '*'
});

const CONFIG = {
  DEST: "./demo/dist",
  SASS: {
    SRC: "demo/src/sass/**/*.{sass,scss}",
    SRC_FILE: "demo/src/sass/index.scss",
    DEST: "./demo/dist/css",
  },
  JS: {
    SRC: "demo/src/js/**/*.js",
    DEST: "./demo/dist/js",
    DEST_FILE: "main.js"
  },
  IMAGES: {
    SRC: [
      "demo/src/img/**/*.{jpg,png,svg,gif}",
      "!./demo/src/img/sprite/**"
    ],
    DEST: "./demo/dist/img"
  },
  SPRITE: {
    SRC: "demo/src/img/sprite/*",
    DEST_IMG: "./demo/src/img",
    DEST_CSS: "./demo/src/sass/helpers",
    NAME: 'sprite.png',
    NAME_CSS: 'sprite.scss',
    PATH: '../img/sprite.png'
  },
  BROWSERSYNC: {
    DEST: "./demo/dist/**",
    BASE: "./demo",
    DOMAIN: "domain"
  },
};

gulp.task('sass', function () {
  return gulp.src(CONFIG.SASS.SRC_FILE)
    .pipe($.sourcemaps.init())
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.sourcemaps.write({includeContent: false}))
    .pipe($.sourcemaps.init({loadMaps: true}))
    .pipe($.autoprefixer())
    .pipe($.csso())
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(CONFIG.SASS.DEST));
});

gulp.task('js', function() {
  return gulp.src(CONFIG.JS.SRC)
    .pipe($.jsvalidate())
    .on('error', function(error) {
      $.util.log($.util.colors.red('JavaScript error'));
      $.util.log('  ' + $.util.colors.yellow('Filename: ') + error.fileName);
      $.util.log('  ' + $.util.colors.yellow('Error:    ') + error.message);
      this.emit('end');
    })
    .pipe($.sourcemaps.init())
    .pipe($.concat(CONFIG.JS.DEST_FILE))
    .pipe($.sourcemaps.write({includeContent: false}))
    .pipe($.sourcemaps.init({loadMaps: true}))
    .pipe($.uglify())
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(CONFIG.JS.DEST));
});

gulp.task('images', function() {
  return gulp.src(CONFIG.IMAGES.SRC)
    .pipe($.changed(CONFIG.IMAGES.DEST))
    .pipe($.imagemin([
      $.imageminPngquant({quality: '50-75'}),
      $.imageminJpegRecompress({
        progressive: true,
        max: 75,
        min: 50,
        quality: 'medium'
      }),
      $.imagemin.gifsicle({interlaced: true}),
      $.imagemin.svgo({plugins: [{removeViewBox: true}]})
    ]))
    .pipe(gulp.dest(CONFIG.IMAGES.DEST));
});

gulp.task('sprite', function() {
  const spriteData = gulp.src(CONFIG.SPRITE.SRC).pipe($.spritesmith({
    imgName: CONFIG.SPRITE.NAME,
    cssName: CONFIG.SPRITE.NAME_CSS,
    imgPath: CONFIG.SPRITE.PATH
  }));

  spriteData.img
    .pipe(gulp.dest(CONFIG.SPRITE.DEST_IMG));

  spriteData.css
    .pipe(gulp.dest(CONFIG.SPRITE.DEST_CSS))

  return spriteData;
});

gulp.task('serve', ['default'], function() {
  const browserSync = $.browserSync.create();
  browserSync.init({
    server: {
      baseDir: CONFIG.BROWSERSYNC.BASE
    }
  });
  gulp.watch(CONFIG.BROWSERSYNC.DEST).on('change', browserSync.reload);
});

gulp.task('serve:proxy', ['default'], function() {
  const browserSync = $.browserSync.create();
  browserSync.init({
    startPath: CONFIG.BROWSERSYNC.BASE,
    proxy: {
      target: CONFIG.BROWSERSYNC.DOMAIN
    }
  });
  gulp.watch(CONFIG.BROWSERSYNC.DEST).on('change', browserSync.reload);
});

gulp.task('clean', function () {
  return gulp.src(CONFIG.DEST, {read: false})
    .pipe($.clean({force: true}));
});

gulp.task('watch', function(){
  gulp.watch(CONFIG.SASS.SRC, ['sass']);
  gulp.watch(CONFIG.JS.SRC, ['js']);
  gulp.watch(CONFIG.IMAGES.SRC, ['images']);
  gulp.watch(CONFIG.SPRITE.SRC, ['sprite']);
});

gulp.task('build', function() {
  $.runSequence('sprite', 'sass', 'js', 'images');
});

gulp.task('default', ['build', 'watch']);