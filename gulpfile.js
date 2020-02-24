'use strict';

const gulp = require('gulp');

const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
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

const paths = {
	src: './src/', // paths.src
	build: './dist/', // paths.build
};

function styles() {
	return gulp
		.src(paths.src + 'scss/main.scss')
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(sassGlob())
		.pipe(sass()) // { outputStyle: 'compressed' }
		.pipe(groupMediaQueries())
		.pipe(postcss([autoprefixer({ browsers: ['last 2 version'] })]))
		.pipe(cleanCSS())
		.pipe(rename('style.min.css'))
		.pipe(sourcemaps.write('/maps/'))
		.pipe(gulp.dest(paths.build + 'css/'));
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
		.pipe(gulp.dest(paths.build + 'img/'));
}

function scripts() {
	return gulp
		.src(paths.src + 'js/*.js')
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(
			babel({
				presets: ['env'],
			})
		)
		.pipe(uglify())
		.pipe(concat('script.min.js'))
		.pipe(sourcemaps.write('/maps/'))
		.pipe(gulp.dest(paths.build + 'js/'));
}

function scriptsVendors() {
	return gulp
		.src([
			'node_modules/jquery/dist/jquery.min.js',
			'node_modules/popper.js/dist/popper.min.js',
			'node_modules/bootstrap/dist/js/bootstrap.min.js',
		])
		.pipe(concat('vendors.min.js'))
		.pipe(gulp.dest(paths.build + 'js/'));
}

function htmls() {
	return gulp
		.src(paths.src + '*.html')
		.pipe(plumber())
		.pipe(replace(/\n\s*<!--DEV[\s\S]+?-->/gm, ''))
		.pipe(gulp.dest(paths.build));
}

function images() {
	return gulp
		.src(paths.src + 'img/*.{jpg,jpeg,png,gif,svg}')
		.pipe(imagemin())
		.pipe(gulp.dest(paths.build + 'img/'));
}

// Fonts
function fonts() {
	return gulp
		.src(['node_modules/font-awesome/css/font-awesome.min.css'])
		.pipe(gulp.dest(paths.build + 'fonts/'));
}

function clean() {
	return del(paths.build);
}

function watch() {
	gulp.watch(paths.src + 'scss/**/*.scss', styles);
	gulp.watch(paths.src + 'js/**/*.js', scripts);
	gulp.watch(paths.src + '*.html', htmls);
}

function serve() {
	browserSync.init({
		server: {
			baseDir: paths.build,
		},
	});
	browserSync.watch(paths.build + '**/*.*', browserSync.reload);
}

exports.styles = styles;
exports.scripts = scripts;
exports.scriptsVendors = scriptsVendors;
exports.htmls = htmls;
exports.images = images;
exports.svgSprite = svgSprite;
exports.fonts = fonts;
exports.clean = clean;
exports.watch = watch;

gulp.task(
	'build',
	gulp.series(
		clean,
		gulp.parallel(styles, svgSprite, scripts, scriptsVendors, htmls, images, fonts)
	)
);

gulp.task(
	'default',
	gulp.series(
		clean,
		gulp.parallel(styles, svgSprite, scripts, scriptsVendors, htmls, images, fonts),
		gulp.parallel(watch, serve)
	)
);
