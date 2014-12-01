var gulp = require("gulp");
var browserify = require("browserify");
var html2string = require("browserify-html2string");
var source = require("vinyl-source-stream");

gulp.task('js', function() {
	gulp.src(["shared/service/**"], {base: "shared/service/"})
		.pipe(gulp.dest("server/service/"))
		.pipe(gulp.dest("client/js/service/"));
	browserify(["./client/js/index.js"], {debug: true})
		.transform(html2string)
		.bundle()
		.pipe(source("bundle.js"))
		.pipe(gulp.dest("client/js/"));

});
gulp.task('watch', function() {
	gulp.watch([
		"shared/**",
		"client/js/**/*.js",
		"!client/js/bundle.js"
	], ['js']);
});
gulp.task('default', ['watch', 'js']);