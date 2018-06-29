const UglifyJsPlugin = require( 'uglifyjs-webpack-plugin' );

module.exports = {
    module: {
        loaders: [
            {
                test: /(\.jsx)$/,
                loader: 'babel-loader',
            }, {
                test: /\.scss$/,
                use: [
                    {
                        loader: 'style-loader', // creates style nodes from JS strings
                    }, {
                        loader: 'css-loader', // translates CSS into CommonJS
                    }, {
                        loader: 'sass-loader', // compiles Sass to CSS
                    },
                ],
            }, {
                test: /\.svg$/,
                use: [
                    {
                        loader: 'svg-url-loader',
                        options: {
                            noquotes: true,
                        },
                    },
                    'svgo-loader',
                ],
            },
        ],
    },
    resolve: {
        alias: {
            handlebars: 'handlebars/dist/handlebars.min.js',
        },
    },
    externals: {
        react: 'React',
        'react-dom': 'ReactDOM',
    },
    plugins: [
        new UglifyJsPlugin( {
            uglifyOptions: {
                output: {
                    comments: /^!/,
                },
            },
        } ),
    ],
};
