import { CLIRenderContext, NeededExternals, NodeTypesCL } from "@micro-frame/env-cl/types";
import {IRouteProps, RouterNode} from "./types";

import getUnionNode from "@micro-frame/env-cl/nodes/getUnionNode";
import createNode from "@micro-frame/env-cl/utils/createNode";
import {MicroNode} from "@micro-frame/core/types";
import getChunkNode from "@micro-frame/env-cl/nodes/getChunkNode";
import getSyncNode from "../../env-cl/nodes/getSyncNode";
import * as console from "console";
import externalsToAssets from "../../env-cl/utils/externalsToAssets";
import mergeExternals from "../../env-cl/utils/mergeExternals";

export type RouterFactory = NodeTypesCL<RouterNode>;

async function createRoute(this: CLIRenderContext, route: IRouteProps) {
  const { container, chunk: chunkFactory, chunkName, node, externals = [] } = route;

  if (container) {
    return createNode({
      type: 'container',
      name: container,
    }, this);
  }

  if (chunkFactory) {
    const chunk = (await chunkFactory()).default as MicroNode;

    const childContext = {
      ...this,
      chunkName,
    };

    const chunkNode = getChunkNode({
      node: await createNode(chunk, childContext),
      externals
    }, childContext);
    const allExternals = mergeExternals({}, chunkNode.externals, chunkNode.parentExternals);
    const neededExternals: NeededExternals = {};
    Object.entries(allExternals).forEach(([name, externalMap]) => {
      neededExternals[name] = Array.from(externalMap.values())[0]
    });
    // this.externalsByChunkName[chunkName] = externalsToAssets(chunkNode.externals, this.containerName, this.allParentExternals);
    this.externalsByChunkName[chunkName] = neededExternals;

    return chunkNode;
  }

  if (node) {
    return createNode(node as MicroNode, this);
  }

  throw new TypeError(`Unknown router.route ${JSON.stringify(route)}`);
}

const router: RouterFactory = async ({ routes = [] }, context) => {
  return getUnionNode({
    chunks: await Promise.all(routes.map(createRoute, context))
  }, context);
}
export default router;
