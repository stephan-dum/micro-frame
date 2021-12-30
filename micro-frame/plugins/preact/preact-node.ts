import renderToString from 'preact-render-to-string';
import { NodeTypes } from '@micro-frame/node/types';
import { PreactNode } from "./types";
import createWrapper from "@micro-frame/utils-create-wrapper/create-wrapper.server";

const DefaultWrapper = { tagName: 'div' };
const preact: NodeTypes<PreactNode> = (options, context) => {
  const { Wrapper = DefaultWrapper, component: Component } = options;
  const [head, tail] = createWrapper(Wrapper, context);
  const { queueResponse } = context;
  // @ts-ignore
  const { h } = importExternal(context.containerName, 'preact');

  queueResponse(head);
  context.queueResponse(
    Promise.resolve(Component?.asyncData?.(context)).then((result) => {
      return renderToString(h(Component, result || context));
    }, console.error),
  );
  queueResponse(tail);
};

preact.key = 'preact';

export default preact;
