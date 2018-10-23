const gulp = require('gulp')
const { build } = require('pipe-builder')
const typescript = require('gulp-typescript')
const sass = require('gulp-sass')
const cache = require('gulp-cached')

gulp.task('default', () => {
	const ts = typescript.createProject('tsconfig.json')
	
	return build([
		{
			src: './src/scripts/**/*',
			dest: './app/scripts',
			tasks: {
				'typescript': s => s.pipe(cache('typescript')).pipe(ts())
			}
		},
		{
			src: './src/layouts/**/*',
			dest: './app/layouts',
			tasks: {
				'scss': s => s.pipe(cache('scss')).pipe(sass()).on('error', sass.logError)
			}
		},
		{
			src: './src/fonts/**/*',
			dest: './app/fonts',
			tasks: {
				'fonts': null
			}
		},
		{
			src: './src/images/**/*',
			dest: './app/images',
			tasks: {
				'images': s => s.pipe(cache('images'))
			}
		},
		{
			src: './src/index.html',
			dest: './app',
			tasks: {
				'index.html': s => s.pipe(cache('index.html'))
			}
		}
	])
})

gulp.task('watch', () => {
	return gulp.watch('./src/**/*', ['default'])
})