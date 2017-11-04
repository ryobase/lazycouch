const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: './src/core.js',
    resolve:{
        alias: {
            "Utility": path.resolve(__dirname, './src/utility/')
        }
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'lazycouch.js',
        libraryTarget: 'var',
        library: "lazycouch",
        auxiliaryComment: "A lazy load module"
    },
    module: {
        rules: [
            {
                test: /\.js$/, 
                exclude: [
                    path.resolve(__dirname, 'node_modules'),
                ],
                use: [{
                    loader: 'babel-loader',
                    options: {
                        presets: ['es2016']
                    }
                }]
            }
        ]
    },
    stats: {
        colors: true
    },
    devtool: 'source-map',
    plugins: [
        new CleanWebpackPlugin(["dist"]),
        new webpack.HotModuleReplacementPlugin()
    ],
    devServer: {
        contentBase: path.join(__dirname, "./dist"),
        // compress: true,
        hot: true,
        port: 9000
    }
}