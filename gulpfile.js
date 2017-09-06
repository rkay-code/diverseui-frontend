const gulp = require('gulp');
const gutil = require('gulp-util');
const connect = require('gulp-connect');
const concat = require('gulp-concat');
const nunjucks = require('gulp-nunjucks');
const jsFiles = [
  {name: 'zipjs', dependencies: ['jszip', 'jszip-utils', 'FileSaver']},
  {name: 'indexjs', dependencies: ['index', 'banner']}
];

gulp.task('build', ['templates', ...jsFiles.map(({name}) => name)]);

gulp.task('default', ['serve', 'build', 'watch']);

gulp.task('serve', () => {
  return connect.server({
    root: 'dist',
    livereload: true,
    port: 7890
  });
});

gulp.task('watch', ['templates:watch', ...jsFiles.map(({name}) => `${name}:watch`)]);

gulp.task('templates:watch', () => {
  return gulp.watch('src/*.html', ['templates'])
});

gulp.task('templates', () => {
  return gulp.src('src/*.html')
    .pipe(nunjucks.compile())
    .pipe(gulp.dest('dist'))
    .pipe(connect.reload());
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
