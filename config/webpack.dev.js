const helpers = require('./helpers');
const webpackMerge = require('webpack-merge'); // used to merge webpack configs
const commonConfig = require('./webpack.common'); // the settings that are common to prod and dev

/**
 * Webpack Plugins
 */
const DefinePlugin = require('webpack/lib/DefinePlugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const HotModuleReplacementPlugin = require('webpack/lib/HotModuleReplacementPlugin');

/**
 * Webpack Constants
 */
const ENV = process.env.ENV = process.env.NODE_ENV = 'development';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;
const PUBLIC = process.env.PUBLIC_DEV || HOST + ':' + PORT;
const AOT = process.env.BUILD_AOT || helpers.hasNpmFlag('aot');
const HMR = helpers.hasProcessFlag('hot');
const METADATA = {
  host: HOST,
  port: PORT,
  public: PUBLIC,
  ENV: ENV,
  HMR: HMR,
  AOT: AOT
};

/**
 * Webpack configuration
 */
module.exports = function (options) {
  return webpackMerge(commonConfig({env: ENV}), {

    /**
     * Developer tool to enhance debugging
     */
    devtool: 'cheap-module-source-map',


    /**
     * Options affecting the output of the compilation.
     */
    output: {
      /**
       * The output directory as absolute path (required)
       */
      path: helpers.root('dist'),

      /**
       * Specifies the name of each output file on dist
       * IMPORTANT: You must not specify an absolute path here!
       */
      filename: '[name].bundle.js',

      /**
       * The filename of the SourceMaps for the javascript files.
       * They are inside the output.path directory
       */
      sourceMapFilename: '[file].map',

      /**
       * The filename of non-entry chunks as relative path
       * inside the output.path directory
       */
      chunkFilename: 'bundles/[id].chunk.js',

      library: 'as_[name]',
      libraryTarget: 'var',
    },

    module: {
      rules: [
        /**
         * CSS loader support for *.css files (styles directory only)
         * Loads external css styles into the DOM, supports HMR
         */
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
          include: [helpers.root('src', 'styles')]
        },

        /**
         * Sass loader support for *.scss files (styles directory only)
         * Loads external sass styles into the DOM, supports HMR
         *
         */
        {
          test: /\.scss$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
          include: [helpers.root('src', 'styles')]
        }
      ]
    },

    plugins: [
      /**
       * Plugin: DefinePlugin
       * Description: Define free variables.
       * Useful for having development builds with debug logging or adding global constant.
       *
       * Environment helpers
       *
       * NOTE: when adding more properties, make sure you include them in custom-typings.d.ts
       *
       */
      new DefinePlugin({
        'ENV': JSON.stringify(METADATA.ENV),
        'HMR': METADATA.HMR,
        'process.env.ENV': JSON.stringify(METADATA.ENV),
        'process.env.NODE_ENV': JSON.stringify(METADATA.ENV),
        'process.env.HMR': METADATA.HMR
      }),

      /**
       * Plugin LoaderOpiotionsPlugin (experimental)
       */
      new LoaderOptionsPlugin({
        debug: true,
        options: {

        }
      }),

      new HotModuleReplacementPlugin(),
    ],

    /**
     * Webpack Development Server configuration
     * Description: The webpack-dev-server is a little node.js Express server.
     * The server emits information about the compilation state to the client,
     * which reacts to those events.
     */
    devServer: {
      port: METADATA.port,
      host: METADATA.host,
      hot: METADATA.HMR,
      public: METADATA.public,
      historyApiFallback: true,
      watchOptions: {
        /**
         * if you're using Docker you may need this
         *
         * aggregateTimeout: 300,
         * poll: 1000,
         */
        ignored: /node_modules/
      }
    }
  })
}
