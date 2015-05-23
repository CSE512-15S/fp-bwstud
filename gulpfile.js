var gulp 		= require('gulp');
var watch 		= require('gulp-watch');
var plumber 	= require('gulp-plumber');
var browsersync = require('browser-sync');
var uglify 		= require('gulp-uglify');
var concat 		= require('gulp-concat');
var rename 		= require("gulp-rename");
var sourcemaps 	= require('gulp-sourcemaps');
var sass 		= require('gulp-sass');
var prefixer 	= require('gulp-autoprefixer');
var minifycss 	= require('gulp-minify-css');


var reload = browsersync.reload;

var paths = {
	styles: "src/sass/**/*.scss",
	scripts: "src/js/*.js"
};

gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['js']);
    gulp.watch(paths.styles, ['sass']);
    gulp.watch(paths.images, ['images']);
    gulp.watch("./*.html").on('change', reload);
});

gulp.task('browser-sync', function() {
    browsersync.init({
        server: {
            baseDir: "./"
        }
    });
});


gulp.task('sass', function(){
	gulp.src(paths.styles)
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(prefixer({browsers: ['last 2 versions']}))
		.pipe(sourcemaps.write('./'))
		.pipe(rename({suffix: '.min'}))
		.pipe(minifycss())
		.pipe(gulp.dest('build/css'))
		.pipe(reload({stream: true}));
});

gulp.task('js', function(){
	return gulp.src('src/js/*.js')
		.pipe(sourcemaps.init())
		.pipe(concat('all.js'))
		.pipe(sourcemaps.write())
  		.pipe(gulp.dest('build/js'))
		.pipe(rename('all.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('build/js'));
});





gulp.task('default', ['sass', 'js', 'browser-sync','watch']);