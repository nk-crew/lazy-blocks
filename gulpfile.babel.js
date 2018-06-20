const gulp   = require('gulp');
const $      = require('gulp-load-plugins')();
const runSequence = require('run-sequence');
const data   = require('json-file').read('./package.json').data;
const del    = require('del');
const merge  = require('merge-stream');
const format = require('string-template');
const named = require('vinyl-named-with-path');
const webpack = require('webpack-stream');

const templateVars = data.gulp_config.variables;
const work_folders = template(data.gulp_config.work_folders);
const translate = template(data.gulp_config.translate);
const template_vars = template(data.gulp_config.template_vars);
const production_config = template(data.gulp_config.production);

const dist = templateVars.dist;

// run streams for each of theme items (theme and plugins)
function runStream (arr, func) {
    var streams = merge();

    for (var k = 0; k < arr.length; k++) {
        streams.add(func(arr[k]));
    }

    return streams.isEmpty() ? null : streams;
}

// template variable
function template (variable) {
    if (variable !== null && typeof variable === 'object' || Array.isArray(variable)) {
        for (var k in variable) {
            variable[k] = template(variable[k]);
        }
    }
    if (typeof variable === 'string') {
        variable = format(variable, templateVars);
    }
    return variable;
}

/**
 * Error Handler for gulp-plumber
 */
function errorHandler(err) {
    console.error(err);
    this.emit('end');
}

// clean dist folder
gulp.task('clean', function() {
    return del([dist + '/*']);
});


/**
 * Copy to Dist
 */
gulp.task('copy_to_dist', function () {
    return runStream(work_folders, function (itemData) {
        return gulp.src([itemData.from + '/**/*', '!' + itemData.from + '/**/*.{js,scss}'])
            .pipe(gulp.dest(itemData.to))
    });
});
gulp.task('copy_to_dist_vendors', function () {
    return runStream(work_folders, function (itemData) {
        return gulp.src(itemData.from + '/**/vendor/**/*')
            .pipe(gulp.dest(itemData.to))
    });
});
gulp.task('build_js', function () {
    return runStream(work_folders, function (itemData) {
        return gulp.src([itemData.from + '/**/*.js', '!' + itemData.from + '/**/vendor/**/*'])
            .pipe($.plumber({ errorHandler }))
            .pipe(named())
            .pipe(webpack({
                module: {
                    loaders: [
                        {
                            test: /.js$/,
                            loader: 'babel-loader',
                            exclude: /node_modules/
                        }
                    ]
                }
            }))
            // .pipe($.changed(itemData.to))
            .pipe($.uglify({
                output: {
                    comments: /^!/
                }
            }))
            .pipe($.rename({
                suffix: '.min'
            }))
            .pipe(gulp.dest(itemData.to))
    });
});
gulp.task('build_scss', function () {
    return runStream(work_folders, function (itemData) {
        return gulp.src([itemData.from + '/**/*.scss', '!' + itemData.from + '/**/vendor/**/*'])
            .pipe($.plumber({ errorHandler }))
            .pipe($.sass({
                outputStyle: 'compressed'
            }).on('error', $.sass.logError))
            .pipe($.autoprefixer({
                autoprefixer: {
                    browsers: [
                        'last 4 version',
                        '> 1%'
                    ]
                }
            }))
            .pipe($.rename({
                suffix: '.min'
            }))
            .pipe(gulp.dest(itemData.to))
    });
});
gulp.task('copy_to_dist_watch_php', function () {
    return runStream(work_folders, function (itemData) {
        return gulp.src(itemData.from + '/**/*.php')
            .pipe($.changed(itemData.to))
            .pipe(gulp.dest(itemData.to))
    });
});
gulp.task('copy_to_dist_watch_all', function () {
    return runStream(work_folders, function (itemData) {
        return gulp.src([itemData.from + '/**/*', '!' + itemData.from + '/**/*.{php,js,scss}'])
            .pipe($.changed(itemData.to))
            .pipe(gulp.dest(itemData.to))
    });
});
gulp.task('copy_to_dist_watch_vendors', function () {
    return runStream(work_folders, function (itemData) {
        return gulp.src(itemData.from + '/**/vendor/**/*')
            .pipe($.changed(itemData.to))
            .pipe(gulp.dest(itemData.to))
    });
});


