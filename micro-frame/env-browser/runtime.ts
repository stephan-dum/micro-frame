import createNode from "@micro-frame/core/createNode";
import defaultPlugins from "@micro-frame/core/plugins";
import { PnPNode, Init } from "./types";
import getInsertVirtual from './utils/getInsertVirtual';
import addFormListener from "./utils/addFormListener";
import addAnchorListener from "./utils/addAnchorListener";

type AssetHandler = (asset: string) => HTMLMetaElement | HTMLScriptElement | HTMLLinkElement;

const assetTypes: Record<string, AssetHandler> = {
  css: (href) => {
    return Object.assign(document.createElement('link'), {
      rel: 'stylesheet',
      href,
    });
  },
  mjs: (src) => {
    return Object.assign(document.createElement('script'), {
      type: 'module',
      src,
    });
  },
  js: (src) => {
    return Object.assign(document.createElement('script'), {
      async: true,
      src: src.replace(/\.mjs$/, '.js'),
    });
  },
  jsm: (src) => {
    return assetTypes.mjs(src.replace(/\.jsm$/, '.mjs'),)
  },
};
const createAsset = (asset: string) => {
  const lastIndex = asset.lastIndexOf('.');
  if (lastIndex >= 0) {
    const extension = asset.slice(lastIndex + 1);
    if (extension in assetTypes) {
      return assetTypes[extension](asset);
    }
  }

  throw new ReferenceError(`No file extension given for ${asset}`);
};

const init: Init = async (rootPath, plugins = [], virtualNode= document.body) => {
  const context = {
    virtual: getInsertVirtual(virtualNode),
    location: document.location,
    levelId: '0',
    provides: {},
    setAssets: (assets: string[]) => {
      console.log('## setting assets', assets);
      return Promise.all(
        assets.map((rawAsset) => {
          const asset = createAsset(rawAsset);
          const promise = new Promise((resolve) => {
            asset.onload = resolve;
          });
          document.head.appendChild(asset);
          return promise.then(() => asset);
        })
      );
    },
    load: (path: string) => {
      console.log('## load', path);
      // @ts-ignore
      return window.externalImport('/' + path);
    },
  };

  plugins.forEach(({ lazy, src, type }) => {
    if (lazy) {
      defaultPlugins[type] = async (...args: any[]) => (await externalImport(src)).default(...args);
    } else {

    }
  });

  const { default: rootNode } = await externalImport(rootPath);

  const root = await createNode<PnPNode>(rootNode, context, true);

  addAnchorListener(root);
  addFormListener(root);
}

export default init;
