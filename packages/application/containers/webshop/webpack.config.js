const path = require("path");

const deps = require("./package.json").dependencies;
const { StatsWriterPlugin } = require("webpack-stats-plugin")
const getTypescriptRule = require('@micro-frame/webpack/rules/getTypescriptRule');
const getResolve = require('@micro-frame/webpack/getResolve');
const getCSSRule = require("@micro-frame/webpack/rules/getCSSRule");
const getExtractCSSChunksPlugin = require("@micro-frame/webpack/plugins/getExtractCSSChunksPlugin");
const getShellPlugin = require("@micro-frame/webpack/plugins/getShellPlugin");
// const getModuleFederationPlugin = require('@micro-frame/webpack/plugins/getModuleFederationPlugin');

module.exports = (env, { mode }) => {
  const name = `webshop_${mode}`;
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
      webshop: path.resolve(__dirname, './index.ts'),
    },
    externals: {
      react: 'react',
    },
    ...getResolve(),
    module: {
      rules: [
        getTypescriptRule(path.resolve(__dirname, './tsconfig.json')),
        getCSSRule({ scope: path.relative(root, __dirname) }),
      ]
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
      }
    },
    plugins: [
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
      })
      // getModuleFederationPlugin({
      //   name: 'webshop',
      //   filename: "webshop.js",
      //   library: { type: "module", name: "webshop" },
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
