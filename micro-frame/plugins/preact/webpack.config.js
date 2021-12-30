const path = require('path');
const getTypescriptRule = require('@micro-frame/webpack/rules/getTypescriptRule');
const getResolve = require('@micro-frame/webpack/getResolve');

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
      name: '@micro-frame/plugin-preact-node',
      target: 'node',
      entry: {
        "preact-node": require.resolve('./preact-node.ts'),
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
      name: '@micro-frame/plugin-preact-web',
      target: 'web',
      externalsType: 'module',
      entry: {
        "preact-client": require.resolve('./preact-client.tsx'),
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
    }
  ];
};
