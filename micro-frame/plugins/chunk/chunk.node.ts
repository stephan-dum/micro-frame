import path from "path";
import createNode from '@micro-frame/core/createNode';
import { NodeTypes } from '@micro-frame/node/types';
import { ChunkNode } from "./types";

const chunk: NodeTypes<ChunkNode> = async ({ chunkName, chunk: chunkFactory, aboveFold }, parentContext) => {
  const { entryByChunkName, assetsByChunkName, externalsEntryByChunkName, setAssets } = parentContext;

  const chunk = await chunkFactory().then((mod) => 'default' in mod ? mod.default : mod);

  const childContext = {
    ...parentContext,
    chunkName,
    aboveFold: aboveFold || parentContext.aboveFold
  };

  await setAssets([
    ...(assetsByChunkName[chunkName] || []),
    path.join(parentContext.containerName, entryByChunkName[chunkName]) + 'm',
    ...(externalsEntryByChunkName[chunkName] || []),
  ], childContext.aboveFold);

  return createNode(chunk, childContext);
};

chunk.key = 'chunk';

export default chunk;
