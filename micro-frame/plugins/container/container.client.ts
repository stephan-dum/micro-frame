import { PnPNode, PnPNodeConstructor } from "@micro-frame/browser/types";
import { ContainerNode } from "./types";
import createNode from "../../env-core/createNode";

const container: PnPNodeConstructor<ContainerNode> = async ({ name }, parentContext, isHyrate) => {
  const { entryByChunkName, assetsByChunkName, externalsByChunkName } = parentContext;
  console.log('# client container parentContext', name, parentContext);

  // externals are only preloaded and must be injected which is part of hydration
  const assets = parentContext.externalsEntryByChunkName[name] || [];


  if (!isHyrate) {
    assets.push(...(assetsByChunkName[name] || []));
  }

  await parentContext.setAssets(assets);

  const {
    default: nodeFactory,
    // ...subContext
  } = await parentContext.load(name + entryByChunkName[name].slice(1));

  const childContext = {
    ...parentContext,
    containerName: name,
  };

  const node = await createNode<PnPNode>(nodeFactory, childContext, isHyrate);
  console.log('## client container node', node);

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

container.key = 'container';

export default container;
