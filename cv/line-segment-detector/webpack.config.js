const webpack = require('webpack');

module.exports = {
    entry: __dirname + '/src/lsd.ts',
    output: {
        path: __dirname + '/dst',
        filename: 'lsd.js',
        library: "lineSegmentDetector",
        libraryTarget: "umd",
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'ts-loader',
            },
        ]
    },
    resolve: {
        extensions: ['.js', '.ts']
    },
    devtool: 'source-map',
};
