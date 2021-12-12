import plugins from "./plugins";
import { StreamNode } from './types';

const createNode = <Return>(node: StreamNode, context: any, isHydrate = false): Promise<Return> => {
  if (Array.isArray(node)) {
    return plugins.fragment(
      {
        type: 'fragment',
        children: node,
      },
      this,
    );
  }

  if (typeof node === 'function') {
    return Promise.resolve(node(context)).then((realNode) => {
      return createNode(realNode, context, isHydrate);
    });
  }

  if (node.type in plugins) {
    return plugins[node.type](node, context, isHydrate);
  }

  throw new ReferenceError(`Unregistered node type '${node.type}'!\n${JSON.stringify(node)}`);
}

export default createNode;
