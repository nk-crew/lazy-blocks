const cfg = {};

// Build Paths.
cfg.src = '.';
cfg.dist = './dist';

// Browser sync.
cfg.browser_sync = {
  proxy: 'lazy-blocks.local',
};

// Compile SCSS files.
cfg.compile_scss_files_src = [
  '{src}/*assets/admin/style.scss',
  '{src}/*assets/admin/templates/style.scss',
  '{src}/*assets/admin/tools/style.scss',
  '{src}/*assets/editor/style.scss',
  '{src}/*assets/editor-constructor/style.scss',
];
cfg.compile_scss_files_rtl = true;

// Compile JS files.
cfg.compile_js_files_src = [
  '{src}/*assets/admin/index.js',
  '{src}/*assets/admin/templates/index.js',
  '{src}/*assets/admin/tools/index.js',
  '{src}/*assets/editor/index.js',
  '{src}/*assets/editor/translation.js',
  '{src}/*assets/editor-constructor/index.js',
  '{src}/*controls/**/*.js',
];

// Correct line endings files.
cfg.correct_line_endings_files_src = '{dist}/**/*.{js,css}';

// Watch files.
cfg.watch_js_files = [
  '{src}/assets/**/*.js',
  '{src}/controls/**/*.js',
  '{src}/**/*.scss',
  '!{src}/*vendor/**/*',
];

cfg.watch_scss_files = [
  '{src}/assets/**/*.scss',
  '{src}/controls/**/*.scss',
  '!{src}/*vendor/**/*',
];

module.exports = cfg;
