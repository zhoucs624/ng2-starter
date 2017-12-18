const helpers = require('./helpers');
const webpackMerge = require('webpack-merge'); // used to merge webpack configs
const commonConfig = require('./webpack.common'); // the settings that are common to prod and dev

/**
 * Webpack Plugins
 */
const webpack = require('webpack');
const DefinePlugin = webpack.DefinePlugin;
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HashedModuleIdsPlugin = webpack.HashedModuleIdsPlugin;
const IgnorePlugin = webpack.IgnorePlugin;
const LoaderOptionsPlugin = webpack.LoaderOptionsPlugin;
const NormalModuleReplacementPlugin = webpack.NormalModuleReplacementPlugin;
const ProvidePlugin = webpack.ProvidePlugin;
const ModuleConcatenationPlugin = webpack.ModuleConcatenationPlugin;
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeJsPlugin = require('optimize-js-plugin');

/**
 * Webpack Constants
 */
const ENV = process.env.NODE_ENV = process.env.ENV = 'production';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || '8080';
const AOT = process.env.BUILD_AOT || helpers.hasNpmFlag('aot');
const METADATA = {
  host: HOST,
  port: PORT,
  ENV: ENV,
  HMR: false,
  AOT: AOT
};

module.exports = function (env) {
  return webpackMerge(commonConfig({
    env: ENV
  }), {
    /**
     * Developer tool to enhance debugging
     *
     */
    devtool: 'source-map',

    /**
     * Options affecting the output of the compilation
     */
    output: {
      /**
       * The output directory as absolute path (required).
       */
      path: helpers.root('dist'),

      /**
       * Specifies the name of each output file on dist.
       * IMPORTANT: You must not specify an absolute path here!
       */
      filename: '[name].[chunkhash:8].bundle.js',

      /**
       * The filename of the SourceMaps for the javascript files.
       * They are inside the output.path directory
       */
      sourceMapFilename: '[file].map',

      /**
       * The filename of non-entry chunks as relative path
       * inside the output.path directory
       */
      chunkFilename: 'bundles/[name].[chunkhash:8].chunk.js'
    },

    module: {
      rules: [
        /**
         * Extract CSS files from .src/styles directory to external css file
         */
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: 'css-loader'
          }),
          include: [helpers.root('src', 'styles')]
        },


        /**
         * Extract and compile SCSS files from .src/styles directory to external css file
         */
        {
          test: /\.scss$/,
          loader: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: 'css-loader!sass-loader'
          }),
          include: [helpers.root('src','styles')]
        }
      ]
    },

    /**
     * Add additional plugins to the compiler
     */
    plugins: [
      new ModuleConcatenationPlugin(),

      /**
       * Webpack plugin to optimize a javascript file for faster initial load
       * by wrapping eagerly-invoked functions
       */
      new OptimizeJsPlugin({
        sourceMap: false
      }),

      /**
       * Plugin: ExtractTextPlugin
       * Description: Extracts imported CSS files into external stylesheet
       */
      new ExtractTextPlugin('[name].[contenthash].css'),

      /**
       * Plugin: DefinePlugin
       * Description: Define free variables.
       * Userful for having development builds with debug logging or adding global constants.
       *
       * Environment helpers
       *
       */
      // NOTE: when adding more properties make sure you include them in custom-typings.d.ts
      new DefinePlugin({
        'ENV': JSON.stringify(METADATA.ENV),
        'HMR': METADATA.HMR,
        'AOT': METADATA.AOT,
        'process.env.ENV': JSON.stringify(METADATA.ENV),
        'process.env.NODE_ENV': JSON.stringify(METADATA.ENV),
        'process.env.HMR': METADATA.HMR
      }),

      /**
       * Plugin: UglifyJsPlugin
       * Description: Minimize all javascript output of chunks
       * Loaders area switched into minimizing mode
       *
       * NOTE: To debug prod builds uncomment //debug lines and comment //prod lines
       */
      new UglifyJsPlugin({
        parallel: true,
        uglifyOptions: {
          ie8: false,
          ecma: 6,
          warnings: true,
          mangle: true, // debug false
          output: {
            comments: false,
            beautify: false, // debug true
          }
        },
        warnings: true,
      }),

      /**
       * Plugin: NormalModuleReplacementPlugin
       * Description: Replace resources that resourceRegExp with newResource
       */
      new NormalModuleReplacementPlugin(
        /(angular2|@angularclass)((\\|\/)|-)hmr/,
        helpers.root('config/empty.js')
      ),

      new NormalModuleReplacementPlugin(
        /zone\.js(\\|\/)dist(\\|\/)long-stack-trace-zone/,
        helpers.root('config/empty.js')
      ),

      new HashedModuleIdsPlugin(),

      /**
       * AOT
       * Manually remove compiler just to make sure it's gone
       */
      (AOT ? (
        new NormalModuleReplacementPlugin(
          /@angular(\\|\/)compiler/,
          helpers.root('config/empty.js')
        )
      ) : (new LoaderOptionsPlugin({}))),

      /**
       * Plugin LoaderOptionsPlugin (experimental)
       */
      new LoaderOptionsPlugin({
        minimize: true,
        debug: false,
        options: {
          /**
           * Html loader advanced options
           */
          // TODO: Need to workaround Angular 2's html syntax => #id [bind] (event) *ngFor
          htmlLoader: {
            minimize: true,
            removeAttributeQuotes: false,
            caseSensitive: true,
            customAttrSurround: [
              [/#/, /(?:)/],
              [/\*/, /(?:)/],
              [/\[?\(?/, /(?:)/]
            ],
            customAttrAssign: [/\)?\]?=/]
          },
        }
      })
    ],

    /**
     * Include polyfills or mocks for various node stuff
     * Description: Node configuration
     */
    node: {
      global: true,
      crypto: 'empty',
      process: false,
      module: false,
      clearImmediate: false,
      setImmediate: false
    }
  })
}
