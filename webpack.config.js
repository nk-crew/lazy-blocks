const md5 = require( 'md5' );

module.exports = {
    module: {
        rules: [
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
                        options: {
                            url: false,
                        },
                    }, {
                        loader: 'sass-loader', // compiles Sass to CSS
                    },
                ],
            }, {
                test: /\.svg$/,
                use: ( { resource } ) => ( {
                    loader: '@svgr/webpack',
                    options: {
                        svgoConfig: {
                            plugins: [
                                {
                                    removeViewBox: false,
                                },
                                {
                                    cleanupIDs: {
                                        prefix: `lazyblocks-${ md5( resource ) }-`,
                                    },
                                },
                            ],
                        },
                    },
                } ),
            },
        ],
    },
    resolve: {
        extensions: [ '.js', '.jsx', '.json' ],
        alias: {
            handlebars: 'handlebars/dist/handlebars.min.js',
        },
    },
    externals: {
        react: 'React',
        'react-dom': 'ReactDOM',
    },
};
