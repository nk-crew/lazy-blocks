// eslint-disable-next-line import/no-extraneous-dependencies
const pkg = require( 'json-file' ).read( './package.json' ).data;

const cfg = {};

// Build Paths.
cfg.name = 'lazy-blocks';
cfg.src = './src';
cfg.dist_root = './dist';
cfg.dist = '{dist_root}/{name}';

// Browser sync.
cfg.browser_sync = {
    proxy: '{name}.local',
};

// Template variables that will be automatically replaced.
cfg.template_files_src = '{dist}/**/*.{md,php,js,css,pot,json}';
cfg.template_files_variables = {
    text_domain: pkg.name,
    plugin_version: pkg.version,
    plugin_name: pkg.name,
    plugin_title: pkg.title,
    plugin_author: pkg.author,
};

// Copy files.
cfg.copy_files_src = [
    '{src}/**/*',
    '!{src}/**/*.{js,scss}',
    '{src}/**/vendor/**/*.{js,scss}',
];

// Compile SCSS files.
cfg.compile_scss_files_src = [
    '{src}/**/*.scss',
    '!{src}/**/vendor/**/*',
];
cfg.compile_scss_files_rtl = true;

// Compile JS files.
cfg.compile_js_files_src = [
    '{src}/*assets/js/index.js',
    '{src}/*assets/js/translation.js',
    '{src}/*assets/admin/constructor/index.js',
    '{src}/*assets/admin/templates/index.js',
    '{src}/*assets/admin/tools/index.js',
    '{src}/*controls/**/*.js',
];

// Correct line endings files.
cfg.correct_line_endings_files_src = '{dist}/**/*.{js,css}';

// ZIP files.
cfg.zip_files = [
    {
        src: '{dist}/**/*',
        src_opts: {
            base: '{dist_root}',
        },
        dist: '{dist_root}/{name}.zip',
    },
];

// Watch files.
cfg.watch_files = [ '{src}/**/*', '!{src}/**/*.{js,scss}' ];

cfg.watch_js_files = [ '{src}/**/*.js', '{src}/**/*.scss', '!{src}/*vendor/**/*' ];

cfg.watch_scss_files = '{src}/**/*.scss';

module.exports = cfg;
