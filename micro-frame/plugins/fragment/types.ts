import { TemplateNode } from "@micro-frame/utils-create-element/types";
import {RawExternalModule, ExternalRecords, NodeTypesCL} from "@micro-frame/env-cl/types";

interface MicroNode extends FragmentNode {}

export interface FragmentNode {
  type: 'fragment';
  externals?: RawExternalModule[];
  Wrapper?: TemplateNode;
  children: MicroNode[];
  props?: unknown;
  meta: TemplateNode[];
}

export type FragmentFactoryCL = NodeTypesCL<FragmentNode>;
