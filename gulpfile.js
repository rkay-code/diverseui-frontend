const gulp = require('gulp');
const connect = require('gulp-connect');
const concat = require('gulp-concat');
const nunjucks = require('gulp-nunjucks');
const jsFiles = ['zipjs', 'indexjs'];

gulp.task('default', ['serve', 'watch']);

gulp.task('serve', () => {
  return connect.server({
    root: 'dist',
    livereload: true,
    port: 7890
  });
});

gulp.task('watch', ['templates:watch']);

gulp.task('templates:watch', () => {
  return gulp.watch('templates/*.html', ['templates'])
});

gulp.task('templates', () => {
  return gulp.src('templates/index.html')
    .pipe(nunjucks.compile())
    .pipe(gulp.dest('dist'))
    .pipe(connect.reload());
});
