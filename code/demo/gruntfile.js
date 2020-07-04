const sass = require("node-sass");
const bs = require("browser-sync").create();
// 实现这个项目的构建任务
module.exports = function (grunt) {
  require("load-grunt-tasks")(grunt);
  grunt.initConfig({
    clean: ['dist'],
    // babel 转码
    babel: {
      options: {
        sourceMap: true,
        presets: ["@babel/preset-env"],
      },
      dist: {
        expand: true, // Enable dynamic expansion.
        cwd: "src", // Src matches are relative to this path.
        src: ["assets/scripts/*.*"],
        dest: "dist", // Destination path prefix.
      },
    },
     // 文件copy
    copy: {
      dist: {
        expand: true, // Enable dynamic expansion.
        cwd: "public", // Src matches are relative to this path.
        src: ["*.*"],
        dest: "dist/public", // Destination path prefix.
      },
    },
    // html文件编译
    html_template: {
      options: {
        locals: {
          pkg: require("./package.json"),
        },
      },
      files: {
        expand: true, // Enable dynamic expansion.
        cwd: "src", // Src matches are relative to this path.
        src: ["*.html"],
        dest: "dist", // Destination path prefix.
      },
    },
    // 资源类文件处理
    imagemin: {
      dynamic: {
        files: [
          {
            expand: true,
            cwd: "src",
            src: ["assets/fonts/*.*", "assets/images/*.*"],
            dest: "dist",
          },
        ],
      },
    },
    // sass文件处理
    sass: {
      options: {
        implementation: sass,
        sourceMap: true,
      },
      dynamic: {
        files: [
          {
            expand: true,
            cwd: "src",
            src: ["**/*.scss", "!_*.scss"],
            dest: "dist",
            ext: ".css",
          },
        ],
      },
    },
    concat: {
    },
    // html里面文件引用处理
    useref: {
      html: "dist/*.html",
      temp: "dist",
    },
    // 监听任务配置
    watch: {
      // html文件
      htmls: {
        files: "src/**/*.html",
        tasks: ["html_template"],
        options: {
          // interrupt: true,
        },
      },
      // js文件
      scripts: {
        files: "src/**/*.js",
        tasks: ["babel"],
        options: {
          // interrupt: true,
        },
      },
      // 样式文件
      styles: {
        files: "src/**/*.scss",
        tasks: ["sass"],
        options: {
          // interrupt: true,
        },
      },
    },

  });
  // 注册连接文件任务
  grunt.registerTask('concat-file',function(){
    const config = grunt.config.get('concat');
    // 修复useref 插件 路径匹配异常问题 eg: /node_modules/**  => dist/node_modules/** */
    Object.keys(config).forEach(key => {
      config[key].forEach((p, i) => {
        let indexOf = p.indexOf('/node_modules/');
        if(indexOf > -1){
          config[key][i] = p.slice(indexOf + 1);
        }
      })
    })
    grunt.config.set('concat', config);
    console.log(grunt.config.get('concat'));
    grunt.task.run('concat');
  })
  // 替换 html 中的其他文件 useref插件会通过html中的配置 自动添加 concat uglify cssmin 等任务的配置 但是需要按顺序手动执行这些任务
  grunt.registerTask('ufm',['useref','concat-file', 'uglify', 'cssmin'])

  // 注册构建事件
  grunt.registerTask("build", [
    "clean",
    "babel",
    "sass",
    "html_template",
    "copy",
    "imagemin",
    "ufm",
  ]);

  // 注册开发环境任务
  grunt.registerTask("dev", [], () => {
    // 触发基础编译
    grunt.task.run("babel");
    grunt.task.run("html_template");
    grunt.task.run("sass");
    grunt.task.run("imagemin");
    // 开启http服务  目前服务开启很慢 需要找下原因
    bs.init({
      open: true,
      ui: false,
      notify: false,
      // 监听文件变化目录
      files: ["dist"],
      server: {
        // 服务的基础目录
        baseDir: "dist",
        // 静态资源映射
        routes: {
          "/node_modules": "node_modules",
          "/public": "public",
        },
      },
    });
    // 触发监听任务
    grunt.task.run("watch");
  });

};