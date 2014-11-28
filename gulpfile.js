var gulp = require("gulp");
var browserify = require("browserify");
var browserifyEjs = require("browserify-ejs");
var source = require("vinyl-source-stream");

gulp.task('js', function() {
	gulp.src(["shared/service/**"], {base: "shared/service/"})
		.pipe(gulp.dest("server/service/"))
		.pipe(gulp.dest("client/js/service/"));
	gulp.src(["shared/view/**"], {base: "shared/view/"})
		.pipe(gulp.dest("server/view/partial/"))
		.pipe(gulp.dest("client/view/"));
	browserify(["./client/js/index.js"], {debug: true})
		.transform(browserifyEjs)
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