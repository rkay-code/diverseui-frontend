const gulp = require('gulp');
const fs = require('fs');
const request = require('request');
const gutil = require('gulp-util');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const connect = require('gulp-connect');
const concat = require('gulp-concat');
const nunjucks = require('gulp-nunjucks');
const data = require('gulp-data');
const jsFiles = [
  {name: 'zipjs', dependencies: ['jszip', 'jszip-utils', 'FileSaver']},
  {name: 'indexjs', dependencies: ['index', 'banner']},
  {name: 'menujs', dependencies: ['menu']}
];

gulp.task('build', ['templates', 'sass', ...jsFiles.map(({name}) => name), 'things-that-dont-need-to-be-watched', 'sitemap']);

gulp.task('things-that-dont-need-to-be-watched', () => {
  return gulp.src('src/img/**/*', {base: 'src'}).pipe(gulp.dest('dist'));
});

gulp.task('sitemap', () => {
  return gulp.src('sitemap.xml').pipe(gulp.dest('dist'));
});

gulp.task('default', ['serve', 'build', 'watch']);

gulp.task('data', () => {
  if (!fs.existsSync('./diverseui.json')) {
    return request('https://www.diverseui.com/images?domain=')
      .pipe(fs.createWriteStream('./diverseui.json'));
  }
});

gulp.task('serve', () => {
  return connect.server({
    root: 'dist',
    livereload: true,
    port: 7890
  });
});

gulp.task('watch', ['templates:watch', 'sass:watch', ...jsFiles.map(({name}) => `${name}:watch`)]);

gulp.task('templates:watch', () => {
  return gulp.watch('src/*.html', ['templates'])
});

gulp.task('templates', ['data'], () => {
  return gulp.src('src/*.html')
    .pipe(data((file) => {
      const images = require('./diverseui.json');

      return {images, filepath: file.path};
    }))
    .pipe(nunjucks.compile())
    .pipe(gulp.dest('dist'))
    .pipe(connect.reload());
});

gulp.task('sass', () => {
  return gulp.src('src/styles/**/*.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(rename((path) => {
      path.basename += '-compiled';
      path.extname = '.css';
    }))
    .pipe(gulp.dest('dist/styles'))
    .pipe(connect.reload());
});

gulp.task('sass:watch', () => {
  return gulp.watch('src/styles/**/*.scss', ['sass']);
});

jsFiles.forEach(({name, dependencies}) => {
  gulp.task(`${name}:watch`, () => {
    return gulp.watch(`src/scripts/${name}/*.js`, [name]);
  });

  gulp.task(name, () => {
    const files = dependencies.map((dependency) => {
      return `src/scripts/${name}/${dependency}.js`;
    });
    return gulp.src(files)
      .on('end', () => { gutil.log(`Sourcing ${files.join(', ')}.`); })
      .pipe(concat(`${name}.js`))
      .pipe(gulp.dest('dist/scripts'))
      .pipe(connect.reload());
  });
});
