const helpers = require('./helpers');

/**
 * Webpack Plugins
 */
const webpack = require('webpack');
const ProvidePlugin = webpack.ProvidePlugin;
const DefinePlugin = webpack.DefinePlugin;
const LoaderOptionsPlugin = webpack.LoaderOptionsPlugin;
const ContextReplacementPlugin = webpack.ContextReplacementPlugin;

/**
 * Webpack Constants
 */
const ENV = process.env.ENV = process.env.NODE_ENV = 'test';

/**
 * Webpack configuration
 */
module.exports = function (options) {
  return {
    /**
     * Source map for Karma from the help of karma-sourcemap-loader & karma-webpack
     *
     * Do not change, leave as is or it wont work
     */
    devtool: 'inline-source-map',

    /**
     * Options affecting the resolving of modules
     */
    resolve: {
      /**
       * An array of extensions that should be used to resolve modules.
       */
      extensions: ['.ts', '.js'],

      /**
       * Make sure root is src
       */
      modules: [helpers.root('src'), 'node_modules']
    },

    /**
     * Options affecting the normal modules.
     */
    module: {
      rules: [
        /**
         * Source map loader support for *.js files
         * Extract SourceMaps for source files that as added as sourceMappingURL comment.
         */
        {
          enforce: 'pre',
          test: /\.js$/,
          loader: 'source-map-loader',
          exclude: [
            /**
             * These packages have problems with their sourcemaps
             */
            helpers.root('node_modules/rxjs'),
            helpers.root('node_modules/@angular')
          ]
        },

        /**
         * Typescript loader support for .ts and Angular 2 async routes via .async.ts
         */
        {
          test: /\.ts/,
          use: [
            {
              loader: 'awesome-typescript-loader',
              query: {
                /**
                 * Use inline sourcemaps for "karma-remap-coverage" reporter
                 */
                sourcemap: false,
                inlineSourceMap: false,
                compilerOptions: {
                  /**
                   * Remove Typescript helpers to be injected
                   * below by DefinePlugin
                   *
                   */
                  removeComments: true
                }
              }
            },
            'angular2-template-loader'
          ],
          exclude: [/\.e2e\.ts$/]
        },

        /**
         * Raw loader support for *.css files
         * Return file content as string
         */
        {
          test: /\.css$/,
          loader: ['to-string-loader', 'css-loader'],
          exclude: [helpers.root('src/index.html')]
        },

        /**
         * Raw loader support for *.scss files
         */
        {
          test: /\.scss$/,
          loader: ['raw-loader', 'sass-loader'],
          exclude: [helpers.root('src/index.html')]
        },

        /**
         * Raw laoder support for *.html
         * Return file content as string
         */
        {
          test: /\.html$/,
          loader: 'raw-loader',
          exclude: [helpers.root('src/index.html')]
        },


        /**
         * Instruments js files with istanbul for subsequent code coverage reporting
         * Instrument only testing sources.
         */
        {
          enforce: 'post',
          test: /\.(js|ts)$/,
          loader: 'istanbul-instrumenter-loader',
          include: helpers.root('src'),
          exclude: [
            /\.(e2e|spec)\.ts$/,
            /node_modules/
          ]
        }
      ]
    },

    /**
     * Add additional plugins to the compiler
     */
    plugins: [
      /**
       * Plugin: DefinedPlugin
       * Description: Define free varaibles
       * Useful for having development builds with debug logging or adding global constants
       *
       * Environment helpers
       *
       * NOTE: when adding more properties make sure you include them in custom0typings.d.ts
       *
       */
      new DefinePlugin({
        'ENV': JSON.stringify(ENV),
        'HMR': false,
        'process.env': {
          'ENV': JSON.stringify(ENV),
          'NODE_ENV': JSON.stringify(ENV),
          'HMR': false
        }
      }),

      /**
       * Plugin: ContextReplacementPlugin
       * Description: Provides context to Angular's use of System.import
       */
      new ContextReplacementPlugin(
        /**
         * The (\\|\/) piece accounts for path separators in *nix and Windows
         */
        /angular(\\|\/)core(\\|\/)@angular/,
        helpers.root('src'), // location of your src
        {
          /**
           * your Angular Async Route path relative to this root directory
           */
        }
      ),

      /**
       * Plugin LoaderOptionsPlugin (experimental)
       */
      new LoaderOptionsPlugin({
        debug: false,
        options: {
          /**
           * legacy options go here
           */
        }
      })
    ],

    /**
     * Disable performance hints
     */
    performance: {
      hints: false
    },

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
  }
}
