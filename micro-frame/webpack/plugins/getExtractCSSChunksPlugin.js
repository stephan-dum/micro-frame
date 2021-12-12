// const ExtractCSSChunksPlugin = require('extract-css-chunks-webpack-plugin')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');

const getExtractCSSChunksPlugin = () => {
  return new MiniCSSExtractPlugin({
    runtime: false,
  });
};

module.exports = getExtractCSSChunksPlugin;
