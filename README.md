## 01- 安装webpack

- 推荐安装本地的webpack，不推荐安装全局的webpack，会导致版本不一致
-  npm install webpack webpack-cli -D

### 1.1 webpack可以进行0配置，0配置意味着这个零配置会很弱

- 打包工具 ---> 输出后的结果 (js模块)
- npx webpack  -- webpack的命令行命令，可以去找node_modules的bin文件会找webpack.cmd。然后用node去执行../webpack/bin/webpack.js

- webpack 打包 打包支持我们的js模块化（commjs，umd，cmd， es6）可以让这个模块化的规范跑在浏览器上。

### 1.2 手动配置webpack

- 默认配置文件的名字是webpack.config.js
- webpack是node写出来的，所以在配置文件中需要使用node的写法。  
- webpack默认的名字是webpack.config.js or webpackfile.js这是在webpack-cli/bin/config下的config-yargs.js的配置

```js
const path = require('path')

module.exports = {
    mode: 'development',    // 模式， 默认有两种，development， production
    entry: './src/index.js',    // 入口
    output:{
        filename: 'bundle.[hash].js',  // 打包后的文件名 [hash] // 代表加上hash戳

        path: path.resolve(__dirname, 'build')  // 路径必须是一个绝对路径
    }
}
```

### 1.3 webpack指定配置文件运行

- 方法一： npx webpack --config webpack.config.my.js

- 在script脚本中配置可 免去npx，因为在packjson中的script脚本会自动找node_modules中的webpack命令。
- 方法二：npm run build -- --config webpack.config.my.js（会把 --config webpack.config.my.js当成参数）
- 在命令行中指定配置文件

### 1.4 devServer

- 内部是通过express实现的一个静态服务。

- 使用npx webpack-dev-server来打包到内存中，然后与服务器进行关联。

  ```js
  devServer: {
          port: 3000,
          contentBase: path.resolve(__dirname, 'build'), // 以build文件夹作为静态服务器的根目录
          progress: true,  // 开启打包进度条
          compress: true  // 开启gzip压缩
      },
  new HtmlWebpackPlugin({
              template: path.resolve(__dirname, 'index.html'),
              filename: 'index.html'  // 不是index找不到，默认找index，如果不是index还需要额外的配置
          })
  ```

- 但是这时候还需要手动配置index.html，所以需要与html-webpack-plugin进行配合

  - 我们希望建立一个html作为模板，然后使用插件解析模板，将打包好的js文件当作脚本插入到模板中，然后将模板放到devServer的contentBase的目录下。

### 1.5 解析css语法

- 当index.js引入了css文件时，webpack无法处理，所以需要loader来处理，loader就是用来处理这些类似样式，图片等这些模块的。

- css-loader会将从入口文件开始发现的所有css打包到一个文件中。这是css-loader的功能。如果要插入到页面中需要使用style-loader。

- style-loader会将样式通过js创建style标签的形式将样式插入到head标签中。

  ```js
   module: {
       rules: [
           {
               test: /\.css$/,
               use: ['style-loader','css-loader']
           }
       ]
   },
  ```

  

  - 如果在模板html文件使用style标签插入了样式，那么会被webpack处理过的样式覆盖。因为webpack打包后创建的style标签会插在header标签的最下面。我们可以给style-loader设置一些选项。

  ```js
   module: {
       rules: [
           {
               test: /\.css$/,
               use: [
                   {
                       loader: 'style-loader',
                       options: {
                            {
                          loader: 'style-loader',
                          options: {
                              insert: function insertAtTop(element) {
                                  var parent = document.querySelector('head');
                                  var lastInsertedElement =
                                      window._lastElementInsertedByStyleLoader;
                                  if (!lastInsertedElement) {
                                      parent.insertBefore(element, parent.firstChild);
                                  } else if (lastInsertedElement.nextSibling) {
                                      parent.insertBefore(element, lastInsertedElement.nextSibling);
                                  } else {
                                      parent.appendChild(element);
                                  }
                                  window._lastElementInsertedByStyleLoader = element;
                              },
                          }
                      },
                       }
                   },
                   'css-loader',
                   "less-loader"
               ]
           }
       ]
   }
  ```

  - 处理less  安装less 和 less-loader  
    - 使用less-loader解析less文件， less解析less语法。

