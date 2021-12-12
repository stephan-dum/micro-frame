import { VirtualNode } from "../types";

const getInsertVirtual = (node: Element, refChild: Node | null = null): VirtualNode => {
  const start = document.createComment('');
  const end = document.createComment('');

  node.insertBefore(start, refChild);
  node.insertBefore(end, refChild);

  return {
    start,
    end,
    node,
    split: () => getInsertVirtual(node, end),
    fork: (newChild) => {
      node.insertBefore(newChild, end);
      const root = newChild.querySelector('[data-root]') || newChild
      return getInsertVirtual(root)
    },
  };
};

export default getInsertVirtual;
