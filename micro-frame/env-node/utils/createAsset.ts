import path from "path";
import { createReadStream } from 'fs';
import { Readable } from 'stream';

const assetFactories: Record<string, (asset: string, aboveFold?: boolean, base?: string) => string | Readable | Array<string | Readable>> = {
  css: (href, aboveFold, base) => {
    if (aboveFold) {
      return [`<style>`, createReadStream(path.join(base, href)), `</style>`];
    }
    return `<link rel="stylesheet" href="/${href}"/>`;
  },
  js: (href) => `<link rel="preload" as="script" href="/${href}" />`,
  mjs: (href) => `<link rel="modulepreload " href="/${href.replace(/\.mjs$/, '.js')}" />`,
  jsm: (href) => assetFactories.mjs(href.replace(/\.jsm$/, '.mjs')),
};

const createAsset = (asset: string, aboveFold = false, base = '') => {
  const ext = path.extname(asset).slice(1);
  const factory = assetFactories[ext];

  if(!factory) {
    throw new TypeError(`Unsupported file extension for "${asset}"! Only css and js are supported asset types!`);

  }

  return factory(asset, aboveFold, base);
}

export default createAsset;
