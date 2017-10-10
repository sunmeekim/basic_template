'use strict';
var Mustache = require("mustache");
var _ = require('lodash');

module.exports = function(grunt) {
	//load grunt plugins
	require('jit-grunt')(grunt, {
		sprite:'grunt-spritesmith',
		includereplace:'grunt-include-replace'
	});

	//display the elapsed execution time of grunt tasks
	require('time-grunt')(grunt);

	//project configuration
	grunt.initConfig({
		//css file name
		CSS_NAME : 'project-name',
		CSS_STATIC_NAME : 'project-name',

		//for dist files static_dir
		PUBLIC_DIR:'',
		BASE_DIR:'',
		HTML_DIR:'',
		BUILD_DIR:'',
		IMG_DIR:'',

		pkg: grunt.file.readJSON('package.json'),
		banner: '/*!  <%= pkg.title || pkg.name %> - v<%= pkg.version %> ' + grunt.util.linefeed + '<%= pkg.author.name %>' + grunt.util.linefeed + ' */' + grunt.util.linefeed,

		//Task configuration
		clean: {
			options: {
				force: true
			},
			public: [
				'<%= PUBLIC_DIR %>/images',
				'<%= PUBLIC_DIR %>/css/**/*'
			],
			html_build:[
				'<%= BUILD_DIR %>'
			]
		},
		includereplace: {
			html: {
				options: {
					includeDir:'<%= HTML_DIR %>/include/',
					docroot:'../'
				},
				expand: true,
				cwd: '<%= HTML_DIR %>/',
				src: ['**/*.html'],
				dest: '<%= BUILD_DIR %>/'
			}
		},
		
		markupfileindex: {
			options: {
				show_data: true,
				filename: 'index.html',
				title : '프로젝트명 마크업 산출물',
				include_folder: ['includes','inc','testInc'],
				file_sort: 'asc',
				file_sort_key: 'title',
				group_sort: 'asc'
			},
			index: {
				files:[{
					expand: true,
					cwd : '<%= BUILD_DIR %>',
					src: ['**/*.html','!**/node_modules/**','!**/.*/**'],
					dest:'<%= BUILD_DIR %>'
				}]
			}
		},

		sprite: {
			spr_img: {
				src: ['./markup/img/spr_img/*.png'],
				dest: '<%= PUBLIC_DIR %>/images/spr_img.png',
				imgPath: '../images/spr_img.png',
				destCss: './markup/sass/sprites/_spr_img.scss',
				padding: 4,
				cssSpritesheetName: 'spr_img'
			},

			spr_img_2x: {
				src: ['./markup/img/spr_img/2x/*.png'],
				dest: '<%= PUBLIC_DIR %>/images/spr_img_2x.png',
				imgPath: '../images/spr_img_2x.png',
				destCss: './markup/sass/sprites/_spr_img_2x.scss',
				padding: 4,
				cssSpritesheetName: 'spr_img_2x'
			},
		},

		sass: {
			options: {
				outputStyle:'compressed',
				sourceMap: !grunt.option('no-map')
			},
			pc: {
				files: {
					'<%= PUBLIC_DIR %>/css/<%= CSS_NAME %>.css': './markup/sass/<%= CSS_NAME %>.scss',
					'<%= PUBLIC_DIR %>/css/<%= CSS_STATIC_NAME %>.css': './markup/sass/<%= CSS_STATIC_NAME %>.scss'
				}
			}
		},

		postcss: {
			options: {
				map: !grunt.option('no-map'),
				processors: [
					require('autoprefixer')(),
					require('css-mqpacker')()
				]
			},

			pc: {
				src:
				[
					'<%= PUBLIC_DIR %>/css/**/*.css'
				]
			}
		},

		cssmin: {
			options: {
				advanced: true,
				aggressiveMerging: false,
				compatibility: 'ie9',
				keepSpecialComments: 0,
				mediaMerging: false,
				restructuring: false,
				shorthandCompacting: false,
				sourceMap: !grunt.option('no-map')
			},

			pc: {
				files: {
					'<%= PUBLIC_DIR %>/css/<%= CSS_NAME %>.css': [
						'./markup/sass/common/_dummy_charset.scss',
						'<%= PUBLIC_DIR %>/css/<%= CSS_NAME %>.css'
					]
					// '<%= PUBLIC_DIR %>/css/pc/editor_template.css': [
					//     './develop/markup/sass/common/_dummy_charset.scss',
					//     '<%= PUBLIC_DIR %>/css/pc/editor_template.css'
					// ],
					// '<%= PUBLIC_DIR %>/css/mobile/editor_template.css': [
					//     './develop/markup/sass/common/_dummy_charset.scss',
					//     '<%= PUBLIC_DIR %>/css/mobile/editor_template.css'
					// ]
				}
			}
		},

		copy: {
			static_resource: {
				files:[{
					expand: true,
					cwd: './markup/img',
					src: [
						'**/*',
						'!**/spr_*'
					],
					dest: 'markup/dist/assets/images'
				}]
			}
		},

		sync: {
			dist: {
				verbose: true,
				files: [{
					cwd: 'mark/dist',
					src: ['**'],
					dest: 'dist'
				}]
			},
			image: {
				verbose: true,
				files:[{
					cwd: 'markup/img',
					src: [
						'**/*.png',
						'!**/spr_*.png',
						'!**/spr_*/**/*.png'
					],
					dest: 'markup/dist/assets/images'
				}]
			}
		},

		watch: {
			options: {
				interrupt: true
			},

			gruntfileReload: {
				options: {
					reload: true
				},
				files: ['Gruntfile.js']
			},

			livereload: {
				options: {
					livereload: true,
					interrupt: true
				},
				files: ['<%= PUBLIC_DIR %>/css/**/*.css','<%= BUILD_DIR %>/**/*.html']
			},

			html: {
				files: ['./markup/html/**/*.html'],
				tasks: ['includerreplace','sync']
			},

			common_sass: {
				files: ['./markup/sass/**/*.scss'],
				tasks: ['build_sass', 'copy:static_resource', 'sync']
			},

			sprite: {
				files: ['./markup/img/spr_*/**/*.png'],
				tasks: ['sprite', 'build_sass', 'copy:static_resource', 'sync']
			},

			image: {
				files: [
					'markup/img/**/*.png',
					'!markup/img/spr_*.png',
					'!markup/img/spr_*/**/*.png'
				],
				tasks: ['sync']
			}

		},
		concurrent: {
			options: {
				logConcurrentOutput: false
			},
			build: ['sass_init','html'],
			deploy: ['sass_init2','html']
		}

	});

	// default
	grunt.registerTask('default', ['clean', 'concurrent:build', 'watch']);
	grunt.registerTask('deploy', ['clean', 'sassNoMap', 'concurrent:deploy']);



};