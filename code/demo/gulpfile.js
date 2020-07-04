const { src, dest, series, parallel, watch } = require("gulp");
const $ = require("gulp-load-plugins")();
const bs = require("browser-sync").create();
// 基础
let config = {
  build: {
    styles: ["src/**/*.scss", "!src/**/_*.scss"],
    assets: ["src/**/*.*", "!src/**/*.{scss,css,html,js}"],
    scripts: "src/**/*.js",
    htmls: "src/*.html",
    public: "public/*",
  },
  dest: "dist",
  cwd: process.cwd(),
};

const bdCfg = config.build;
// 编译样式
const styles = () => {
  return src(bdCfg.styles, { cwd: config.cwd })
    .pipe($.sass())
    .pipe(dest(config.dest));
};
// 资源处理
const assets = () => {
  return src(bdCfg.assets, { cwd: config.cwd })
    .pipe($.imagemin())
    .pipe(dest(config.dest));
};

// 脚本处理
const scripts = () => {
  return src([bdCfg.scripts], { cwd: config.cwd })
    .pipe(
      $.babel({
        presets: ["@babel/preset-env"],
      })
    )
    .pipe(dest(config.dest));
};

const htmls = () => {
  return src(bdCfg.htmls, { cwd: config.cwd })
    .pipe(
      $.swig({
        defaults: { cache: false },
        data: {
          pkg: require("./package.json"),
        },
      })
    )
    .pipe(dest(config.dest));
};

//
const useref = () => {
  return src([config.dest + "/*.html"], { base: config.dest })
    .pipe($.userefMin({ searchPath: [config.dest, process.cwd()] }))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cssmin()))
    .pipe(dest(config.dest));
};

const compile = parallel(styles, series(htmls, useref), scripts);

const clean = () => {
  return src(config.dest, { allowEmpty: true }).pipe($.clean({read: false}));
};

const copy = () => {
  return src(bdCfg.public, {}).pipe($.copy(config.dest));
};

const build = series(clean, parallel(compile, assets, copy));

const serve = () => {
  watch(bdCfg.htmls, htmls);
  watch(bdCfg.scripts, scripts);
  watch(bdCfg.styles, styles);
  watch(bdCfg.assets, assets);
  bs.init({
    open: true,
    port: 2000,
    files: [config.dest],
    server: {
      baseDir: config.dest,
      routes: {
        "/node_modules": "node_modules",
        "/public": "public",
      },
    },
  });
};
const dev = series(parallel(compile, assets), serve);

module.exports = {
  assets,
  copy,
  styles,
  scripts,
  htmls,
  clean,
  useref,
  dev,
  serve,
  build,
};
