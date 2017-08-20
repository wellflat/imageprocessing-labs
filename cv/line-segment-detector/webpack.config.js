const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: path.join(__dirname, './src/lsd.ts'),
    output: {
        path: path.join(__dirname, './dst'),
        filename: 'lsd.js',
        library: 'lineSegmentDetector',
        libraryTarget: 'umd'
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'ts-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.ts']
    },
    devtool: 'source-map'
};
