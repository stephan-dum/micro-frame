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
      href: '/' + href,
    });
  },
  mjs: (src) => {
    return Object.assign(document.createElement('script'), {
      type: 'module',
      src: '/' + src,
    });
  },
  js: (src) => {
    return Object.assign(document.createElement('script'), {
      async: true,
      src: '/' + src.replace(/\.mjs$/, '.js'),
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

interface ActiveAsset {
  usage: number;
  node: HTMLElement;
  promise: Promise<void>;
}
const activeAssets: Record<string, ActiveAsset> = {};
const init: Init = async (rootPath, rootContainer, plugins = [], virtualNode= document.body) => {
  const load = (path: string) => window.esImport('/' + path);

  const context = {
    virtual: getInsertVirtual(virtualNode),
    location: document.location,
    levelId: '0',
    containerName: rootContainer,
    provides: {},
    aboveFold: false,
    removeAssets: (assets: string[]) => {
      assets.forEach((rawAsset) => {
        const asset = activeAssets[rawAsset];
        asset.usage -= 1;

        if(asset.usage === 0) {
          delete activeAssets[rawAsset];
          document.head.removeChild(asset.node);
        }
      });
    },
    setAssets: (assets: string[]) => {
      return Promise.all(
        assets.map((rawAsset) => {
          if (!(rawAsset in activeAssets)) {
            const assetNode = createAsset(rawAsset);

            const promise = new Promise((resolve) => {
              assetNode.onload = resolve;
            }).then(() => {});

            document.head.appendChild(assetNode);
            activeAssets[rawAsset] = {
              usage: 0,
              node: assetNode,
              promise,
            }
          }

          const asset = activeAssets[rawAsset];
          asset.usage += 1;

          return asset.promise;
        })
      );
    },
    load,
  };

  plugins.forEach(({ lazy, src, type }) => {
    if (lazy) {
      defaultPlugins[type] = async (...args: any[]) => (await load(src)).default(...args);
    } else {

    }
  });

  const { default: rootNode } = await load(rootPath);

  // const rootNode = {
  //   type: 'container',
  //   name: rootPath,
  // };
  const root = await createNode<PnPNode>(rootNode, context, true);

  addAnchorListener(root);
  addFormListener(root);
}

export default init;
