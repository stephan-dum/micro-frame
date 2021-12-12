import { Service } from "../types";

export interface SVGService extends Service {
  getIconSrc: (id: string, scope?: string) => string;
}

export type SVGServiceFactory = (defaultScope: string) => SVGService;
