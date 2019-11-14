module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options : {
        ie8 : true,
        output : {
          ascii_only : true
        }
      },
      openpayJs: {
        src: 'lib/openpay.v1.js',
        dest: 'lib/openpay.v1.min.js'
      },
      openpayData: {
        src: 'lib/openpay-data.v1.js',
        dest: 'lib/openpay-data.v1.min.js'
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

};