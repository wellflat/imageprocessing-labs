const webpack = require('webpack');

module.exports = {
    entry: __dirname + '/src/lsd.js',
    output: {
        path: __dirname + '/dst',
        filename: 'lsd.js',
        library: "lineSegmentDetector",
        libraryTarget: "umd",
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                options: {
                    presets: ['es2015'],
                }
            },
        ]
    },
    devtool: 'source-map',
};
