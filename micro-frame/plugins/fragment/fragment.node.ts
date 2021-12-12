import createNode from '@micro-frame/core/createNode';
import { IRenderContextSSR, NodeTypes } from "@micro-frame/node/types";
import { FragmentNode } from "./types";
import createWrapper from "@micro-frame/utils-create-wrapper/create-wrapper.server";

const fragment: NodeTypes<FragmentNode> = ({ children, Wrapper, meta }, context: IRenderContextSSR) => {
  const [head, tail] = createWrapper(Wrapper, context);

  const { queueResponse } = context;

  queueResponse(head);

  return children
    .reduce((current, child, index) => current.then(() => createNode(child, { ...context, levelId: context.levelId + '-' + index})), Promise.resolve())
    .then(() => {
      if (meta) {
        context.setHead(meta);
      }

      queueResponse(tail);
    });
};

fragment.key = 'fragment';

export default fragment;
