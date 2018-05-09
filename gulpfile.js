var gulp = require('gulp'),
    browserSync = require('browser-sync'),
    newer = require('gulp-newer'),
    imagemin = require('gulp-imagemin'),
    svgstore = require('gulp-svgstore'),
    svgmin = require('gulp-svgmin'),
    cheerio = require('gulp-cheerio'),
    inject = require('gulp-inject'),
    path = require('path'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    del = require('del'),
    autoprefixer = require('gulp-autoprefixer'),
    ts = require('gulp-typescript'),
    tslint = require("gulp-tslint"),
    typedoc = require("gulp-typedoc"),
    browserify  = require('browserify'),
    tsify       = require('tsify'),
    vinylsourcestream = require('vinyl-source-stream'),
    vinylbuffer = require('vinyl-buffer'),
    apidoc = require('gulp-apidoc');

var config = {
    project: '/',
    bower: 'bower_components/',
    src: {
        app: 'src/js/app.ts',
        appbundle: 'src/js/bundle.js',
        root: 'src/',
        jsroot: 'src/js',
        ts: 'src/js/**/*.ts',
        js: 'src/js/**/*.js',
        scss: 'src/scss/**/*.scss',
        css: 'src/css',
        fonts: 'src/fonts/**',
        partials: 'src/js/components/**/*.html',
        partials_sass: 'src/js/components/**/*.scss',
        images: 'src/images/**',
        languages: 'src/languages/**'
    },
    dist: {
        root: 'dist/',
        js: 'dist/js/',
        css: 'dist/css/',
        fonts: 'dist/fonts/',
        images: 'dist/images/',
        languages: 'dist/languages/',
        partials: 'dist/js/components/'
    }
};

var sassOptions = {
    errLogToConsole: true,
    outputStyle: 'expanded'
};

var tsProject = ts.createProject('tsconfig.json');

function showError (error) {
    console.log(error.toString());
    this.emit('end');
}

gulp.task('apidoc', function(done){
    apidoc({
        src: "routes/",
        dest: "docs/api/"
    },done);
});

gulp.task('clean:dist', function () {
    return del([
        'dist/*'
    ]);
});

gulp.task('sass', function() {
    return gulp.src(config.src.scss)
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest(config.src.css))
        .pipe(gulp.dest(config.dist.css));
});


gulp.task("ts-lint", function() {
    return gulp.src(config.src.ts)
        .pipe(tslint({
            formatter: "prose"
        }))
        .pipe(tslint.report({
            summarizeFailureOutput: true
        }))
});


gulp.task("typescripts", function () {
    return gulp.src(config.src.ts)
        .pipe(tsProject())
        .pipe(gulp.dest('src/js/'));
});


gulp.task('javascripts', function() {
    return gulp.src('src/js/bundle.js')
        //.pipe(rename('main.min.js'))
        .pipe(gulp.dest(config.dist.js));
});


gulp.task('images', function() {
    return gulp.src(config.src.images)
        .pipe(newer(config.dist.images))
        //.pipe(imagemin())
        .pipe(gulp.dest(config.dist.images));
});

gulp.task('copy-index-html', function() {
    return gulp.src('src/index.html')
        //.pipe(rename("index.html"))
        .pipe(gulp.dest(config.dist.root));
});

gulp.task('copy-json', function() {
    return gulp.src('src/*.json')
        .pipe(gulp.dest(config.dist.root));
});

gulp.task('copy-images', function () {
    return gulp.src(config.src.images)
        .pipe(gulp.dest(config.dist.images))
});

gulp.task('copy-partials-html', function() {
    return gulp.src(config.src.partials)
        .pipe(gulp.dest(config.dist.partials));
});

gulp.task('copy-languages', function () {
    return gulp.src(config.src.languages)
        .pipe(gulp.dest(config.dist.languages))
});


gulp.task('copy-fonts', function () {
    return gulp.src(config.src.fonts)
        .pipe(gulp.dest(config.dist.fonts))
});


gulp.task('svg-store', function () {
    var svgs = gulp
        .src(config.src.icons)
        .pipe(svgmin(function (file) {
            var prefix = path.basename(file.relative, path.extname(file.relative));
            return {
                plugins: [{
                    cleanupIDs: {
                        prefix: prefix + '-',
                        minify: true
                    }
                }]
            }
        }))
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
            },
            parserOptions: { xmlMode: true }
        }))
        .pipe(svgstore({ inlineSvg: true }));
    function fileContents (filePath, file) {
        return file.contents.toString();
    }
    return gulp
        .src('./src/layout/partials/svg-icons.nunjucks')
        .pipe(inject(svgs, { transform: fileContents }))
        .pipe(gulp.dest('./src/layout/partials/'));
});


gulp.task('watch', function() {
    gulp.watch(config.src.scss, gulp.series('sass'));
    gulp.watch(config.src.js, gulp.series('javascripts' )).on('change', browserSync.reload);
    gulp.watch(config.src.images, gulp.series('images'));
});

gulp.task('watchreload', function() {
    gulp.watch('./src/scss/*.scss', gulp.series('visitrackersass'));
    gulp.watch('./src/js/components/**/*.scss', gulp.series('visitrackersass'));
    gulp.watch('./src/css/main*.css').on('change', browserSync.reload);
    gulp.watch('./src/js/**/*.js').on('change', browserSync.reload);
    gulp.watch(['./src/js/components/*.html', './www/js/components/*.html']).on('change', browserSync.reload);
});


gulp.task('browserSync', function() {
    return browserSync({
        open: false,
        server: {
            baseDir: "src",
            index: "index.html"
        },
        watchOptions: {
            debounceDelay: 1000
        }
    });
});

gulp.task("typedoc", function() {
    return gulp
        .src(["src/js/**/*.ts"])
        .pipe(typedoc({
            module: "commonjs",
            target: "es5",
            out: "docs/",
            name: "Talkwall client"
        }))
        ;
});

gulp.task('browserify', function () {
    return browserify(['./src/js/app.ts'])
        .plugin(tsify, { noImplicitAny: true })
        .bundle()
        .pipe(vinylsourcestream('bundle.js'))
        .pipe(vinylbuffer())
        .pipe(gulp.dest('src/js/'));
});

gulp.task('uglify', function () {
    return gulp.src(config.src.appbundle)
        .pipe(uglify())
        .pipe(gulp.dest(config.src.jsroot));
});

gulp.task('dev', gulp.series('sass', 'browserify'));
gulp.task('watchsass', gulp.series('sass', gulp.parallel('browserSync', 'watch')));
// gulp.task('default', gulp.series('clean:dist', 'sass', 'browserify', 'javascripts', 'images', 'copy-index-html', 'copy-images', 'copy-partials-html', 'copy-languages', 'copy-fonts', 'copy-json', 'typedoc', 'apidoc'));
gulp.task('default', gulp.series('clean:dist', 'sass', 'browserify', 'javascripts', 'images', 'copy-index-html', 'copy-images', 'copy-partials-html', 'copy-languages', 'copy-fonts', 'copy-json', 'apidoc'));