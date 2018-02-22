const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminZopfli = require('imagemin-zopfli');
const imageminMozjpeg = require('imagemin-mozjpeg'); //need to run 'brew install libpng'
const imageminGiflossy = require('imagemin-giflossy');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync');
const connect = require('gulp-connect-php');
// const uncss = require('gulp-uncss');


// Compress All Images
gulp.task('imagemin', () =>
    gulp.src('src/images/**/*')
        .pipe(imagemin([
            //png
            imageminPngquant({
                speed: 1,
                quality: 98 //lossy settings
            }),
            imageminZopfli({
                more: true
            }),
            //gif
            // imagemin.gifsicle({
            //     interlaced: true,
            //     optimizationLevel: 3
            // }),
            //gif very light lossy, use only one of gifsicle or Giflossy
            imageminGiflossy({
                optimizationLevel: 3,
                optimize: 3, //keep-empty: Preserve empty transparent frames
                lossy: 2
            }),
            //svg
            imagemin.svgo({
                plugins: [{
                    removeViewBox: false
                }]
            }),
            //jpg lossless
            imagemin.jpegtran({
                progressive: true
            }),
            //jpg very light lossy, use vs jpegtran
            imageminMozjpeg({
                quality: 90
            })
        ]))
        .pipe(gulp.dest('dist/images'))
);

// Copy All HTML files / browserSync
gulp.task('copyHtml', function(){
	gulp.src('src/**/*.html')
		.pipe(gulp.dest('dist'))
		.pipe(browserSync.stream())
});


// SASS -> CSS / AUTOPREFIXERS / SOURCEMAPS / MIN
gulp.task('sass', function(){
	gulp.src('src/sass/main.scss')
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: [
				'last 3 chrome versions',
				'last 3 firefox versions',
				'last 3 opera versions',
				'last 3 safari versions',
				'last 3 ios versions',
				'android >= 4.0',
				'ie >= 10'
			]
		}))
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest('dist/css'))
		.pipe(browserSync.stream())

});

// UNCSS - not included in watch
// gulp.task('uncss', function(){
// 	gulp.src('src/sass/main.sass')
// 		.pipe(sourcemaps.init())
// 		.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
// 		.pipe(uncss({
// 			html: ['dist/index.html']
// 		}))
// 		.pipe(autoprefixer({
// 			browsers: [
// 				'last 3 chrome versions',
// 				'last 3 firefox versions',
// 				'last 3 opera versions',
// 				'last 3 safari versions',
// 				'last 3 ios versions',
// 				'android >= 4.0',
// 				'ie >= 10'
// 			]
// 		}))
// 		.pipe(sourcemaps.write('./maps'))
// 		.pipe(gulp.dest('dist/css'))
// 		.pipe(browserSync.stream())

// });

// Scripts concat
gulp.task('scripts', function(){
	gulp.src('src/js/*.js')
		.pipe(sourcemaps.init())
		.pipe(concat('main.js'))
		.pipe(uglify())
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest('dist/js'))
		.pipe(browserSync.stream())
});

//Browser Sync
gulp.task('browserSync', function(){
	browserSync.init({
		server: {
			baseDir: 'dist'
		}
	})

});

gulp.task('default',['copyHtml', 'imagemin', 'sass', 'scripts', 'browserSync']);


gulp.task('watch', ['copyHtml', 'sass', 'scripts'], function(){
	gulp.watch('src/js/*.js', ['scripts']).on('change', browserSync.reload);
	gulp.watch('src/images/*', ['imageMin']);
	gulp.watch('src/sass/*.scss', ['sass']).on('change', browserSync.reload);
	gulp.watch('src/*.html', ['copyHtml']).on('change', browserSync.reload);
});