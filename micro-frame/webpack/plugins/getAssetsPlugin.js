const AssetsPlugin = require('assets-webpack-plugin');

const getAssetsPlugin = (options) => new AssetsPlugin({
  entrypoints: true,
  includeAuxiliaryAssets: true,
  includeDynamicImportedAssets: true,
  includeFilesWithoutChunk: true,
  prettyPrint: true,
  ...options,
});

module.exports = getAssetsPlugin;
