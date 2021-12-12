const getMicroFrameRule = () => ({
  test: /\.mf\.js$/,
  use: [
    {
      loader: require.resolve('babel-loader'),
      options: {
        plugins: [require.resolve('../babel/babel-plugin')]
      },
    },
    // require.resolve('../loaders/micro-frame')
  ],
});

module.exports = getMicroFrameRule;
