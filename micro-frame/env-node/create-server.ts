import path from "path";
import compression from 'compression';
import express from 'express';
import Logger from '@xxxs-shop/utils/logger';
import ssrProxy from "./middleware/ssr-proxy";
import { ServerConfig } from "./types";

const createServer = (config: ServerConfig) => {
  const { publicPath, port, projectRoot } = config;
  const publicDir = path.join(projectRoot, publicPath);

  const app = express()
    .use(compression())
    .use(express.static(publicDir))
    .use(ssrProxy(config));

  app.listen(port, () => {
    Logger.info(`The server is running at http://localhost:${port}`);
    Logger.info('public path:', publicDir);
  });
}

export default createServer;
