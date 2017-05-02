/* eslint-env node */
module.exports = function(grunt) {
  // load all grunt tasks matching the ['grunt-*', '@*/grunt-*'] patterns
  require("load-grunt-tasks")(grunt, {pattern: ["grunt-*", "gruntify-*"]});

  grunt.initConfig({
    eslint: {
      src: ["src/*.js"]
    },

    clean: {
      dist: "dist"
    },

    copy: {
      js: {
        expand: true,
        cwd: "src",
        src: "**/*.{js,json}",
        dest: "dist"
      }
    },

    uglify: {
      options: {
        sourceMap: true
      },
      all: {
        expand: true,
        cwd: "dist",
        src: "**/*.js",
        dest: "dist",
        ext: ".min.js"
      }
    },

    "json-minify": {
      all: {
        files: "dist/**/*.json"
      }
    }
  });
  grunt.registerTask("default", ["eslint", "clean", "copy", "uglify", "json-minify"]);
};