- 如果样式太多，都插入到style标签中会有一定几率产生产生阻塞的情况。所以需要抽离css
  
  - 需要使用mini-css-extract-plugin将样式抽离到css文件中
  
    ```js
     new MiniCssExtractPlugin({
         filename: 'css/index.css' // 规定路径和名称
     })
    module: {
        {
         test: /\.css$/,
             use: [
                 {
                     loader: MiniCssExtractPlugin.loader,
                 },
                 'css-loader'
             ]
        }
    }
    ```
  
  - 当把css抽离出来以后，如果要对css中的文件加上浏览器前缀，则需要一个autoprefixer包来加前缀，像添加前缀这种事情，对于webpack来说也是需要loader来进行处理，使用postcss-loader 来对 autoprefixer包进行处理。需要在解析css之前使用这个loader，而且要添加要添加一个postcss.config.js文件来被postcss-loader调用。
  
    - 添加 postcss.config.js文件， 必须设置支持的浏览器才会自动添加添加浏览器兼容 
  
      ```js
      module.exports = {
          plugins: [ require('autoprefixer')({
              "overrideBrowserslist": [
                  "defaults",
                  "not ie < 11",
                  "last 2 versions",
                  "> 1%",
                  "iOS 7",
                  "last 3 iOS versions"
              ]
          }) ]
      }
      ```
  
    - webpack中
  
      ```js
      {
          test: /\.less$/,
              use: [
                  {
                      loader: MiniCssExtractPlugin.loader,
                  },
                  'css-loader',
                  'postcss-loader', // 会去找同级目录下的postcss.config.js, 需要在处css之前被调用
                  'less-loader'
              ]
      }
      ```
  
  - 但是此时css没有被压缩，如果想要css被压缩则需要使用terser-webpack-plugin和optimize-css-assets-webpack-plugin， 这些说明都是在mini-css-extract-plugin中自带的。使用terser-webpack-plugin替代uglifyjs-webpack-plugin
  
    ```js
     // 压缩mini-css-extract-plugin打包的css, 与plugins同级，此optimization优化项只会在生产中生效
    optimization: {
        minimizer: [new TerserJSPlugin({
            cache: true, // 是否缓存
            parallel: true, // 是否并行打包
            sourceMap: true // 是否开始源码映射
        }), new OptimizeCSSAssetsPlugin({})],
    },
    ```

### 1.6 es6 转es5

- webpack4使用了tree-shaking技术，最后显示的只会是最后需要的。全都编译好成最终的结果。不需要的则不编译到最后的打包文件中。

- 需要安装babel-loader @babel/core @babel/preset-env ，如果要使用es7的语法那么需要@babel/plugin-proposal-class-properties,如果要使用装饰器的语法，那么就要用@babel/plugin-proposal-decorators插件, 如果使用了generater语法的话，需要使用 @babel/plugin-transform-runtime 插件进行编译.

- 关于babel对一些实例上的方法进行实现的相关，需要使用corejs，网上有很多关于babel、babel-runtime、babel/ployfile和corejs的很多文章，涉及到组合使用和一些历史遗留问题，这里就不做多余的篇幅进行描述，因为我也不太懂。这里有一种使用corejs3的方案，测试之后是可以的

  ```js
   {
       test: /\.js$/,
           use: [
               {
                   loader: 'babel-loader',
                   options: {
                       presets: [
                           ["@babel/preset-env", {
                               useBuiltIns: "usage", 
                               corejs: 3,
                           }]
                       ],
                       plugins: [
                           // 使用装饰器语法, 要保证装饰器语法在class语法上面
                           ["@babel/plugin-proposal-decorators", {"legacy": true}],
                           // 编译class语法， 如果使用了宽松模式，那么会使用Object.defineProperty来进行实现class语法
                           ["@babel/plugin-proposal-class-properties", { "loose": true }],
                           '@babel/plugin-transform-runtime'
                       ]
                   }
               }
           ],
               include: path.resolve(__dirname, 'src'),
                   exclude: /node_modules/
   },
  ```

  

