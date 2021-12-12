import { createElement } from 'react';
import ReactDOM from 'react-dom';
import { PnPNodeConstructor } from "@micro-frame/browser/types";
import { ReactNode } from "./types";
import createWrapperClient from "@micro-frame/utils-create-wrapper";
import getComponent from "./utils/getComponent";

const DefaultWrapper = { tagName: 'div' };

const PnPReactComponent: PnPNodeConstructor<ReactNode> = ({ Wrapper = DefaultWrapper, component }, parentContext, isHydrate) => {
  const { context, unload } = createWrapperClient(Wrapper, parentContext, isHydrate)

  // const ComponentWrapper = component();
  // const Component = ComponentWrapper.__esModule ? ComponentWrapper.default : ComponentWrapper;
  const Component = getComponent(component);
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
