const gulp = require('gulp');
const nunjucks = require('gulp-nunjucks');

gulp.task('default', () => {
  return gulp.src('templates/index.html')
    .pipe(nunjucks.compile())
    .pipe(gulp.dest('dist'));
});