- 对于eslint的配置， yarn add eslint eslint-loader

  ```js
  https://eslint.org/demo
  // 去这里下载.eslintrc.json配置文件
  // 将文件放到根目录下，
  ```

- 配置eslint-loader

  ```js
   {
       test: /\.js$/,
           use: {
               loader: 'eslint-loader',
                   options: {
                       enforce: 'pre', // previous 强制在最前面执行。因为loader的顺序是从右到左，从下到上执行。
                           fix: true
                   }
           },
               include: path.resolve(__dirname, 'src'),
                   exclude: /node_modules/
   },
  ```

- 在使用的时候会冒出一些莫名奇妙的eslint报错，比如 Parsing error: Unexpected token < / =

  - 这里下载babel-eslint 解决 Parsing error: Unexpected token = 的bug  在js文件中
  - 这里下载 eslint-plugin-html 解决 Parsing error: Unexpected token = 的bug   在html文件中
  - 这里是.eslintrc.json的配置

  ```js
  {
      "parser": "babel-eslint",
      "parserOptions": {
          "parser": "babel-eslint",
          "ecmaFeatures": {},
          "ecmaVersion": 7,
          "sourceType": "module"
      },
      "rules": {
          "no-debugger": 2,
          "no-undef": 2
      },
      "env": {
          "browser": true,
          "node": true,
          "es6": true,
          "commonjs": true
      },
      "plugins": [ "html" ]
  }
  ```

### 1.7 全局变量的引入问题

- 当我们引用jquery的时候

  ```js
  import $ from 'jquery'
  console.log($)	// 正常打印
  console.log(window.$)	// undefined
  ```

- webpack会将引用的模块封装到闭包函数中，而不会挂载的window下面

- loader的分类： pre前面执行的loader， normal 普通loader， 内联loader ，后置 postloader

- 将引用的模块暴露到window上，使用expose-loader, 这是内联的loader

  ```js
  import $ from 'expose-loader?$!jquery'
  console.log($)
  console.log(window.$)
  ```

  或者可以使用在webpack.config.js中的方式进行配置

  ```js
  import $ from 'jquery'
  console.log($)
  console.log(window.$)
  
  rules: [
      {
          test: require.resolve('jquery'),
          use: 'expose-loader?$'
      }
  ]
  ```

  

- 使用providePlugin 给每个模块注入 一个 变量 ( 这里jquery是 $), 就不需要引入了

  ```js
   new webpack.ProvidePlugin({   // 给每个模块中都注入$
       $: 'jquery'
   })
  
  index.js
  console.log($) // 是正确的
  console.log(window.$) // undefined
  ```

- 使用cnd的方式引用jquery,  这样就不用打包jquery，但是如果要import $ from 'juery'， 就会打包jquery，所以这时候要用一个externals的属性 , 这样即使使用import 导入， 也不会去打包了

  ```js
   externals: {
       jquery: '$'
   }
  ```

  

### 1.8 打包图片

- webpack来打包我们的图片
  1. 在js中创建图片来引入
  2. 在css中使用background('url')的方式引入
  3. 在html中使用img标签来引入 <img src=""/>

