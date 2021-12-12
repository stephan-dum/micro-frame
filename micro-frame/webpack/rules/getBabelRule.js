
const getBabelRule = (babelOptions = {}) => ({
  test: /\.([tj]sx?|mjs)$/,
  loader: require.resolve('babel-loader'),
  options: babelOptions,
});

module.exports = getBabelRule;
