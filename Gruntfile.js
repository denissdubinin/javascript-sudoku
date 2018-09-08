module.exports = function (grunt) {
'use strict';

    grunt.initConfig({
    
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! Javascript Sudoku v<%= pkg.version %> by Deniss Dubinin - ' +
            'https://github.com/denissdubinin/Javascript-Sudoku - Licensed MIT */\n',
        uglify: {
            options: {
                banner: '<%= banner %>',
                output: {
                    beautify: false
                }
            },
            dist: {
                files: {
                    'dist/sudoku.min.js': 'src/sudoku.js'
                }
            }
        },
        sass: {
            options: {
                noCache: true,
                style: 'compressed',
                banner: '<%= banner %>'
            },
            dist: {
                files: {
                    'dist/sudoku.min.css': 'src/sudoku.scss'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify-es');
    grunt.loadNpmTasks('grunt-contrib-sass');

    grunt.registerTask('styles', ['sass']);
    grunt.registerTask('compile', ['uglify', 'sass']);
};
