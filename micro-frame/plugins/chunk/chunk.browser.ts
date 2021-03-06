import { PnPNodeConstructor, PnPNode } from "@micro-frame/browser/types";
import { ChunkNode } from "./types";
import createNode from "../../env-core/createNode";

const chunk: PnPNodeConstructor<ChunkNode> = async ({ chunkName, chunk: chunkFactory }, parentContext, isHyrate) => {
  const { assetsByChunkName, externalsEntryByChunkName } = parentContext;

  const assets = externalsEntryByChunkName[chunkName] || [];

  if (!isHyrate) {
    assets.push(...(assetsByChunkName[chunkName] || []));
  }

  await parentContext.setAssets(assets);

  const chunk = await chunkFactory().then((mod) => 'default' in mod ? mod.default : mod);

  const node = await createNode<PnPNode>(chunk, parentContext, isHyrate);

  return {
    navigate: (...args) => {
      return node.navigate?.(...args);
    },
    unload: () => {
      parentContext.removeAssets(assets);
      node.unload();
    }
  }
}

chunk.key = 'chunk';

export default chunk;
