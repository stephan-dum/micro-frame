import { ExternalRecords, NodeTypesCL } from "@micro-frame/env-cl/types";

export interface ContainerNode {
  type: 'container';
  parentExternals?: ExternalRecords;
  name: string;
  base?: string;
}

export type ContainerFactory = NodeTypesCL<ContainerNode>;
