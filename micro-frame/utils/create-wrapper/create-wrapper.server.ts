import {TemplateNode} from "../create-element/types";
import {IRenderContextSSR} from "@micro-frame/node/types";
import createElement from "@micro-frame/utils-create-element";

const rootReg = /data-root(?:="[^"]+")?[^>]*>/;
const createWrapper = (Component: TemplateNode, context: IRenderContextSSR) => {
  if (!Component) {
    return ['', ''];
  }

  const rawHTML = createElement(Component, context);
  const match = rawHTML.match(rootReg);
  const middle = match ? match.index + match[0].length : rawHTML.indexOf('>');

  return [
    rawHTML.slice(0, middle) + ` data-frame="${context.levelId}">`,
    rawHTML.slice(middle + 1)
  ];
};

export default createWrapper;
