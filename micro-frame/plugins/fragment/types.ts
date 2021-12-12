import { TemplateNode } from "@micro-frame/utils-create-element/types";
import {ExternalModule, ExternalRecords, NodeTypesCL} from "@micro-frame/env-cl/types";

interface MicroNode extends FragmentNode {}

export interface FragmentNode {
  type: 'fragment';
  externals?: ExternalModule[];
  Wrapper?: TemplateNode;
  children: MicroNode[];
  props?: unknown;
  meta: TemplateNode[];
}

export type FragmentFactoryCL = NodeTypesCL<FragmentNode>;
