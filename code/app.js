//简答题
//一、
//答：传统语言或语法项目中不能直接支持
//无法使用模块化 / 组件化
//重复的机械工作
//代码风格统一/质量保证
//依赖后端服务接口支持
//整体依赖后端项目
//二、
//答：提供项目规范和约定
//将重复工作利用脚手架完成
//利用脚手架快速搭建特定项目骨架，后续基于这个骨架进行开发
//编程题
//一、
//在全局范围安装 yo
//$ npm install yo -- global  # or yarn global add yo
//创建一个generator-< name > 的文件夹 (< name >为脚手架名称)
//利用yarn init 创建一个package.json
//安装一个yeoman-generator（提供了工具函数）
//yarn add yeoman-generator
//按照 generator 目录结构创建目录
//generators --> app ---> index.js
//index.js
const Generator = require('yeoman-generator')
module.exports = class extends Generator {
	// 命令行交互方式获取数据
	prompting(){
		return this.prompt([
			{
				type: 'input',
				name: 'name',
				mesage: 'Your project name',
				default: this.appname
			}
		]).then(answers => {
			this.answers = answers
		})
	}
	
	writing(){
		// 把每一个文件通过模板转换到目标路径
		const templates = [ //目标相对路径数组
		  '.browserslistrc',
		  '.editorconfig',
		  '.env.development',
		  '.env.production',
		  '.eslintrc.js',
		  '.gitignore',
		  'babel.config.js',
		  'package.json',
		  'postcss.config.js',
		  'README.md',
		  'public/favicon.ico',
		  'public/index.html',
		  'src/App.vue',
		  'src/main.js',
		  'src/router.js',
		  'src/assets/logo.png',
		  'src/components/HelloWorld.vue',
		  'src/store/actions.js',
		  'src/store/getters.js',
		  'src/store/index.js',
		  'src/store/mutations.js',
		  'src/store/state.js',
		  'src/utils/request.js',
		  'src/views/About.vue',
		  'src/views/Home.vue'
		]
		
		templates.forEach(item => {
			// item => 每个文件路径
			this.fs.copyTpl(
			  this.templatePath(item),
			  this.destinationPath(item),
			  this.answers
			)
		})
	}
}
//通过 yarn link 到全局
//在新的工作目录 运行 yo < name >
//发布 Generator
//将代码托管到GitHub仓库
echo node_modules > .gitignore  //忽略 node_modules 文件提交
git init  //初始化 git 仓库
git status  //查看仓库状态
git add .
git commit -m "meat: initial commit"
git remote add origin 远端仓库地址   // 为远端仓库添加一个别名
git push -u origin master 
//通过 yarn publish 发布
//二、
//对项目进行分析，需要对HTML、SCSS、JS进行构建并压缩，对图片字体文件进行压缩
//1、将 scss 文件转换成css文件 gulp-sass
//2、将 js 文件中 es6 新特性转换 gulp-babel @babel/core @babel/preset-env
//3、处理页面中的模板语法 gulp-swig 将动态数据添加到模板引擎中
//4、压缩 img 图片 gulp-imagemin
//5、压缩 字体文件 gulp-imagemin
//6、创建编译任务 用 parallel 将 scss js HTML img font 并行处理
//7、拷贝 public 文件下的所有文件
//8、创建项目编译任务 build 将 6，7 中任务合并处理
//9、自动清除 dist 目录下的文件 del
//10、将 9 中的清除任务添加到 8 中，先清除后编译
//11、通过 gulp-load-plugins 自动加载插件，运用的插件越来越多手动加载不方便
//12、启动开发服务器 – 自动编译和刷新文件改变时进行编译操作
//13、构建 start 任务启动服务前先编译生成 dis 目录
//14、处理页面中 引用模块 URL 路径问题 gulp-useref
//15、对 useref 处理的文件进行压缩 利用 plugins.if 判断类型做不同的操作 gulp-htmlmin gulp-uglify gulp-clean-css gulp-if
//16、解决 useref 读写冲突写入新的目录内
//17、重新规划目录结构
const {src, dest, parallel, series, watch} = require('gulp')

const del = require('del')
const browserSync = require('browser-sync')
const bs = browserSync.create()

const loadPlugins = require('gulp-load-plugins')
const plugins = loadPlugins()

const clean = () => {
	return del(['dist', 'temp'])
}

const data = {
  menus: [
    {
      name: 'Home',
      icon: 'aperture',
      link: 'index.html'
    },
    {
      name: 'Features',
      link: 'features.html'
    },
    {
      name: 'About',
      link: 'about.html'
    },
    {
      name: 'Contact',
      link: '#',
      children: [
        {
          name: 'Twitter',
          link: 'https://twitter.com/w_zce'
        },
        {
          name: 'About',
          link: 'https://weibo.com/zceme'
        },
        {
          name: 'divider'
        },
        {
          name: 'About',
          link: 'https://github.com/zce'
        }
      ]
    }
  ],
  pkg: require('./package.json'),
  date: new Date()
}

const style = () => {
	return src('src/assets/styles/*.scss',{base: 'src'})
		.pipe(plugins.sass({outputStyle: 'expanded'}))
		.pipe(dest('temp'))
		.pipe(bs.reload({ stream: true })) //以流的形式上推
}

const script = () => {
	return src('src/assets/scripts/*.js',{base: 'src'})
	.pipe(plugins.babel({presets: ['@babel/preset-env']}))
	.pipe(dest('temp'))
	.pipe(bs.reload({ stream: true })) //以流的形式上推
}

const page = () => {
	return src('src/*.html',{base: 'src'})
	.pipe(plugins.swig({data, defaults: { cache: false }})) // 防止模板缓存导致页面不能及时更新
	.pipe(dest('temp'))
	.pipe(bs.reload({ stream: true })) //以流的形式上推
}

const image = () => {
	return src('src/assets/images/**',{base: 'src'})
	.pipe(plugins.imagemin())
	.pipe(dest('dist'))
}

const font = () => {
	return src('src/assets/fonts/**',{base: 'src'})
	.pipe(plugins.imagemin())
	.pipe(dest('dist'))
}

const compile = parallel(style, script, page)

const extra = () => {
	return src('public/**',{base: 'public'})
	.pipe(dest('dist'))
}

const serve = () => {
	watch('src/assets/styles/*.scss',style)
	watch('src/assets/scripts/*.js',script)
	watch('src/*.html',page)
	// watch('src/assets/images/**',image)
	// watch('src/assets/fonts/**',font)
	// watch('public/**',extra)
	watch([
	  'src/assets/images/**',
	  'src/assets/fonts/**',
	  'public/**'
	], bs.reload)
	
	bs.init({
		notify: false,
		port: 2080,
		// open: false,
		// files: 'dist/**', // 监听 dist 文件变化刷新
		server: {
			baseDir: ['temp', 'src', 'public'],
			routes: {
				'/node_modules': 'node_modules'
			}
		}
	})
}

const start = series(compile, serve)

const useref = () => {
	return src('temp/*.html',{base: 'temp'})
	.pipe(plugins.useref({searchPath: ['temp', '.']}))
	.pipe(plugins.if(/\.js$/, plugins.uglify()))
	.pipe(plugins.if(/\.css$/, plugins.cleanCss()))
	.pipe(plugins.if(/\.html$/, plugins.htmlmin({
		collapseWhitespace: true,
		minifyCSS: true,
		minifyJS: true
	})))
	.pipe(dest('dist'))
}

const build = series(clean, parallel(series(compile,useref), image, font, extra))

module.exports = {
	build,
	clean,
	serve,
	start
}
