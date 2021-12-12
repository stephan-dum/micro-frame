import createNode from '@micro-frame/core/createNode';
import { NodeTypes } from '@micro-frame/node/types';
import { ContainerNode } from "./types";
import path from "path";

const container: NodeTypes<ContainerNode> = async ({ name }, parentContext) => {
  const { publicPath, entryByChunkName, assetsByChunkName, externalsEntryByChunkName } = parentContext;
  console.log('## parent context', parentContext);

  const {
    default: node,
    ...subContext
  } = require(path.join(parentContext.publicPath, entryByChunkName[name]));

  const childContext = {
    ...parentContext,
    ...subContext
  };

  await parentContext.setAssets([
    ...(assetsByChunkName[name] || []),
    ...(externalsEntryByChunkName[name] || []),
    entryByChunkName[name] + 'm',// patch because ts-node/esm is not yet patched for yarn 3.1.0
  ]);

  return createNode(node, childContext);
};

container.key = 'container';

export default container;
