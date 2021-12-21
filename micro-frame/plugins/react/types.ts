// import { ComponentType } from 'react';
import { IRenderContext } from "@micro-frame/core/types";
import { TemplateNode } from "@micro-frame/utils-create-element/types";
import {RawExternalModule, NodeTypesCL} from "@micro-frame/env-cl/types";

export type ReactFactoryCL = NodeTypesCL<ReactNode>;

// export type IPrepassComponent<Props = unknown, State = unknown> = ComponentType<Props> & {
//   asyncData?: (context: IRenderContext) => State | Promise<State>;
// };
export interface IPrepassComponent<Props = any> {
  (props: Props): any
  asyncData?: (context: IRenderContext) => Promise<any>;
}

type UniversalModule<Default = any> = {
  default: Default;
  __esModule: boolean;
} | Default;

export type ReactNodeComponent = UniversalModule<IPrepassComponent>;
export interface ReactNode {
  type: 'react';
  component: IPrepassComponent;
  externals?: RawExternalModule[];
  aboveFold?: boolean;
  props?: unknown;
  Wrapper?: TemplateNode;
}

interface MicroNode extends ReactNode {}
