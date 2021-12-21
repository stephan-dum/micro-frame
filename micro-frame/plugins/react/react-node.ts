
// import { createElement } from 'react';
import { NodeTypes } from '@micro-frame/node/types';
import { ReactNode } from "./types";
import createWrapper from "@micro-frame/utils-create-wrapper/create-wrapper.server";
// import getComponent from "./utils/getComponent";

const DefaultWrapper = { tagName: 'div' };
const component: NodeTypes<ReactNode> = (options, context) => {
  const { Wrapper = DefaultWrapper, component: Component } = options;
  const [head, tail] = createWrapper(Wrapper, context);
  const { queueResponse } = context;
  // @ts-ignore
  const { createElement } = importExternal(context.containerName, 'react');
  // @ts-ignore
  const { renderToString } = importExternal(context.containerName, 'react-dom/server');
  // const Component = getComponent(component);

  queueResponse(head);
  context.queueResponse(
    Promise.resolve(Component?.asyncData?.(context)).then((result) => {
      const e = createElement(Component, result || context);
      return renderToString(e);
    }, console.error),
  );
  queueResponse(tail);
};

component.key = 'react';

export default component;
