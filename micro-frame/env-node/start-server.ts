import express from 'express';
import Logger from '@xxxs-shop/utils/logger';
import ssrProxy, {SSRProxy} from "./middleware/ssr-proxy";
import path from "path";
import process from "process";
import {createReadStream} from "fs";
import {QueueResponseTypes} from "./types";
import Stream = require('stream');

// TODO: env vs config object
const { CWD = process.cwd(), PORT, CONFIG = path.join(CWD, './micro-frame.js')} = process.env;

const test:SSRProxy = (config, cwd = process.cwd()) => {
  const resolveOptions = { paths: [cwd] };
  const fragmentBodyStart = path.join(__dirname, './html-fragments/bodyStart.html');
  const fragmentBodyEnd = path.join(__dirname, './html-fragments/bodyEnd.html');
  return async (request, response) => {
    const lang = 'de';

    response.on('close', () => {
      // TODO: close any open connection
    });
    const send = (data: QueueResponseTypes) => {
      if (typeof data === 'string') {
        response.write(data);
      } else if (data instanceof Stream) {
        const stream = data.pipe(response, { end: false });
        return new Promise((resolve, reject) => {
          data.on('end', resolve);
          stream.on('error', reject);
        });
      } else {
        throw new TypeError('Only strings and streams are allowed: ' + typeof data);
      }
    };

    try {
      response.setHeader('Content-Type', 'text/html; charset=UTF-8');
      response.setHeader('Transfer-Encoding', 'chunked');

      response.write(`<html lang="${lang}"><head>`);
      await send(createReadStream(fragmentBodyStart));
      await send(createReadStream(fragmentBodyEnd));
    } catch (e) {
      console.log(e);
    }
  };
};

const createServer = async () => {
  const config = await import(CONFIG);
  const { publicPath } = config;

  // const { default: root } = await import(path.join(publicPath, `.${rootPath}`));

  const app = express()
    .use(express.static(publicPath))
    // .use(test(config, CWD))
    .use(ssrProxy(config));

  app.listen(Number.parseInt(PORT), () => {
    Logger.info(`The server is running at http://localhost:${PORT}`);
    Logger.info('public path:', publicPath);
  });
}

createServer();

