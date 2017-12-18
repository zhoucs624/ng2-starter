const webpack = require('webpack');
const helpers = require('./helpers');

/**
 * Webpack plugins
 *
 * problem with copy-webpack-plugin
 */
const AssetsPlugin = require('assets-webpack-plugin');
const IgnorePlugin = require('webpack/lib/IgnorePlugin');
const NormalModuleReplacementPlugin = require('webpack/lib/NormalModuleReplacementPlugin');
const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;
const HtmlElementsPlugin = require('./html-elements-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const ngcWebpack = require('ngc-webpack');

/**
 * Webpack Constants
 */
const HMR = helpers.hasProcessFlag('hot');
const AOT = process.env.BUILD_AOT || helpers.hasNpmFlag('aot');
const METADATA = {
  title: 'ng2-starter',
  baseUrl: './',
  isDevServer: helpers.isWebpackDevServer(),
  HMR: HMR,
  AOT: AOT
};

/**
 * Webpack configuration
 *
 */
module.exports = function (options) {
  let isProd = options.env === 'production';

  return {
    /**
     * Cache generated modules and chunks to improve performance for multiple incremental builds
     * This is enabled by default in watch mode.
     * You can pass false to disable it.
     *
     */

    // cache: false,

    /**
     * The entry point for the module
     * Our Angular app
     *
     */
    entry: {
      'polyfills': './src/polyfills.ts',
      'main': AOT ? './src/main.aot.ts': './src/main.ts'
    },

    /**
     * Options affecting the resolving of modules.
     *
     */
    resolve: {
      /**
       * An array of extensions that should be used to resolve modules.
       *
       */
      extensions: ['.ts', '.js', '.json'],

      /**
       * An array of directory names to be resolved to the current directory
       */
      modules: [helpers.root('src'), helpers.root('node_modules')]
    },

    /**
     * Options affecting the normal modules.
     *
     */
    module: {
      rules: [
        /**
         * Typescript loader support for .ts
         *
         * Component Template/Style intergration using `angular2-template-loader`
         * Angular2 lazy loading (async routes) via `ng-router-loader`
         *
         * `ng-router-loader` expects vanilla javascript code, not Typescript code. This is why the
         * order of the loader matter.
         */
        {
          test: /\.ts$/,
          use: [
            {
              /**
               * Make sure to chain vanilla js code, i.e. TS compilation output.
               */
              loader: 'ng-router-loader',
              options: {
                loader: 'async-import',
                genDir: 'compiled',
                aot: AOT
              }
            },{
              loader: 'awesome-typescript-loader',
              options: {
                configFileName: 'tsconfig.webpack.json',
                useCache: !isProd
              }
            },{
              loader: 'ngc-webpack',
              options: {
                disable: !AOT
              }
            },{
              loader: 'angular2-template-loader'
            }
          ],
          exclude: [/\.(spec|e2e)\.ts&/]
        },

        /**
         * To string and css loader support for *.css files (from Angular components)
         * Returns file content as string
         */
        {
          test: /\.css$/,
          use: ['to-string-loader', 'css-loader'],
          exclude: [helpers.root('src','styles')]
        },

        /**
         * To string and saas loader support for *.scss files (from Angular components)
         * Returns compiled css content as string
         *
         */
        {
          test: /\.scss$/,
          use: ['to-string-loader', 'css-loader', 'sass-loader'],
          exclude: [helpers.root('src','styles')]
        },

        /**
         * Raw loader support for *.html
         * Returns file content as string
         *
         */
        {
          test: /\.html$/,
          use: 'raw-loader',
          exclude: [helpers.root('src/index.html')]
        },

        /**
         * File loader for supporting images, for example, in CSS files
         */
        {
          test: /\.(jpe?g|png|gif)$/,
          use: 'file-loader'
        },

        /**
         * File loader for supporting fonts, for example, in CSS files.
         */
        {
          test: /\.(eot|woff2?|svg|ttf)([\?]?.*)$/,
          use: 'file-loader'
        }
      ]
    },

    /**
     * Add additional plugins to the compiler.
     */
    plugins: [
      // Remove all locale files in moment with the IgnorePlugin if you don't need them
      // new IgnorePlugin(/^\.\/locale$/, /moment$/),

      /**
       * Plugin: ForkCheckerPlugin
       * Description: Do type checking in a separate process, so webpack doesn't neet to wait.
       *
       */
      new CheckerPlugin(),

      /**
       * Plugin: CommonsChunkPlugin
       * Description: Shares common code between the pages.
       * It identifies common modules and put them into a commons chunk
       */
      new CommonsChunkPlugin({
        name: 'polyfills',
        chunks: ['polyfills']
      }),

      /**
       * This enables tree shaking of the vendor modules
       */
      // new CommonsChunkPlugin({
      //   name: 'vendor',
      //   chunks: ['main'],
      //   minChunks: module => /node_modules/.test(module.resource)
      // }),

      /**
       * Specify the correct order the scripts will be injected in
       */
      // new CommonsChunkPlugin({
      //   name: ['polyfills', 'vendor'].reverse()
      // }),

      // new CommonsChunkPlugin({
      //   name: ['manifest'],
      //   minChunks: Infinity
      // }),

      /**
       * Plugin: ContextReplacementPlugin
       * Description: Provides context to Angular's use of System.import
       */
      new ContextReplacementPlugin(
        /**
         * The (\\|\/) place accounts for path separators in *nix and Windows
         */
        /(.+)?angular(\\|\/)core(.+)?/,
        helpers.root('src'),// location of your src
        {
          /**
           * Your Angular Async Route paths relative to this root directory
           */
        }
      ),

      /**
       * Plugin: CopyWebpackPlugin
       * Description: Copy files and directories in webpack.
       *
       * Copies project static assets.
       */
      new CopyWebpackPlugin([
          { from: 'src/assets', to: 'assets' },
          { from: 'src/meta'}
        ],
        isProd ? { ignore: ['mock-data/**/*' ] } : undefined
      ),

      /**
       * Plugin: HtmlWebpackPlugin
       * Description: Simplifies creation of HTML files to serve your webpack bundles.
       *
       * This is especially useful for webpack bundles that include a hash in the filename
       * which changes every compilation
       */
      new HtmlWebpackPlugin({
        template: 'src/index.html',
        title: METADATA.title,
        chunksSortMode: function (a, b) {
          const entryPoints = ['inline', 'polyfills', 'sw-register', 'styles', 'vendor', 'main'];
          return entryPoints.indexOf(a.names[0] - entryPoints.indexOf(b.names[0]));
        },
        metadata: METADATA,
        inject: 'body'
      }),

      /**
       * Plugin: ScriptExtHtmlWebpackPlugin
       * Description: Enhances html-webpack-plugin functionality
       * with different deployment options for your scripts including
       */
      new ScriptExtHtmlWebpackPlugin({
        sync: /polyfills|vendor/,
        defaultAttribute: 'async',
        preload: [/polyfills|vendor|main/],
        prefetch: [/chunk/]
      }),

      /**
       * Plugin: HtmlElementsPlugin
       * Description: Generate html tags based on javascript maps.
       *
       * If a publicPath is set in the webpack output configuration, it will be automatically added to
       * href attributes, you can disable that by adding a "=href": false property.
       * You can also enable it to other attribute by settings "=attName": true.
       *
       * The configuration supplied is map between a location (key) and an element definition object (value)
       * The location (key) is then exported to the template under then htmlElements property in webpack configuration
       *
       * Example:
       *  Adding this plugin configuration
       *  new HtmlElementsPlugin({
       *   headTags: { ... }
       *  })
       *
       * Means we can use it in the template like this:
       * <%= webpackConfig.htmlElements.headTags %>
       *
       * Dependencies: HtmlWebpackPlugin
       */
      new HtmlElementsPlugin({
        headTags: require('./head-config.common')
      }),

      /**
       * Plugin LoaderOptionsPlugin (experimental)
       */
      new LoaderOptionsPlugin({}),

      new ngcWebpack.NgcWebpackPlugin({
        /**
         * If false the plugin is a ghost, it will not perform any action.
         * This property can be used to trigger AOT on/off depending on your build taget (prod, staging etc...)
         *
         * The state can not change after initializing the plugin
         * @default true
         */
        disabled: !AOT,
        tsConfig: helpers.root('tsconfig.webpack.json'),
      }),

      /**
       * Plugin: InlineManifestWebpackPlugin
       * Inline Webpack's manifest.js in index.html
       */
      new InlineManifestWebpackPlugin()
    ],

    /**
     * Include polyfills or mocks for various node stuff
     * Description: Node configuration
     */
    node: {
      global: true,
      crypto: 'empty',
      process: true,
      module: false,
      clearImmediate: false,
      setImmediate: false
    }
  }
}
