import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import { NodeTypes } from '@micro-frame/node/types';
import { ReactNode } from "./types";
import createWrapper from "@micro-frame/utils-create-wrapper/create-wrapper.server";
// import getComponent from "./utils/getComponent";

const DefaultWrapper = { tagName: 'div' };
const component: NodeTypes<ReactNode> = (options, context) => {
  const { Wrapper = DefaultWrapper, component: Component } = options;
  const [head, tail] = createWrapper(Wrapper, context);
  const { queueResponse } = context;
  // const Component = getComponent(component);

  queueResponse(head);
  context.queueResponse(
    Promise.resolve(Component?.asyncData?.(context)).then((result) => {
      return renderToString(createElement(Component, result || context));
    }, console.error),
  );
  queueResponse(tail);
};

component.key = 'react';

export default component;
