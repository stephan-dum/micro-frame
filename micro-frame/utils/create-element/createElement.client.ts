import { IRenderContextClient } from "@micro-frame/browser/types";
import { TemplateDescriptor } from "./types";

const createElement = (descriptor: TemplateDescriptor, context: IRenderContextClient): Text | HTMLElement => {
  switch (typeof descriptor) {
    case 'function':
      return createElement(descriptor(context), context);
    case 'string':
      return document.createTextNode(descriptor);
  }

  const { tagName, props, children } = descriptor;
  const element = Object.assign(document.createElement(tagName), props);

  (children || []).forEach((child) => {
    element.appendChild(createElement(child, context));
  });

  return element;
};

export default createElement;
