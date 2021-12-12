import { Service } from "../types";

export interface TranslationService extends Service {
  getTranslations: (id: string[], scope?: string) => string;
}

export type TranslationServiceFactory = (defaultScope: string) => TranslationService;
