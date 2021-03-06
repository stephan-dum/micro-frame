import { CLIRenderContext, NeededExternals, NodeTypesCL } from "@micro-frame/env-build/types";
import {IRouteProps, RouterNode} from "./types";

import getUnionNode from "@micro-frame/env-build/nodes/getUnionNode";
import createNode from "@micro-frame/env-build/utils/createNode";
import {MicroNode} from "@micro-frame/core/types";

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
