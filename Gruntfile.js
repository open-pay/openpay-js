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
        dest: 'lib/openpay.v1.min.js',
        options : {
          banner: '/*! openpay.js v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */'
        }
      },
      openpayData: {
        src: 'lib/openpay-data.v1.js',
        dest: 'lib/openpay-data.v1.min.js',
        options : {
          banner: '/*! openpay-data.js v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');

};