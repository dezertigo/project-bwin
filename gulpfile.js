const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
var gcmq = require("gulp-group-css-media-queries");
const rename = require("gulp-rename");
const cleanCSS = require("gulp-clean-css");
const uglify = require("gulp-uglify");
const autoprefixer = require("gulp-autoprefixer");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const browsersync = require("browser-sync").create();
const del = require("del");
const webp = require("gulp-webp");
const imageminJpegRecompress = require("imagemin-jpeg-recompress");
const pngquant = require("imagemin-pngquant");
const fileInclude = require("gulp-file-include");
const replace = require("gulp-replace");
const fonter = require("gulp-fonter");
const ttf2woff2 = require("gulp-ttf2woff2");
const sourcemaps = require("gulp-sourcemaps");
const { dest } = require("gulp");
// const babel = require('gulp-babel')
// const concat = require('gulp-concat')
// const htmlmin = require('gulp-htmlmin')

const paths = {
   html: {
      // app: 'app/*.html',
      app: "app/**/*.html",
      new: "app/_*.html",
      components: "app/components/**/*.html",
      dest: "docs/",
   },
   scss: {
      app: "app/scss/**/*.scss",
      dest: "docs/css/",
   },
   js: {
      app: "app/js/**/*.js",
      dest: "docs/js/",
   },
   images: {
      app: {
         img: `app/img/**/*.{jpg,jpeg,gif,png}`,
         webp: "app/img/**/*.webp",
         svg: "app/img/**/*.svg",
         video: `app/img/**/*.mp4`,
      },
      dest: "docs/img/",
   },
   fonts: {
      app: "app/fonts/",
      otf: "app/fonts/*.otf",
      ttf: "app/fonts/*.ttf",
      icons: "app/fonts/icons/*.*",
      dest: "docs/fonts",
   },
};

// Очистить docs за исключением ./img в нём
function clean() {
   return del(["docs/*", "!docs/img", "!docs/fonts"]);
}

// Обработка html
function html() {
   return (
      gulp
         .src([paths.html.app, "!" + paths.html.new, "!" + paths.html.components])
         // return gulp.src([paths.html.app, '!' + paths.html.new,])
         .pipe(fileInclude())
         .pipe(replace(/@img\//g, "img/"))
         .pipe(gulp.dest(paths.html.dest))
         .pipe(browsersync.stream())
   );
}

function htmlComponents() {
   return gulp.src([paths.html.app, "!" + paths.html.new, paths.html.components]).pipe(browsersync.stream());
}

// Обработка scss
function scss() {
   return gulp
      .src([paths.scss.app, "!" + "app/scss/**/*.min.scss"])
      .pipe(sass().on("error", sass.logError))
      .pipe(
         autoprefixer({
            cascade: false,
         })
      )
      .pipe(gcmq())
      .pipe(gulp.dest(paths.scss.dest))
      .pipe(
         cleanCSS({
            level: 2,
         })
      )
      .pipe(
         rename({
            suffix: ".min",
         })
      )
      .pipe(replace(/@img\//g, "../img/"))
      .pipe(gulp.dest(paths.scss.dest))
      .pipe(gulp.src("app/scss/**/*.min.css"))
      .pipe(gulp.dest(paths.scss.dest))
      .pipe(browsersync.stream());
}

// Обработка js
function js() {
   return (
      gulp
         .src([paths.js.app, "!" + "app/js/**/*.min.js"])
         .pipe(sourcemaps.init())
         // .pipe(babel({
         // 	presets: ['@babel/env'] //небольшое изменения джс файла на старый стандарт
         // }))
         .pipe(gulp.dest(paths.js.dest)) //Выгрузка не сжатого файла
         .pipe(uglify())
         // .pipe(concat('main.min.js')) //Склеивание всех .js файлов в app/js/ и переименование
         .pipe(
            rename({
               suffix: ".min", //добавление суффикса после имени
            })
         )
         .pipe(gulp.dest(paths.js.dest))
         .pipe(gulp.src("app/js/**/*.min.js"))
         .pipe(sourcemaps.write())
         .pipe(gulp.dest(paths.js.dest))
         .pipe(browsersync.stream())
   );
}

// Обработка images
function img() {
   return gulp
      .src(paths.images.app.img)
      .pipe(newer(paths.images.dest))
      .pipe(
         imagemin([
            imageminJpegRecompress({
               progressive: true,
               min: 70,
               max: 75,
            }),
            pngquant({
               speed: 5,
               quality: [0.6, 0.8],
            }),
         ])
      )
      .pipe(gulp.dest(paths.images.dest)) // Сохраняет сжатые изображения в конечную папку
      .pipe(gulp.src(paths.images.app.img))
      .pipe(webp())
      .pipe(newer(paths.images.dest))
      .pipe(gulp.dest(paths.images.dest)) // Сохраняет webp изображение в конечную папку
      .pipe(gulp.src(paths.images.app.svg))
      .pipe(newer(paths.images.dest))
      .pipe(gulp.dest(paths.images.dest)) // Сохраняет оригинальное svg-изображение в конечную папку
      .pipe(gulp.src(paths.images.app.video))
      .pipe(newer(paths.images.dest))
      .pipe(gulp.dest(paths.images.dest)); // Сохраняет оригинальное видео в конечную папку
}
// Обработка шрифтов (конвертация из off в ttf, из ttf в woff,woff2)
function fonts() {
   return gulp
      .src(paths.fonts.otf)
      .pipe(
         fonter({
            formats: ["ttf"],
         })
      )
      .pipe(gulp.dest(paths.fonts.app))
      .pipe(gulp.src(paths.fonts.ttf))
      .pipe(
         fonter({
            formats: ["woff"],
         })
      )
      .pipe(gulp.dest(paths.fonts.dest))
      .pipe(gulp.src(paths.fonts.ttf))
      .pipe(ttf2woff2())
      .pipe(gulp.dest(paths.fonts.dest))
      .pipe(gulp.src(paths.fonts.icons))
      .pipe(gulp.dest(paths.fonts.dest));
}

// Наблюдение за изменениями в исходных файлах
function watcher() {
   browsersync.init({
      server: {
         baseDir: "./docs",
      },
   });
   gulp.watch(paths.html.app, html);
   gulp.watch(paths.html.components, htmlComponents);
   gulp.watch(paths.scss.app, scss);
   gulp.watch(paths.js.app, js);
   gulp.watch(paths.images.app.img, img);
   gulp.watch(paths.images.app.svg, img);
}

exports.clean = clean;
exports.html = html;
exports.scss = scss;
exports.js = js;
exports.img = img;
exports.fonts = fonts;
exports.watcher = watcher;

// exports.default = gulp.series(clean, html, fonts, gulp.parallel(scss, js, img), watcher) //Production
// exports.default = gulp.series(clean, html, gulp.parallel(scss, js, img), watcher) //Что бы не ждать конвертацию шрифтов

exports.default = gulp.series(html, gulp.parallel(scss, js), watcher);
exports.build = gulp.series(clean, html, fonts, gulp.parallel(scss, js, img), watcher);
