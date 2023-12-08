'use strict';
const gulp = require('gulp');
const browsersync = require('browser-sync').create();
const htmlinlcude = require('gulp-html-tag-include');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const changed = require('gulp-changed');
const del = require('del');

const paths = {
	port:'5500',
	input:'./src/**/*',
	output:'./dist/',
	html: {
		input: './src/dev/html/**/**/**',
		output: './dist/dev/html'
	},
	style:{
		input:'./src/dev/ui/scss/**/*.scss',
		output:'./dist/dev/ui/css'
	},
	js: {
		input : './src/dev/ui/js/**/**/*.js',
		output : './dist/dev/ui/js'
	},
	font:{
		input:'./src/dev/ui/fonts/**/*',
		output:'./dist/dev/ui/fonts'
	},
	img:{
		input:'./src/dev/ui/images/**/**',
		output:'./dist/dev/ui/images'
	},
	lang_eng:{
		input:'./src/dev/ui/en/**/**',
		output:'./dist/dev/ui/en'
	},
	lang_jp:{
		input:'./src/dev/ui/jp/**/**',
		output:'./dist/dev/ui/jp'
	},
	filelist:{
		input: './src/*.html',
		output: './dist/'
	}
};

//browser-sync
function browserSync(done) {
	console.log("start sync...");
	browsersync.init({
		port:paths.port,
		server:{
			baseDir: paths.output
		},
		// startPath:'dev/html/index.html'
		startPath:'./index.html' //gulp 실행 시 로드 화면
	})
	done();
}

//gulp-html-tag-include
function htmlComp() {
	return gulp.src(paths.html.input)
	.pipe(htmlinlcude())
	.pipe(gulp.dest(paths.html.output))
	.pipe(browsersync.reload({stream:true}));
}

//scss
function sassComp(done) {
	gulp.src(paths.style.input, {sourcemaps: true})
	.pipe(sass.sync().on('error', sass.logError))
	.pipe(sass({outputStyle:'expanded'}))
	.pipe(sourcemaps.write())
	.pipe(gulp.dest(paths.style.output))
	.pipe(browsersync.reload({stream:true}));
	// 압축버전
	gulp.src(paths.style.input, {sourcemaps: true})
	.pipe(sass.sync().on('error', sass.logError))
	.pipe(sass({outputStyle:'compressed'}))
	.pipe(gulp.dest(paths.style.output+'/min'));
	done();
}

//js
function js() {
	return gulp.src(paths.js.input)
	.pipe(gulp.dest(paths.js.output))
	.pipe(browsersync.reload({stream:true}));
}

//images
function img() {
	return gulp.src(paths.img.input)
	.pipe(gulp.dest(paths.img.output))
	.pipe(browsersync.reload({stream: true}));
}

//fonts
function font() {
	return gulp.src(paths.font.input)
	.pipe(gulp.dest(paths.font.output))
	.pipe(browsersync.reload({stream:true}));
}

//lang-en
function lang_en() {
	return gulp.src(paths.lang_eng.input)
	.pipe(gulp.dest(paths.lang_eng.output))
	.pipe(browsersync.reload({stream:true}));
}

//lang-en
function lang_jp() {
	return gulp.src(paths.lang_jp.input)
	.pipe(gulp.dest(paths.lang_jp.output))
	.pipe(browsersync.reload({stream:true}));
}

//filelist를 위한
function filelist() {
	return gulp.src(paths.filelist.input)
	.pipe(htmlinlcude())
	.pipe(gulp.dest(paths.filelist.output))
	.pipe(browsersync.reload({stream:true}));
}

function watchFiles() {
	gulp.watch(paths.html.input, htmlComp);
	gulp.watch(paths.style.input, sassComp);
	gulp.watch(paths.js.input, js);
	gulp.watch(paths.font.input, font);
	gulp.watch(paths.img.input, img);
	gulp.watch(paths.lang_eng.input, lang_en);
	gulp.watch(paths.lang_jp.input, lang_jp);
	gulp.watch(paths.filelist.input, filelist);
}

// export tasks
exports.default = gulp.series(gulp.parallel(htmlComp, sassComp, js, font, img, lang_en, lang_jp, filelist), browserSync, watchFiles);