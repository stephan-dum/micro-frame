import { TemplateDescriptor } from "@micro-frame/utils-create-element/types";
import createElement from "@micro-frame/utils-create-element/createElement.client";
import {IRenderContextClient} from "@micro-frame/browser/types";

const createWrapperClient = (Wrapper: TemplateDescriptor, parentContext: IRenderContextClient, isHydrate: boolean) => {
  if (!Wrapper) {
    return {
      context: parentContext,
      unload: () => {},
    }
  }

  const wrapper = isHydrate ? document.querySelector(`[data-frame="${parentContext.levelId}"]`) : createElement(Wrapper, parentContext);

  if (wrapper instanceof Text) {
    throw new TypeError('TextNode cant be a Wrapper!');
  }

  const context = {
    ...parentContext,
    virtual: parentContext.virtual.fork(wrapper)
  };

  return {
    context,
    unload: () => {
      wrapper.parentNode.removeChild(wrapper);
    }
  }
}

export default createWrapperClient;
