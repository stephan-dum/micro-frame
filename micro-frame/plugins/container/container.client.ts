import { PnPNodeConstructor, PnPNode } from "@micro-frame/browser/types";
import createNode from '@micro-frame/core/createNode';
import { ContainerNode } from "./types";
import path from "path";
const container: PnPNodeConstructor<ContainerNode> = async ({ name }, parentContext) => {
  const { entryByChunkName, assetsByChunkName, externalsByChunkName } = parentContext;

  // @ts-ignore
  await parentContext.setAssets([
    ...(parentContext.assetsByChunkName[name] || []),
    ...(parentContext.externalsEntryByChunkName[name] || []),
  ]);

  const {
    default: node,
    ...subContext
  } = await externalImport('/' + entryByChunkName[name]);

  const childContext = {
    ...parentContext,
    ...subContext
  };

  console.log('container client end', node, childContext);


  return {
    unload: () => {
      // remove all assets
    }
  }
}

container.key = 'container';

export default container;
