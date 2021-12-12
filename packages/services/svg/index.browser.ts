import { SVGServiceFactory } from "./types";

const SVGService: SVGServiceFactory = (defaultScope) => {
  return {
    getIconSrc: (id, scope = defaultScope) => {
      return `${scope}#${id}`;
    }
  }
};

export default SVGService;
