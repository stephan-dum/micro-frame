import {TranslationServiceFactory} from "./types";

const SEPARATOR = '#';

const SVGService: TranslationServiceFactory = (defaultScope) => {
  const translations = new Set();
  return {
    getTranslations: (id, scope = defaultScope) => {
      const scopedId = `${scope}${SEPARATOR}${id}`;
      translations.add(scopedId);
      return scopedId;
    }
  }
};

export default SVGService;
