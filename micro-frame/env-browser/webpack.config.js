const path = require('path');

// const deps = require("./package.json").dependencies;

// const getBabelRule = require('@micro-frame/webpack/rules/getBabelRule');
const getTypescriptRule = require('@micro-frame/webpack/rules/getTypescriptRule');
const getResolve = require('@micro-frame/webpack/getResolve');
// const getHTMLPlugin = require('@micro-frame/webpack/plugins/getHTMLPlugin');
// const getProviderPlugin = require('@micro-frame/webpack/plugins/getProviderPlugin');
// const getModuleFederationPlugin = require('@micro-frame/webpack/plugins/getModuleFederationPlugin');

module.exports = (env, options) => {
  const { mode } = options;

  const name = `runtime_browser_${mode}`;

  return {
    mode,
    name,
    context: path.resolve(__dirname),
    target: 'web',
    entry: {
      'micro-frame': require.resolve('./runtime.ts'),
    },
    ...getResolve(),
    module: {
      rules: [
        getTypescriptRule(require.resolve('./tsconfig.json')),
      ]
    },
    // externalsType: 'module',
    output: {
      library: {
        name: 'microFrame',
        type: 'var',
        export: 'default',
      },
      path: path.join(__dirname, '.dist'),
      filename: './[name].js',
      publicPath: '/',
    },
    plugins: [
      // new ModuleFederationPlugin({
      //   name: 'runtime',
      //   shared: {
      //     react: {
      //       requiredVersion: deps.react,
      //       import: "react",
      //       shareKey: "react",
      //       shareScope: "default",
      //       singleton: true,
      //       eager: true,
      //     },
      //     'react-dom': {
      //       singleton: true,
      //       requiredVersion: deps["react-dom"],
      //       eager: true,
      //     }
      //   },
      // }),
      // getHTMLPlugin(),
      // getProviderPlugin(),
    ]
  };
};
