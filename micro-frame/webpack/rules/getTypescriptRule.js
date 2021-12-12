const getTypescriptRule = (tsConfigPath = 'tsconfig.json') => (
  {
    test: /\.[jt]sx?$/,
    loader: require.resolve('ts-loader'),
    options: {
      transpileOnly: true,
      configFile: tsConfigPath,
    },
  }
);

module.exports = getTypescriptRule;
