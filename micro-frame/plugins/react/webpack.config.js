const path = require('path');

const deps = require("./package.json").dependencies;

// const getBabelRule = require('@micro-frame/webpack/rules/getBabelRule');
const getTypescriptRule = require('@micro-frame/webpack/rules/getTypescriptRule');
const getResolve = require('@micro-frame/webpack/getResolve');
// const getHTMLPlugin = require('@micro-frame/webpack/plugins/getHTMLPlugin');
// const getProviderPlugin = require('@micro-frame/webpack/plugins/getProviderPlugin');
const getModuleFederationPlugin = require('@micro-frame/webpack/plugins/getModuleFederationPlugin');

module.exports = (env, options) => {
  const { mode } = options;

  const base = {
    mode,
    context: path.resolve(__dirname),
    ...getResolve(),
    module: {
      rules: [
        getTypescriptRule(require.resolve('./tsconfig.json')),
      ]
    },
  };

  return [
    {
      ...base,
      name: '@micro-frame/plugin-react-node',
      target: 'node',
      entry: {
        "react-node": require.resolve('./react-node.ts'),
      },
      output: {
        library: {
          type: 'commonjs2'
        },
        path: path.join(__dirname, '.dist'),
        filename: './[name].js',
      }
    },
    {
      ...base,
      name: '@micro-frame/plugin-react-web',
      target: 'web',
      externalsType: 'module',
      entry: {
        "react-client": require.resolve('./react-client.tsx'),
      },
      experiments: {
        outputModule: true,
      },
      output: {
        // library: 'microFrameReact',
        path: path.join(__dirname, '.dist'),
        filename: './[name].js',
        publicPath: '/',
        library: {
          type: "module",
        }
      },
      plugins: [
        getModuleFederationPlugin({
          name: 'microFrameReact',
          shared: {
            react: {
              requiredVersion: deps.react,
              import: "react",
              shareKey: "react",
              shareScope: "default",
              singleton: true,
              eager: true,
            },
            'react-dom': {
              singleton: true,
              requiredVersion: deps["react-dom"],
              eager: true,
            }
          },
        }),
      ]
    }
  ];
};
