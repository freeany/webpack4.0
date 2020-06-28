const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const webpack = require('webpack')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const Happypack = require('happypack')

module.exports = {
    mode: 'development',    // 模式， 默认有两种，development， production
    // 1. 源码映射，可以单独生成一个sourcemap文件，出错了会标识，当前出错的列和行
    // devtool: 'source-map',  // 增加映射文件，可以帮我们调试源代码
    // 2. 不会产生单独的文件，但是可以显示行和列, 将source-map产生的map文件放到本身的js中了。
    // devtool: 'source-map',
    // 3. 不会产生列， 但是会产生一个单独的配置文件 对源码调试没有帮助，只是一个单独的map文件，可以保留起来。作用是比如做资源监控的时候，可以用这个文件进行映射。
    // devtool: 'cheap-module-source-map',
    // 4. 不会产生文件，集成在打包后的文件中，不会产生列
    // devtool: 'cheap-module-eval-source-map',
    // 实时监控打包
    // watch: true,
    // watchOptions: { // 监控的选项
    //     poll: 1000, // 每秒问我1000次
    //     aggregateTimeout: 500,   // 防抖的作用，对监控进行防抖
    //     ignored: /node_modules/  // 忽略对node_modules进行监控
    // },

    entry: {
        home: './src/index.js',
        // other: './src/other.js'
    },    // 配置多入口
    output: {
        filename: '[name].[hash:8].js',  // 打包后的文件名 [hash] // 代表加上hash戳 如果太长加上   :8 --代表hash戳是8位
        path: path.resolve(__dirname, 'build')  // 路径必须是一个绝对路径
    },
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
    resolve: {  // 解析包 的路径问题
        modules: [path.resolve('node_modules')],  // 找包的时候不在逐渐往上找， 只找node_modules
        // mainFields: ['style', 'main'],  // 先去找bootstrap中packjson中的style属性，如果找不到就找packjson中的main属性
        extensions: ['.js', '.css', '.json'],
        alias: {
            bootstrap: 'bootstrap/dist/css/bootstrap.css'    // import 'bootstrap'的时候会默认找这个路径
        }
    },
    module: {
        noParse: /vue/,
        rules: [
            {
                test: /\.html$/,
                loader: 'html-withimg-loader'
            },
           
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
            {
                test: /\.js$/,
                use: 'Happypack/loader?id=js',
                include: path.resolve(__dirname, 'src'),
                exclude: /node_modules/,
                use: 'Happypack/loader?id=js'
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: '../',
                        }
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 2
                        }
                    },
                    'postcss-loader'
                ]
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: '../',
                        }
                    },
                    'css-loader',
                    'postcss-loader',
                    'less-loader'
                ]
            }
        ]
    },
    plugins: [
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
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'index.html'),
            filename: 'index.html',  
            chunks: ['home']
        }),
        // new HtmlWebpackPlugin({
        //     template: path.resolve(__dirname, 'index.html'),
        //     filename: 'other.html',  
        //     chunks: ['other']
        // }),
        // 默认删除就是你配置的outpath
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: 'css/index.css'
        }),
        // new CopyWebpackPlugin({
        //     patterns: [
        //         { from: 'doc', to: 'doc' }
        //     ]
        // }),
        new webpack.BannerPlugin('This webpack study by lhr'),
        // webpack定义常量 -- 环境变量
        new webpack.DefinePlugin({
            DEV: JSON.stringify('devccccc')
        }),
        new webpack.IgnorePlugin(/\.\/local/, /moment/),  // 代表如果在moment中发现引入了.local则忽略掉不去引入，我们在入口文件中手动引入
        // new webpack.DllReferencePlugin({
        //     manifest: path.resolve(__dirname, 'dll', 'manifest.json')
        // })
        // new webpack.ProvidePlugin({   // 给每个模块中都注入$
        //     $: 'jquery'
        // })
    ],
    externals: {
        jquery: '$'
    }
}