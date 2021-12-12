const path = require("path");
const { StatsWriterPlugin } = require("webpack-stats-plugin")
// const deps = require("./package.json").dependencies;

const getTypescriptRule = require('@micro-frame/webpack/rules/getTypescriptRule');
// const getMicroFrameRule = require('@micro-frame/webpack/rules/getMicroFrameRule');
const getResolve = require('@micro-frame/webpack/getResolve');
const getShellPlugin = require("@micro-frame/webpack/plugins/getShellPlugin");

// import path from 'path';
// import { StatsWriterPlugin } from 'webpack-stats-plugin';
// import getTypescriptRule from '@micro-frame/webpack/rules/getTypescriptRule';
// import getResolve from '@micro-frame/webpack/getResolve';




// const getModuleFederationPlugin = require('@micro-frame/webpack/plugins/getModuleFederationPlugin');

module.exports = (env, { mode }) => {
  const name = `MicroShop_${mode}`;

  return {
    mode,
    name,
    context: path.join(__dirname),
    target: 'es2020',
    experiments: {
      outputModule: true,
    },
    externalsType: 'module',
    entry: {
      application: path.resolve(__dirname, './index.ts'),
    },
    ...getResolve(),
    module: {
      rules: [
        getTypescriptRule(path.resolve(__dirname, './tsconfig.json')),
      ]
    },
    output: {
      module: true,
      chunkFormat: 'module',
      filename: './[name].js',
      // path: path.join(__dirname, '../../../.dist'),
      path: path.join(__dirname, '.dist/public'),
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
        filename: "../private/stats.json",
        transform: ({ assetsByChunkName, entrypoints }) => JSON.stringify({
          assetsByChunkName,
          entry: Object.keys(entrypoints)[0],
        }),
      }),
      getShellPlugin({
        onBuildExit: {
          scripts: ["yarn update-package " + __dirname],
        }
      }),
      // getModuleFederationPlugin({
      //   name: 'MicroShop',
      //   filename: "MicroShop.js",
      //   library: { type: "module", name: "MicroShop" },
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
