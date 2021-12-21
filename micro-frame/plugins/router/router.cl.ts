import { CLIRenderContext, NeededExternals, NodeTypesCL } from "@micro-frame/env-cl/types";
import {IRouteProps, RouterNode} from "./types";

import getUnionNode from "@micro-frame/env-cl/nodes/getUnionNode";
import createNode from "@micro-frame/env-cl/utils/createNode";
import {MicroNode} from "@micro-frame/core/types";
// import getChunkNode from "@micro-frame/env-cl/nodes/getChunkNode";
// import getSyncNode from "../../env-cl/nodes/getSyncNode";
// import * as console from "console";
// import externalsToAssets from "../../env-cl/utils/externalsToAssets";
// import mergeExternals from "../../env-cl/utils/mergeExternals";

export type RouterFactory = NodeTypesCL<RouterNode>;

async function createRoute(this: CLIRenderContext, route: IRouteProps) {
  const { container, chunk, node } = route;

  if (container) {
    return createNode({
      type: 'container',
      name: container,
    }, this);
  }

  if (chunk) {
    return createNode({
      type: 'chunk',
      chunkName: route.chunkName,
      chunk,
    }, this);
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
