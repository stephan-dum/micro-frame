// import { createElement } from 'react';
// import ReactDOM from 'react-dom';
import { PnPNodeConstructor } from "@micro-frame/browser/types";
import { ReactNode } from "./types";
import createWrapperClient from "@micro-frame/utils-create-wrapper";
import getComponent from "./utils/getComponent";
import { hydrate } from "react-dom";

const DefaultWrapper = { tagName: 'div' };

const PnPReactComponent: PnPNodeConstructor<ReactNode> = ({ Wrapper = DefaultWrapper, component: Component }, parentContext, isHydrate) => {
  const { context, unload } = createWrapperClient(Wrapper, parentContext, isHydrate)

  // @ts-ignore
  const { createElement } = importExternal(context.containerName, 'react');
  // @ts-ignore
  const ReactDOM = importExternal(context.containerName, 'react-dom');

  console.log('react client', isHydrate);
  // const ComponentWrapper = component();
  // const Component = ComponentWrapper.__esModule ? ComponentWrapper.default : ComponentWrapper;
  // const Component = getComponent(component);
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
