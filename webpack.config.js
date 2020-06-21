const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const webpack = require('webpack')

const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
    mode: 'development',    // 模式， 默认有两种，development， production
    entry: './src/index.js',    // 入口
    output: {
        filename: 'bundle.[hash:8].js',  // 打包后的文件名 [hash] // 代表加上hash戳 如果太长加上   :8 --代表hash戳是8位
        path: path.resolve(__dirname, 'build')  // 路径必须是一个绝对路径
    },
    devServer: {
        port: 3000,
        contentBase: path.resolve(__dirname, 'build'), // 以build文件夹作为静态服务器的根目录
        progress: true,  // 开启打包进度条
        compress: true  // 开启gzip压缩
    },
    // 压缩mini-css-extract-plugin打包的css 和 js, 其实生产环境js是被压缩的，但是如果添加了optimization这个选项，即使在生产环境下也不会压缩css，那么就必须要重新压缩js，
    // optimization: {
    //     minimize: true,
    //     minimizer: [
    //         new TerserJSPlugin({
    //             cache: true, // 是否缓存
    //             parallel: true, // 是否并行打包
    //             sourceMap: true // 是否开始源码映射
    //         }), 
    //         new OptimizeCSSAssetsPlugin({})
    //     ],
    // },
    module: {
        rules: [
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
            },
            // {
            //     test: require.resolve('jquery'),
            //     use: 'expose-loader?$'
            // },
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
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ["@babel/preset-env", {
                                    useBuiltIns: "usage", // or "usage"
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
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: '../',
                        }
                    },
                    'css-loader',
                    'postcss-loader'
                ]
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    'css-loader',
                    'postcss-loader',
                    'less-loader'
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'index.html'),
            filename: 'index.html',  // 不是index找不到，默认找index，如果不是index还需要额外的配置
            minify: {
                removeAttributeQuotes: true,  // 去除双引号
                collapseWhitespace: true      // 压缩成一行
            },
            hash: true      // 给引入的js脚本文件加上hash值
            // 例如:  <script src=bundle.e1c532ac.js?e1c532ac3860273bb105></script>
        }),
        new MiniCssExtractPlugin({
            filename: 'index.css'
        }),
        // new webpack.ProvidePlugin({   // 给每个模块中都注入$
        //     $: 'jquery'
        // })
    ],
    externals: {
        jquery: '$'
    }
}