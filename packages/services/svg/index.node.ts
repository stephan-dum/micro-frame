import { SVGServiceFactory } from "./types";

const SVGService: SVGServiceFactory = (defaultScope) => {
  const symbols = new Set();
  return {
    getIconSrc: (id, scope = defaultScope) => {
      symbols.add(id);
      return `${scope}#${id}`;
    }
  }
};

export default SVGService;
