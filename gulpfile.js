'use strict';

const gulp = require('gulp');

const sass = require('gulp-sass');
const groupMediaQueries = require('gulp-group-css-media-queries');
const cleanCSS = require('gulp-cleancss');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');

const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');

const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const replace = require('gulp-replace');
const del = require('del');
const plumber = require('gulp-plumber');
const browserSync = require('browser-sync').create();

const svgstore = require('gulp-svgstore');
const svgmin = require('gulp-svgmin');
const imagemin = require('gulp-imagemin');

const cssMinFile = 'style.min.css';
const jsMinFile = 'script.min.js';
const jsVendorMinFile = 'vendors.min.js';
const srcImgs = 'img/*.{jpg,jpeg,png,gif,svg}';
const srcJS = [
	'node_modules/jquery/dist/jquery.js',
	'node_modules/popper.js/dist/popper.js',
	'node_modules/bootstrap/dist/js/bootstrap.js',
	'js/**/*.js',
];

const paths = {
	src: 'src/',
	dist: 'dist/',
	srcSCSS: 'scss/**/*.scss',
};

function styles() {
	return gulp
		.src(paths.src + paths.srcSCSS)
		.pipe(sourcemaps.init())
		.pipe(plumber())
		.pipe(sass())
		.pipe(groupMediaQueries())
		.pipe(postcss([autoprefixer({ browsers: ['last 2 version'] })]))
		.pipe(concat(cssMinFile))
		.pipe(cleanCSS())
		.pipe(rename(cssMinFile))
		.pipe(sourcemaps.write('/maps/'))
		.pipe(gulp.dest(paths.dist + 'css/'));
}

function svgSprite() {
	return gulp
		.src(paths.src + 'svg/*.svg')
		.pipe(
			svgmin(function(file) {
				return {
					plugins: [
						{
							cleanupIDs: {
								minify: true,
							},
						},
					],
				};
			})
		)
		.pipe(svgstore({ inlineSvg: true }))
		.pipe(rename('sprite-svg.svg'))
		.pipe(gulp.dest(paths.dist + 'img/'));
}

function scripts() {
	return gulp
		.src(paths.src + srcJS)
		.pipe(sourcemaps.init())
		.pipe(plumber())
		.pipe(
			babel({
				presets: ['env'],
			})
		)
		.pipe(uglify())
		.pipe(concat(jsMinFile))
		.pipe(sourcemaps.write('/maps/'))
		.pipe(gulp.dest(paths.dist + 'js/'));
}

function scriptsVendors() {
	return gulp
		.src(['node_modules/jquery/dist/jquery.min.js'])
		.pipe(sourcemaps.init())
		.pipe(concat(jsVendorMinFile))
		.pipe(sourcemaps.write('/maps/'))
		.pipe(gulp.dest(paths.dist + 'js/'));
}

function htmls() {
	return gulp
		.src(paths.src + '*.html')
		.pipe(plumber())
		.pipe(gulp.dest(paths.dist));
}

function images() {
	return gulp
		.src(paths.src + srcImgs)
		.pipe(imagemin())
		.pipe(gulp.dest(paths.dist + 'img/'));
}

function clean() {
	return del(paths.dist);
}

function watch() {
	gulp.watch(paths.src + paths.srcSCSS, styles);
	gulp.watch(paths.src + srcJS, scripts);
	gulp.watch(paths.src + '*.html', htmls);
}

function serve() {
	browserSync.init({
		server: {
			baseDir: paths.dist,
		},
	});
	browserSync.watch(paths.dist + '**/*.*', browserSync.reload);
}

exports.styles = styles;
exports.scripts = scripts;
exports.scriptsVendors = scriptsVendors;
exports.htmls = htmls;
exports.images = images;
exports.svgSprite = svgSprite;
exports.clean = clean;
exports.watch = watch;

gulp.task(
	'dist',
	gulp.series(clean, gulp.parallel(styles, svgSprite, scripts, scriptsVendors, htmls, images))
);

gulp.task(
	'default',
	gulp.series(
		clean,
		gulp.parallel(styles, svgSprite, scripts, scriptsVendors, htmls, images),
		gulp.parallel(watch, serve)
	)
);
