import { PnPLocation } from '@micro-frame/core/types';
import createNode from "@micro-frame/core/createNode";
import getRouteMatch from "./getRouteMatch";
import { PnPNode, PnPNodeConstructor } from "@micro-frame/browser/types";
import { IRouteProps, RouterNode } from "./types";

const PnPRouter: PnPNodeConstructor<RouterNode> = async ({ routes }, parentContext, isHydrate) => {
  let activeRoute: IRouteProps = null;
  let chunk: PnPNode = null;

  const navigate = async (location: PnPLocation, shouldHydrate = false) => {
    const { route, remaining, params } = getRouteMatch(routes, location.pathname);

    if(activeRoute !== route) {
      chunk?.unload();
      activeRoute = route;

      if (!route) {
        // TODO: error handling?!
        return Promise.resolve();
      }

      const context = {
        ...parentContext,
        params,
        location: {
          ...location,
          pathname: remaining,
        },
      };

      const node = route.node || { type: 'container', name: route.container };
      // (await externalImport(route.container[0])).default;
      chunk = await createNode(node, context, shouldHydrate);
    } else if(chunk) {
      return chunk.navigate?.({
        ...location,
        pathname: remaining
      });
    }
  };

  await navigate(parentContext.location, isHydrate);

  return {
    navigate,
    unload: () => {
      chunk.unload();
    },
  }
}

PnPRouter.key = 'router';

export default PnPRouter;
