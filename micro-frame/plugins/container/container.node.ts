import createNode from '@micro-frame/core/createNode';
import { NodeTypes } from '@micro-frame/node/types';
import { ContainerNode } from "./types";
import path from "path";

const container: NodeTypes<ContainerNode> = async ({ name }, parentContext) => {
  const { publicPath, entryByChunkName, assetsByChunkName, externalsEntryByChunkName } = parentContext;

  const {
    default: node,
  } = require(path.join(publicPath, name, entryByChunkName[name]));

  const childContext = {
    ...parentContext,
    containerName: name,
  };

  await parentContext.setAssets([
    ...(assetsByChunkName[name] || []),
    ...(externalsEntryByChunkName[name] || []),
    path.join(name, entryByChunkName[name]) + 'm',
  ]);

  return createNode(node, childContext);
};

container.key = 'container';

export default container;
