import { IRenderContext } from "@micro-frame/core/types";
import { TemplateNode } from "@micro-frame/utils-create-element/types";
import { RawExternalModule, NodeTypesCL } from "@micro-frame/env-build/types";

export type PreactFactoryCL = NodeTypesCL<PreactNode>;

export interface IPrepassComponent<Props = any> {
  (props: Props): any
  asyncData?: (context: IRenderContext) => Promise<any>;
}

export interface PreactNode {
  type: 'react';
  component: IPrepassComponent;
  externals?: RawExternalModule[];
  aboveFold?: boolean;
  props?: unknown;
  Wrapper?: TemplateNode;
}

interface MicroNode extends PreactNode {}
