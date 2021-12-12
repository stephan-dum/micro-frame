const path = require('path');
// const requireFromString = require('require-from-string');

// const ssrMiddleware = (request, response, next) => {
//   const { webpackStats, fs } = response.locals;
//
//   const [/*devServer*/, /*clientStats*/, serverStats] = webpackStats.stats;
//   const { assetsByChunkName, outputPath } = serverStats.toJson();
//   const rawModules = assetsByChunkName.renderPage.map((asset) => fs.readFileSync(join(outputPath, asset))).join('');
//
//   const renderPage = requireFromString(rawModules, join(outputPath, 'renderPage.js')).default;
//
//   // Recreate a full URL
//   const scheme = request.secure ? 'https' : 'http';
//   const urlStr = `${scheme}://${request.headers.host}${request.url}`;
//
//   return renderPage(new URL(urlStr), request.headers)
//     .then(({ content, statusCode }) => {
//       response.status(statusCode || 200);
//       response.send(content);
//     })
//     .then(next);
// };
//
// const ssrOptions = {
//   hot: ({ name }) => name === 'client.development',
//   historyApiFallback: false,
//   devMiddleware: {
//     writeToDisk: (filePath) => writeToDiskReg.test(filePath),
//   },
//   onAfterSetupMiddleware: (app) => {
//     app.use(ssrMiddleware);
//   },
//   serverSideRender : true,
// };

const devServer = (env, options) => {
  const { mode } = options;
  const { port, render } = env;

  const devServer = {
    host: 'localhost',
    port,
    hot: true,
    historyApiFallback: true,
    devMiddleware: {
      index: true,
      writeToDisk: true,
      // publicPath: path.resolve(__dirname, '../../public'),
    },
    static: {
      serveIndex: true,
      directory: path.join(__dirname, '../../.dist'),
    },
    allowedHosts: 'all',
  };

  // if (render === 'ssr') {
  //   Object.assign(devServer, ssrOptions);
  // }

  return {
    mode,
    name: 'dev-server',
    entry: {},
    devServer
  };
};

module.exports = devServer;
