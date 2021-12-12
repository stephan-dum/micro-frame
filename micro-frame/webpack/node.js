const path = require('path');
const nodeExternals = require('webpack-node-externals');

const deps = require("./package.json").dependencies;

const getTypescriptRule = require('@micro-frame/webpack/rules/getTypescriptRule');
const getResolve = require('@micro-frame/webpack/getResolve');
const getModuleFederationPlugin = require('@micro-frame/webpack/plugins/getModuleFederationPlugin');

module.exports = (env, options) => {
  const { mode } = options;
  const name = `runtime_node_${mode}`;

  return {
    mode,
    name,
    context: path.resolve(__dirname),
    target: 'node',
    entry: {
      runtime: require.resolve('./start-server.ts'),
    },
    externalsPresets: { node: true },
    // externals: [/\.yarn/, nodeExternals()],
    // experiments: {
    //   outputModule: true,
    // },
    // externalsType: 'node-commonjs',
    ...getResolve(),
    module: {
      rules: [
        getTypescriptRule(require.resolve('./tsconfig.json')),
      ]
    },
    output: {
      path: path.join(__dirname, '.dist'),
      filename: './[name].js',
    },
    plugins: [
      getModuleFederationPlugin({
        name: 'runtime',
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
  };
};
