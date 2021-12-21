import { ChunkFactory } from "./types";
import { MicroNode } from "../../env-core/types";
import getChunkNode from "../../env-cl/nodes/getChunkNode";
import createNode from "../../env-cl/utils/createNode";
import mergeExternals from "../../env-cl/utils/mergeExternals";
import { NeededExternals } from "../../env-cl/types";

const chunk: ChunkFactory = async ({ chunk: chunkFactory, chunkName, externals = [] }, parentContext, config) => {
  const chunk = (await chunkFactory<MicroNode>()).default;

  const childContext = {
    ...parentContext,
    chunkName,
  };

  const chunkNode = getChunkNode({
    node: await createNode(chunk, childContext),
    externals
  }, childContext);

  // TODO: this should happen later in aggregateContainers
  const { assetsByChunkName } = parentContext;
  assetsByChunkName[chunkName] = assetsByChunkName[chunkName].map((asset: string) => require.resolve(`${parentContext.containerName}/.dist/public/${asset}`, parentContext.resolveOptions));


  const allExternals = mergeExternals({}, chunkNode.externals, chunkNode.parentExternals);
  const neededExternals: NeededExternals = {};
  Object.entries(allExternals).forEach(([name, externalMap]) => {
    // neededExternals[name] = Array.from(externalMap.values())[0]
    neededExternals[name] = externalMap.values().next().value;
  });

  parentContext.externalsByChunkName[chunkName] = neededExternals;

  return chunkNode;
};

export default chunk;
