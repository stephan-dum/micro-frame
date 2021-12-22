import createNode from '@micro-frame/core/createNode';
import { NodeTypes } from '@micro-frame/node/types';
import { ContainerNode } from "./types";
import path from "path";

const container: NodeTypes<ContainerNode> = async (options, parentContext) => {
  const { name, aboveFold } = options;
  const { publicPath, entryByChunkName, assetsByChunkName, externalsEntryByChunkName } = parentContext;

  const node = require(path.join(publicPath, name, entryByChunkName[name])).default;

  const childContext = {
    ...parentContext,
    containerName: name,
    chunkName: name,
    aboveFold: aboveFold || parentContext.aboveFold
  };

  await parentContext.setAssets([
    ...(assetsByChunkName[name] || []),
    ...(externalsEntryByChunkName[name] || []),
    path.join(name, entryByChunkName[name]) + 'm',
  ], childContext.aboveFold);

  return createNode(node, childContext);
};

container.key = 'container';

export default container;
