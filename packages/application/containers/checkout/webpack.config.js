const path = require("path");

const deps = require("./package.json").dependencies;

const { StatsWriterPlugin } = require("webpack-stats-plugin")
// const getAssetsPlugin = require('@micro-frame/webpack/plugins/getAssetsPlugin');
const getTypescriptRule = require('@micro-frame/webpack/rules/getTypescriptRule');
const getMicroFrameRule = require('@micro-frame/webpack/rules/getMicroFrameRule');
const getCSSRule = require('@micro-frame/webpack/rules/getCSSRule');
const getResolve = require('@micro-frame/webpack/getResolve');
// const MicroFrameStatsPlugin = require('@micro-frame/webpack/plugins/MicroFrameStatsPlugin');
const getExtractCSSChunksPlugin = require('@micro-frame/webpack/plugins/getExtractCSSChunksPlugin');
const getShellPlugin = require("@micro-frame/webpack/plugins/getShellPlugin");
// const getModuleFederationPlugin = require('@micro-frame/webpack/plugins/getModuleFederationPlugin');

module.exports = (env, { mode }) => {
  const name = `checkout_${mode}`;
  const { root } = env;
  const context = __dirname;

  return {
    mode,
    name,
    context,
    target: 'es2020',
    experiments: {
      outputModule: true,
    },
    externalsType: 'module',
    entry: {
      checkout: './index.ts',
    },
    ...getResolve(),
    module: {
      rules: [
        getTypescriptRule(path.resolve(__dirname, './tsconfig.json')),
        getCSSRule({ scope: path.relative(root, __dirname) }),
      ]
    },
    externals: {
      react: 'react',
    },
    output: {
      module: true,
      chunkFormat: 'module',
      path: path.join(__dirname, '.dist/public'),
      filename: './[name].js',
      publicPath: '/',
      environment: {
        module: true,
      },
      library: {
        type: "module",
      },
    },
    plugins: [
      // getAssetsPlugin({
      //   // filename: '../../packages/containers/Checkout/.dist/private/MicroShop.stats.json',
      //   path: path.join(__dirname, '.dist/private'),
      // }),
      // assets-webpack-plugin
      new StatsWriterPlugin({
        fields: ["assetsByChunkName", "entrypoints"],
        // stats: { preset: 'verbose' },
        filename: "../private/stats.json",
        transform: ({ assetsByChunkName, entrypoints }) => JSON.stringify({
          assetsByChunkName,
          entry: Object.keys(entrypoints)[0],
        }),
      }),
      getExtractCSSChunksPlugin(),
      getShellPlugin({
        onBuildExit: {
          scripts: ["yarn update-package " + __dirname],
        }
      }),
      // new MicroFrameStatsPlugin(),
      // getModuleFederationPlugin({
      //   name: 'checkout',
      //   filename: "checkout.js",
      //   library: { type: "module", name: "checkout" },
      //   shared: {
      //     react: {
      //       requiredVersion: deps.react,
      //       import: 'react', // the "react" package will be used a provided and fallback module
      //       shareKey: 'react', // under this name the shared module will be placed in the share scope
      //       shareScope: 'default', // share scope with this name will be used
      //       singleton: true, // only a single version of the shared module is allowed
      //       eager: true,
      //     },
      //   }
      // }),

    ]
  };
};
