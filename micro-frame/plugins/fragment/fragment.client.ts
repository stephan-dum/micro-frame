import { PnPLocation } from '@micro-frame/core/types';
import createNode from '@micro-frame/core/createNode';
import { PnPNodeConstructor, PnPNode } from "@micro-frame/browser/types";
import createWrapper from "@micro-frame/utils-create-wrapper"
import { FragmentNode } from "./types";

const PnPFragment: PnPNodeConstructor<FragmentNode> = async ({ Wrapper, children}, parentContext, isHydrate = false) => {
  const { context, unload } = createWrapper(Wrapper, parentContext, isHydrate);

  const instances = await Promise.all(children.map((child, index) => {
    return createNode(child, {
      ...context,
      levelId: context.levelId + '-' + index,
      virtual: context.virtual.split(),
    }, isHydrate)
  })) as PnPNode[];

  return {
    navigate: async (location: PnPLocation) => {
      await Promise.all(
        instances.map((child) => child.navigate?.(location))
      )
    },
    unload: () => {
      instances.forEach((child) => child.unload());
      unload();
    }
  }
}

PnPFragment.key = 'fragment';

export default PnPFragment;
