import path from "path";
import {TemplateNode} from "@micro-frame/utils-create-element/types";

const assetFactories: Record<string, (asset: string) => TemplateNode> = {
  css: (href) => `<link rel="stylesheet" href="${href}"/>`,
  // TODO: fix file extension back to async
  // js: (src) => `<script type="module" src="${src}"></script>`,
  // js: (src) => `<script async src="${src}"></script>`,
  js: (href) => `<link rel="preload" as="script" href="${href}" />`,
  // mjs: (src) => `<script type="module" src="${src}"></script>`
  mjs: (href) => `<link rel="modulepreload " href="${href.replace(/\.mjs$/, '.js')}" />`,

  jsm: (href) => assetFactories.mjs(href.replace(/\.jsm$/, '.mjs')),
};

const createAsset = (asset: string) => {
    const ext = path.extname(asset).slice(1);
    const factory = assetFactories[ext];

    if(!factory) {
      throw new TypeError('Only css and js are supported asset types!');

    }

    return factory(asset);
}

export default createAsset;
