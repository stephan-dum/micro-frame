import { NodeTypes } from '@micro-frame/node/types';
import createNode from '@micro-frame/core/createNode';
import getRouteMatch from "./getRouteMatch";
import { RouterNode } from "./types";

const router: NodeTypes<RouterNode> = async ({ routes }, context) => {
  const { route, remaining, params } = getRouteMatch(routes, context.url);

  const { container, chunk, chunkName, node, aboveFold } = route;

  const subContext = {
    ...context,
    params,
    aboveFold: aboveFold || context.aboveFold,
    url: remaining,
  };

  if (node) {
    return createNode(node, subContext);
  }

  if(chunkName) {
    return createNode((await chunk()).default, subContext);
  }

  if (container) {
    return createNode({ type: 'container', name: container }, subContext);
  }

  throw new TypeError('Unknown route type, node, chunk or container must be set!')
};

router.key = 'router';

export default router;
