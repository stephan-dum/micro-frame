import { Service } from "../types";

export type IterationTypes = 'every' | 'some';

export interface ConfigService extends Service {
  rail: string;
  flavour?: string;
  hasFeatureFlag: (featureFlag: string | string[], mode?: IterationTypes) => boolean;
}

export interface FactoryOptions {
  rail: string;
  flavour?: string;
  featureFlags: string[];
}

export type ConfigServiceFactory = (options: FactoryOptions) => ConfigService;
