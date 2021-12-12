import { NodeTypes } from '@micro-frame/node/types';
import createNode from '@micro-frame/core/createNode';
import getRouteMatch from "./getRouteMatch";
import { RouterNode } from "./types";

const router: NodeTypes<RouterNode> = async ({ routes }, context) => {
  const { route, remaining, params } = getRouteMatch(routes, context.url);

  const subContext = {
    ...context,
    params,
    url: remaining,
  };
  const { container, chunk, chunkName, node } = route;

  if (node) {
    return createNode(node, subContext);
  }

  if(chunkName) {
    context.setAssets(context.assetsByChunkName[chunkName]);
    return createNode((await chunk()).default, subContext);
  }

  if (container) {
    return createNode({ type: 'container', name: container }, subContext);
  }

  throw new TypeError('Unknown route type, node, chunk or container must be set!')
};

router.key = 'router';

export default router;
