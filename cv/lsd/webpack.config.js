const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: __dirname + '/src/app.js',
    output: {
        path: __dirname + '/dst',
        filename: 'bundle.js',
    },
    module: {
        loaders: [
            {
                test: /\.js[x]?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015', 'react'],//, 'react-hmre']
                }
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                test: /\.(jpg|png)$/,
                loader: 'url-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    devServer: {
        contentBase: '/dst',
        port: 8888
    },
    devtool: 'source-map',
    plugins: [
        new HtmlWebpackPlugin({
            title: "React Sample",
            filename: 'index.html',
            template: __dirname + '/src/index.html'
        })    
    ]
};