/**
 * Consistent Line Endings for non UNIX systems
 */
gulp.task('correct_lines_ending', function () {
    // copy files to the dist folder
    return gulp.src([dist + '/**/*.js', dist + '/**/*.css'])
        .pipe($.plumber({ errorHandler }))
        .pipe($.lineEndingCorrector())
        .pipe(gulp.dest(dist));
});


/**
 * Update textdomain
 */
function updateTemplateVars (checkChanged) {
    checkChanged = checkChanged || false;

    return runStream(template_vars, function (itemData) {
        return gulp.src(itemData.from + '/**/*')
            .pipe($.plumber({ errorHandler }))
        // .pipe($.if(checkChanged, $.changed(itemData.from)))
            .pipe($.replaceTask({
                patterns: itemData.patterns
            }))
            .pipe(gulp.dest(itemData.from));
    });
}
gulp.task('update_template_vars', function () {
    return updateTemplateVars();
});
gulp.task('update_template_vars_watch', function () {
    return updateTemplateVars(true);
});


/**
 * WP POT Translation File Generator.
 */
gulp.task('translate', function () {
    return runStream(translate, function (itemData) {
        return gulp.src(itemData.from + '/**/*.php')
            .pipe($.plumber({ errorHandler }))
            .pipe($.sort())
            .pipe($.wpPot( {
                domain        : itemData.text_domain,
                package       : itemData.title,
                lastTranslator: itemData.author,
                team          : itemData.author
            }))
            .pipe(gulp.dest(itemData.from + '/languages/' + itemData.name + '.pot'));
    });
});


/**
 * Build Task [default]
 */
gulp.task('build', function(cb) {
    runSequence('clean', 'copy_to_dist', 'copy_to_dist_vendors', 'build_scss', 'build_js', 'correct_lines_ending', 'update_template_vars', 'translate', cb);
});
gulp.task('watch_build_php', function(cb) {
    runSequence('copy_to_dist_watch_php', 'update_template_vars_watch', 'translate', cb);
});
gulp.task('watch_build_all', function(cb) {
    runSequence('copy_to_dist_watch_all', cb);
});
gulp.task('watch_build_vendors', function(cb) {
    runSequence('copy_to_dist_watch_vendors', cb);
});


/**
 * Watch Task
 */
gulp.task('watch', ['build'], function() {
    for (var k = 0; k < work_folders.length; k++) {
        var itemData = work_folders[k];
        gulp.watch([itemData.from + '/**/*.php', '!' + itemData.from + '/*vendor/**/*'], ['watch_build_php']);
        gulp.watch([itemData.from + '/**/*.js', '!' + itemData.from + '/*vendor/**/*'], ['build_js']);
        gulp.watch([itemData.from + '/**/*.scss', '!' + itemData.from + '/*vendor/**/*'], ['build_scss']);
        gulp.watch([itemData.from + '/**/*', '!' + itemData.from + '/**/*.{php,js,scss}', itemData.from + '/*vendor/**/*'], ['watch_build_all']);
        gulp.watch(itemData.from + '/**/vendor/**/*', ['watch_build_vendors']);
    }
});


/**
 * Production Task
 */
gulp.task('production-zip', function(cb) {
    var taskNamesArray = [];
    production_config.forEach(function (item) {
        taskNamesArray.push('zip: ' + item.file_name);
        gulp.task( 'zip: ' + item.file_name, function () {
            if (Array.isArray(item.from)) {
                return runStream(item.from, function (itemData) {
                    if (Array.isArray(itemData)) {
                        return gulp.src(itemData[0], itemData[1] ? itemData[1] : {} );
                    } else {
                        return gulp.src(itemData);
                    }
                })
                    .pipe($.vinylZip.dest(item.to + '/' + item.file_name))
            } else {
                return gulp.src(item.from, { base: item.base })
                    .pipe($.vinylZip.dest(item.to + '/' + item.file_name))
            }
        });
    });

    runSequence.apply(null, taskNamesArray, cb);
});
gulp.task('production', function(cb) {
    runSequence('build', 'production-zip', cb);
});


/**
 * Set default task
 */
gulp.task('default', ['build']);
