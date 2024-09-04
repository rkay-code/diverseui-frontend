const gulp = require('gulp');
const fs = require('fs');
const request = require('request');
const log = require('fancy-log');
const PluginError = require('plugin-error');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass')); // Use `node-sass` or `dart-sass`
const connect = require('gulp-connect');
const concat = require('gulp-concat');
const nunjucks = require('gulp-nunjucks');
const data = require('gulp-data');
const jsFiles = [
  {name: 'zipjs', dependencies: ['jszip', 'jszip-utils', 'FileSaver']},
  {name: 'indexjs', dependencies: ['index', 'banner']},
  {name: 'menujs', dependencies: ['menu']}
];

// Define JavaScript file tasks
jsFiles.forEach(({ name, dependencies }) => {
  gulp.task(name, (done) => {
    const files = dependencies.map((dependency) => {
      return `src/scripts/${name}/${dependency}.js`;
    });

    if (files.length === 0) {
      done(new PluginError('gulpfile', `No files found for task ${name}`));
      return;
    }

    return gulp.src(files)
      .on('end', () => { log(`Sourcing ${files.join(', ')}.`); })
      .pipe(concat(`${name}.js`))
      .pipe(gulp.dest('dist/scripts'))
      .pipe(connect.reload());
  });

  gulp.task(`${name}:watch`, () => {
    return gulp.watch(`src/scripts/${name}/*.js`, gulp.series(name));
  });
});

// Fetch data task
gulp.task('data', (done) => {
  if (!fs.existsSync('./diverseui.json')) {
    return request('https://www.diverseui.com/images?domain=')
      .pipe(fs.createWriteStream('./diverseui.json'));
  }
  done();
});

// Task to copy non-watchable files
gulp.task('things-that-dont-need-to-be-watched', () => {
  return gulp.src('src/img/**/*', { base: 'src' })
    .pipe(gulp.dest('dist'));
});

// Task to copy sitemap
gulp.task('sitemap', () => {
  return gulp.src('sitemap.xml')
    .pipe(gulp.dest('dist'));
});

// Process templates
gulp.task('templates', gulp.series('data', () => {
  return gulp.src('src/*.html')
    .pipe(data((file) => {
      const images = require('./diverseui.json');
      return { images, filepath: file.path };
    }))
    .pipe(nunjucks.compile())
    .pipe(gulp.dest('dist'))
    .pipe(connect.reload());
}));

// Watch templates
gulp.task('templates:watch', () => {
  return gulp.watch('src/*.html', gulp.series('templates'));
});

// Compile Sass
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

// Watch Sass
gulp.task('sass:watch', () => {
  return gulp.watch('src/styles/**/*.scss', gulp.series('sass'));
});

// Build task
gulp.task('build', gulp.series(
  'templates', 
  'sass', 
  gulp.parallel(...jsFiles.map(({name}) => name), 'things-that-dont-need-to-be-watched', 'sitemap')
));

// Server setup
gulp.task('serve', () => {
  return connect.server({
    root: 'dist',
    livereload: true,
    port: 7890
  });
});

// Watch task
gulp.task('watch', gulp.parallel(
  'templates:watch', 
  'sass:watch', 
  ...jsFiles.map(({name}) => `${name}:watch`)
));

// Default task
gulp.task('default', gulp.series(
  'serve', 
  'build', 
  'watch'
));
