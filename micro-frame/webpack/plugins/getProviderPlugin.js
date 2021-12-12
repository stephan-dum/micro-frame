const { ProvidePlugin } = require('webpack');

const getProviderPlugin = () => new ProvidePlugin({
  // createElement : ['react', 'createElement'],
  // Fragment : ['react', 'Fragment'],
  classNames : ['classnames']
});

module.exports = getProviderPlugin;
