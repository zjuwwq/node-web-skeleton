var gulp = require("gulp");
var browserify = require("browserify");
var html2string = require("browserify-html2string");
var source = require("vinyl-source-stream");
var ignore = require("gulp-ignore");
var rm = require("gulp-rimraf");
var replace = require("gulp-replace");

gulp.task('cleanServer', function() {
	return gulp.src("dist/server")
		.pipe(rm());
});

gulp.task('copyServer', ['cleanServer'], function() {
	return gulp.src(["server/**"], {
		base: "server/"
	}).
	pipe(gulp.dest("dist/server"));
});

function updateView() {
	return gulp.src(["dist/server/view/**"])
		.pipe(replace(/\/js\/index\.js/g, '/js/bundle.js'))
		.pipe(gulp.dest("dist/server/view/"));
}

gulp.task('updateView0', ['copyServer'], function() {
	return updateView();
});

gulp.task('copyShareServer', ['updateView0'], function() {

});

gulp.task('server', ["copyShareServer"], function() {

});

gulp.task('cleanClient', function() {
	return gulp.src("dist/client")
		.pipe(rm());
});

gulp.task('copyClient', ['cleanClient'], function() {
	return gulp.src(["client/**"], {
		base: "client/"
	}).
	pipe(gulp.dest("dist/client"));
});

gulp.task('copyShareClient', ['copyClient'], function() {
	return gulp.src(["shared/service/**"], {
			base: "shared/service/"
		})
		.pipe(gulp.dest("dist/client/js/service"));
});
gulp.task('browserify', ['copyShareClient'], function() {
	return browserify(["./dist/client/js/index.js"], {
			debug: true
		})
		.transform(html2string)
		.bundle()
		.pipe(source("bundle.js"))
		.pipe(gulp.dest("dist"));
});
gulp.task('updateReference', ['browserify'], function() {
	return gulp.src(["dist/server/view/**"])
		.pipe(replace(/\/js\/index\.js/g, '/js/bundle.js'))
		.pipe(gulp.dest("dist/server/view/"));
});
gulp.task('cleanSource', ['updateReference'], function() {
	return gulp.src(["dist/client/js"], {
			read: false
		})
		.pipe(rm());
});
gulp.task('copyBundle', ['cleanSource'], function() {
	return gulp.src("dist/bundle.js")
		.pipe(gulp.dest("dist/client/js/"))
		.on('end', function() {
			return gulp.src("dist/bundle.js").
			pipe(rm());
		});
});
gulp.task('client', ['copyBundle'], function() {

});

gulp.task('copyView', function() {
	return gulp.src(["server/view/**"], {
			base: "server/view"
		})
		.pipe(gulp.dest("dist/server/view"));
});

gulp.task('updateView1', ['copyView'], function() {
	return updateView();
});
gulp.task('watch', function() {
	gulp.watch([
		"shared/**",
		"client/**"
	], ['client']);
	gulp.watch(["server/view/**"], ['updateView1']);
});
gulp.task('default', ['server', 'client', 'watch']);