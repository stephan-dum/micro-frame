const config = {
  root: '@xxxs-shop/application',
  port: 8110,
  publicPath: './.dist/public',
  privatePath: './.dist/private',
  staticPath: './static',
  mocks: '@xxxs-shop/mocks',
  plugins: [
    {
      node_module: '@micro-frame/plugin-react',
      lazy: true,
      type: 'react',
    }
  ],
};

module.exports = config;

