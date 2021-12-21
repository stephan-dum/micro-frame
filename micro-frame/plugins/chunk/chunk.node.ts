import path from "path";
import createNode from '@micro-frame/core/createNode';
import { NodeTypes } from '@micro-frame/node/types';
import { ChunkNode } from "./types";

const chunk: NodeTypes<ChunkNode> = async ({ chunkName, chunk: chunkFactory }, parentContext) => {
  const { entryByChunkName, assetsByChunkName, externalsEntryByChunkName, setAssets } = parentContext;
  console.log('#chunk context', parentContext, chunkName);
  // const chunk = require(path.join(publicPath, chunkName, entryByChunkName[chunkName]));

  const chunk = await chunkFactory().then((mod) => 'default' in mod ? mod.default : mod);

  await setAssets([
    ...(assetsByChunkName[chunkName] || []),
    path.join(parentContext.containerName, entryByChunkName[chunkName]) + 'm',
    ...(externalsEntryByChunkName[chunkName] || []),
  ]);

  return createNode(chunk, parentContext);
};

chunk.key = 'chunk';

export default chunk;
