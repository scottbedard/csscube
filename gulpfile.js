// Get modules
var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');

gulp.task('css', function () {
	// Main style
	gulp.src('cube.scss')
		.pipe( sass() )
		.pipe( autoprefixer('last 10 version') )
		.pipe( gulp.dest('') );
});

gulp.task('watch', function () {
	gulp.watch('*.scss', ['css']);
});

gulp.task('default', ['watch']);