- 使用file-loader来解析图片，

  - file-loader会将引入的图片当作一个模块，然后映射返回一个hash形式的图片地址。并将图片拷贝到指定的或者打包的目录下，适用于js创建图片。如果在css中使用bg url的形式引入图片，那么会自动将其以模块化的形式打包。
  - 如果在html引入图片的话，那么要引入html-withimg-loader来打包图片。但是由于file-loader升级的缘故，需要给file-loader的options在添加 `esModule:false` 否则使用html-withimg-loader解析出来的是{default: 'url'}这种形式无法被识别

  ```js
     // 在html中引入图片
  {
      test: /\.html$/,
          loader: 'html-withimg-loader'
  },
  {
      test: /\.(png|jpg|gif)$/,
      use: [
         {
           loader: 'file-loader',
           options: {
               esModule:false
           }
         }
       ]
  }
  
  .html文件
  <img src="./src/logo.jpg" alt="" style="margin: 100px;">
  ```

- 当一个图片过小的时候，我们希望他转换成base64的形式不去发送ajax请求，就需要使用url-loader，当使用了url-loader的时候，我们就可以做一个限制，当我们的图片小于多少k的时候，用base64来转换，否则用file-loader产生真实的图片。其实url就有file-loader的几乎所有功能。

  ```js
  // 当小于8kb时转为base64，否则正常转换图片
  {
      test: /\.(png|jpg|gif)$/,
          use: [
              {
                  loader: 'url-loader',
                  options: {
                      limit: 8*1024,
                      esModule:false,
                      outputPath: 'img/'  // 设置出口路径
                  }
              }
          ]
  },
  ```

### 1.9打包多入口文件

- 多入口也就意味着多出口, 也可以意味着多个html文件

  出口的名字由[name]替代。

- 多个html文件，需要new 多个HtmlWebpackPlugin，但是如果按照正常的写法，每个html文件中都会把多出口打包的js文件都引入进来，如果要分别引入的话，则需要配置chunks属性.

```js
entry: {
    home: './src/index.js',
    other: './src/other.js'
},    
// 配置多入口
output: {
    filename: '[name].[hash:8].js',  
    path: path.resolve(__dirname, 'build') 
},
    
new HtmlWebpackPlugin({
    template: path.resolve(__dirname, 'index.html'),
    filename: 'home.html',  
    chunks: ['home']
}),
new HtmlWebpackPlugin({
    template: path.resolve(__dirname, 'index.html'),
    filename: 'other.html',  
    chunks: ['other']
    // 如果other里面既需要other 又需要home， 那么可以chunks: ['home', 'other']
}),
```

### 2.0 devtool，做调试

```js
 // 1. 源码映射，可以单独生成一个sourcemap文件，出错了会标识，当前出错的列和行
// devtool: 'source-map',  // 增加映射文件，可以帮我们调试源代码
// 2. 不会产生单独的文件，但是可以显示行和列, 将source-map产生的map文件放到本身的js中了。
// devtool: 'source-map',
// 3. 不会产生列， 但是会产生一个单独的配置文件 对源码调试没有帮助，只是一个单独的map文件，可以保留起来。作用是比如做资源监控的时候，可以用这个文件进行映射。
// devtool: 'cheap-module-source-map',
// 4. 不会产生文件，集成在打包后的文件中，不会产生列
devtool: 'cheap-module-eval-source-map',
```

### 2.1 实时监控build打包

- 当改变文件的时候进行实时打包

  ```js
  // 实时监控打包
  watch: true,
  watchOptions: { // 监控的选项
    poll: 1000, // 每秒问我1000次
    aggregateTimeout: 500,   // 防抖的作用，对监控进行防抖
    ignored: /node_modules/  // 忽略对node_modules进行监控
  },
  ```

### 2.2 几个小插件

- cleanWebpackPlugin
- copyWebpackPlugin
- bannerPlugin  内置

- cleanWebpackPlugin 是 每次打包的时候先清空指定目录。

  ```js
  // 默认删除就是你配置的outpath
  new CleanWebpackPlugin(),
  ```

- copyWebpackPlugin 将一些文档进行原样拷贝到output的目录

  ```js
  new CopyWebpackPlugin({
      patterns: [
          { from: 'doc', to: 'doc' }
      ]
  })
  ```

