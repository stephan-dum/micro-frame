import { PnPNodeConstructor } from "@micro-frame/browser/types";
import { ReactNode } from "./types";
import createWrapperClient from "@micro-frame/utils-create-wrapper";

const DefaultWrapper = { tagName: 'div' };

const PnPReactComponent: PnPNodeConstructor<ReactNode> = ({ Wrapper = DefaultWrapper, component: Component }, parentContext, isHydrate) => {
  const { context, unload } = createWrapperClient(Wrapper, parentContext, isHydrate)

  // @ts-ignore
  const { createElement } = importExternal(context.containerName, 'react');
  // @ts-ignore
  const ReactDOM = importExternal(context.containerName, 'react-dom');

  ReactDOM[isHydrate ? 'hydrate' : 'render'](createElement(Component), context.virtual.node);

  return {
    unload() {
      ReactDOM.unmountComponentAtNode(context.virtual.node);
      unload();
    },
  };
}

PnPReactComponent.key = 'react';

export default PnPReactComponent;
