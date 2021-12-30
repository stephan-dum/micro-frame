import { PnPNodeConstructor } from "@micro-frame/browser/types";
import { PreactNode } from "./types";
import createWrapperClient from "@micro-frame/utils-create-wrapper";

const DefaultWrapper = { tagName: 'div' };

const PnPReactComponent: PnPNodeConstructor<PreactNode> = async ({ Wrapper = DefaultWrapper, component: Component }, parentContext, isHydrate) => {
  const { context, unload } = createWrapperClient(Wrapper, parentContext, isHydrate)

  // @ts-ignore
  const { createElement, hydrate, render, unmountComponentAtNode } = importExternal(context.containerName, 'preact');

  const props = await Component?.asyncData?.(context);
  (isHydrate ? hydrate : render)(createElement(Component, props), context.virtual.node);

  return {
    unload() {
      unmountComponentAtNode(context.virtual.node);
      unload();
    },
  };
}

PnPReactComponent.key = 'react';

export default PnPReactComponent;
