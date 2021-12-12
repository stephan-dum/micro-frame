import { WebpackOptionsNormalized } from 'webpack';
type Primitive = number | string | boolean;

export interface ConfigEnvironment extends Record<string, Primitive> {
  port: number;
  root: string;
  analyze: 'server'| 'static' | 'json' | 'disabled';
}

export interface ConfigOptions extends	Partial<WebpackOptionsNormalized> {}
