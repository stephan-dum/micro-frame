import { RequestHandler } from 'express';
import Stream = require('stream');
import { createReadStream } from 'fs';
import path from 'path';

import createNode from "@micro-frame/core/createNode";
import createDerefer from "@xxxs-shop/utils/createDerefer";
import createElement from "@micro-frame/utils-create-element";
import Logger from "@xxxs-shop/utils/logger";
import nodes from '@micro-frame/core/plugins';
import { ClientPlugin } from "@micro-frame/core/types";
import { TemplateNode } from "@micro-frame/utils-create-element/types";

import {IRenderContextSSR, QueueResponseTypes} from "../types";
import { MicroFramePlugin } from "../../cli/types";
import * as fs from "fs";
import {ResolveOptions} from "../../env-cl/types";
import { ServerConfig } from "../types";
import createAsset from "../utils/createAsset";

export type SSRProxy = (config: ServerConfig) => RequestHandler;

const HEAD_TIMEOUT = 30 * 1000;

const createPlugins = (plugins: MicroFramePlugin[], publicPath: string, resolveOptions: ResolveOptions): ClientPlugin[] => plugins.map((plugin) => {
  const pkg = require(require.resolve(plugin.node_module+'/package.json', resolveOptions));
  nodes[plugin.type] = require(require.resolve(path.join(plugin.node_module, pkg.main), resolveOptions)).default;
  const clientPluginSrc = require.resolve(path.join(plugin.node_module, pkg.browser || pkg.main), resolveOptions);
  const baseName = 'mf_plugin_'+path.basename(clientPluginSrc);
  const clientPluginDest = path.join(publicPath, baseName);
  fs.copyFileSync(clientPluginSrc, clientPluginDest);
  return {
    type: plugin.type,
    src: baseName,
    lazy: plugin.lazy,
    // lazy: false,
  };
});

interface LocalGlobal {
  importExternal: (container: string, url: string) => Record<string, any>;
}

declare const global: LocalGlobal;

const ssrProxy: SSRProxy = (config) => {
  const { plugins, publicPath, root, privatePath, projectRoot, container, rootEntry } = config;
  const resolveOptions = { paths: [projectRoot] };

  const externalsMap = require(path.join(projectRoot, privatePath, 'externals/index.js')).default;
  global.importExternal = (container: string, url: string) => {
    const module = require(externalsMap[container][url]);
    return module.default || module;
  };

  const rootNode = require(path.join(projectRoot, '.dist/public', rootEntry.container , rootEntry.path)).default;

  const clientPlugins = createPlugins(plugins, publicPath, resolveOptions);
  const microFrameClient = require.resolve('@micro-frame/browser/.dist/micro-frame.js');
  const fragmentHeadStart = path.join(__dirname, '../html-fragments/headStart.html');
  const publicBase = path.join(projectRoot, publicPath);

  return async (request, response) => {
    const lang = 'de';

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

    const headSent = createDerefer<TemplateNode[]>(HEAD_TIMEOUT);
    let currentPromise: Promise<any> = headSent
      .catch(() => {
        // TODO: add error page
        Logger.log(request.url);
        Logger.error('Abort connection, head was not sent within 30 seconds!');
        response.end();
      })
      .then(() => send(`</head><body>`))
      .then(() => send(`<script>microFrame("${rootEntry.container}/${rootEntry.path}", "${container}", ${JSON.stringify(clientPlugins)});</script>`));

    const load = (id: string) => {
      return require(path.join(publicBase, id));
    }

    const context: IRenderContextSSR = {
      load,
      containerName: container,
      chunkName: 'root',
      provides: {},
      params: {},
      aboveFold: false,
      projectRoot,
      publicPath: publicBase,
      queueResponse: (promise) => {
        currentPromise = currentPromise.then(() => promise).then(send);
      },
      url: request.url,
      setAssets: (assets = [], aboveFold = false) => {
        return assets.map(
          (asset) => createAsset(asset, aboveFold, publicBase)
        )
          .flat().reduce(
            (currentPromise, value) => currentPromise.then(() => send(value)),
            Promise.resolve(),
          )
      },
      setHead: async (meta = [], last = true) => {
        await send(meta.map((child) => createElement(child, context)).join(''));

        if (last) {
          headSent.resolve();
        }
      },
      props: {},
      levelId: '0',
      assetsByChunkName: {},
      entryByChunkName: {},
      externalsEntryByChunkName: {},
      externalsByChunkName: {},
    };

    const preload = [
      // service worker + manifest
      // load runtime-browser
      // preload fonts
      // inline global css
    ].map((element) => createElement(element, context)).join('');

    try {
      response.setHeader('Content-Type', 'text/html; charset=UTF-8');
      response.setHeader('Transfer-Encoding', 'chunked');

      response.write(`<html lang="${lang}"><head>`);
      await send(createReadStream(fragmentHeadStart));
      response.write(`<script>`);
      await send(createReadStream(microFrameClient));
      response.write(`</script>`);
      response.write(preload);

      await createNode(rootNode, context).then(() => currentPromise);

      response.write('</body></html>');
      response.end();
    } catch (error) {
      Logger.error(error);
    }
  };
}

export default ssrProxy;