- bannerPlugin 版权所有的插件, 在js的头部插入指定指定注释的内容

  ```js
  new webpack.BannerPlugin('This webpack study by lhr')
  ```
### 2.3 devServer

- devServer本质上就是一个express服务器， 可以用来配置跨域和mock 数据

- 前端单纯的想mock数据可以使用 devServer提供的钩子进行模拟数据

  ```js
  devServer: {  // 本质上就是一个express服务器， 可以用来配置跨域和mock 数据
      port: 3000,
      contentBase: path.resolve(__dirname, 'build'), // 以build文件夹作为静态服务器的根目录
      progress: true,  // 开启打包进度条
      compress: true,  // 开启gzip压缩
          before(app) {
          app.get('/user', (req, res) => {
              res.json({name: 'hello webpack'})
          })
      },
  },
  ```

  

- devServer还可以使用服务端来启动webpack，让webpack的端口和服务端的端口一致。

### 2.4 resolve

- resolve 可以配置一些路径问题
- 比如我安装了vue，但是我import vue from 'vue'的时候默认会找vue/index.js文件，但是vue-cli我们只要引入vue就行了。就是因为resolve给我们解析了路径。

```js
resolve: {  // 解析包 的路径问题
	modules: [path.resolve('node_modules')],  // 找包的时候不在逐渐往上找， 只找node_modules
    alias: {
		bootstrap: 'bootstrap/dist/css/bootstrap.css'    // import 'bootstrap'的时候会默认找这个路径
        }
}
```

 另外一种方式，但是感觉不太常用, 引入包的时候会找到node_modules中的该包的packjson的main属性，就是去找的那个main属性的值所对应的包。

```JS
resolve: {  // 解析包 的路径问题
        modules: [path.resolve('node_modules')],  // 找包的时候不在逐渐往上找， 只找node_modules
        mainFields: ['style', 'main'],  // 先去找bootstrap中packjson中的style属性，如果找不到就找packjson中的main属性
        // alias: {
        //     bootstrap: 'bootstrap/dist/css/bootstrap.css'    // import 'bootstrap'的时候会默认找这个路径
        // }
    },
```

在resolve中添加extensions属性配置扩展名

`extensions: ['.js', '.css', '.json'],`  // 先找.js，然后找.css然后找.json



### 2.5 在webpack中注入常量

```js
// webpack定义常量 -- 环境变量
new webpack.DefinePlugin({
    DEV: JSON.stringify('devccccc')
})

// 这样就可以直接在页面中使用 DEV变量了
console.log(DEV) // index.js 打印结果为devccccc
```

### 2.6 webpack-merge

可以 合并包

## 3. 优化

### 3.1 noParse

- webpack的特点：先找到入口， 然后如果有import 语法引入了一个模块， 就会加载并解析这个模块，看这个模块有没有其他的依赖于其他的模块，然后再去打包。

  比如 import jquery from 'jquery'

- noParse属性可以 去忽略其指定模块的解析。这个优化项除非对那些特殊的模块有效，否则无效

  ```js
  module: {
  	noParse: /vue/
  }
  ```

### 3.2 ignorePlugin

- 使用moment之前 2435ms 107kb 使用moment之后 2540ms 830kb

- 查找node_modules下的moment的packjson中main对应的路径文件，发现moment将所有的语言包都引入了，但是我们如果只需要的是中文的，那么就造成了不必要的代码

- 所以这里使用了插件   webpack.IgnorePlugin插件来忽略掉调用的语言包

  ```js
  new webpack.IgnorePlugin(/\.\/local/, /moment/),  // 代表如果在moment中发现引入了.local则忽略掉不去引入，我们在入口文件中手动引入
  ```

- index.js中

  ```js
  import moment from 'moment'
  import 'moment/locale/zh-cn'
  moment.locale('zh-cn')
  console.log(moment().endOf('day').fromNow())
  ```

- 经过优化之后的为2322ms  289kb

### 3.3 动态链接库

  比如react、react-dom，vue这种库，一般我们是不会改变的，我们想把这个独立的库单独抽离出来，在开发的时候引入这些打包好的文件，就不会每次都重新打包了。

未使用动态链接库之前 3586ms   1.4mb

使用之后 2202ms ， 109kb

webpack.config.dll.js

```js
const path = require('path')
const webpack = require('webpack')

module.exports = {
    mode: 'development',
    entry: {
        react: ['react', 'react-dom']
    },
    output: {
        filename: '_dll_[name].js',
        path: path.resolve(__dirname, 'dll'),
        library: '_dll_[name]',
        libraryTarget: 'var'
    },
    plugins: [
        new webpack.DllPlugin({
            name: '_dll_[name]',
            path: path.resolve(__dirname, 'dll', 'manifest.json')
        })
    ]
}
```

要先打包dll，然后build真正的入口文件，因为clean-webpack-plugin的原因，所以单独放到一个dll文件夹中。

webpack.config.js中配置

```js
new webpack.DllReferencePlugin({
    manifest: path.resolve(__dirname, 'dll', 'manifest.json')
})
```

index.html中写死

```html
<script src="../dll/_dll_react.js"></script>
```

### 3.4 多线程打包

```js
// 模块happypack可以实现多线程来打包
let Happypack = require('happypack')

// 分配线程会占用时间， 如果项目不够大，多线程反而是浪费事件的选择
new Happypack({
    id: 'js',
    use: [{
        loader: 'babel-loader',
        options: {
            presets: [
                ["@babel/preset-env", {
                    useBuiltIns: "usage", // or "usage"
                    corejs: 3,
                }],
                '@babel/preset-react'
            ],
            plugins: [
                // 使用装饰器语法, 要保证装饰器语法在class语法上面
                ["@babel/plugin-proposal-decorators", {"legacy": true}],
                // 编译class语法， 如果使用了宽松模式，那么会使用Object.defineProperty来进行实现class语法
                ["@babel/plugin-proposal-class-properties", { "loose": true }],
                '@babel/plugin-transform-runtime'
            ]
        }
    }]
}),
```

```js
{
    test: /\.js$/,
    use: 'Happypack/loader?id=js',
    include: path.resolve(__dirname, 'src'),
    exclude: /node_modules/,
    use: 'Happypack/loader?id=js'
},
```



happypack也可以多线程打包css，操作同js，再new 一个Happpack就行了。



### 3.5 webpack 4.0自带的打包

import 在生产模式下， 会自动去除掉没用的代码   这就是tree-shaking  摇树优化， 把没用到的代码自动删除掉。如果在代码中使用了require语法，那么结果会放到一个default属性上，而且tree-shaking不支持require语法。

```js
比如我一个 模块 中有好几个方法，而代码中只使用了一个，则其他的方法不会被引入
```



scope hosting 作用域提升。 编译的时候会计算出需要的结果。减少了在浏览器上定义变量。会自动省略一些可以简化代码。

```js
let a = 1,b= 2,c=3;
let d = a+b+c
console.log(d)
编译后结果为console.log(d)
```



### 3.6 抽离公共代码

- 抽离的是多入口文件的代码， 把多个入口文件的公共部分抽离出来。







## 99. 高级

- webpack-dev-server 也是一个集成好的命令行工具，内部是一个express服务器。
- 使用webpack-dev-server看到控制台打印的日志，可以看到running 的地址和端口，output的路径，webpack-dev-server可以访问的静态资源的路径(通过devServer的contentbase设置)，contentbase设置的路径中的文件，通过webpack-dev-server启动的服务可以获取到
- webpack-dev-server也可以启动gzip压缩
- use  的值可以是一个字符串， 数组  ， 对象
  - 数组的语法: use: [ {loader: 'xxx', options: {...} } ]
- 解析单独的css、less、sass等预处理器用css-loader，style-loader即可解析。那么如果在css中使用@import语法引入.less文件，那么将不会去解析less语法。
