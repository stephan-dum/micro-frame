import { ExternalRecords, NodeTypesCL } from "@micro-frame/env-build/types";

export interface ContainerNode {
  type: 'container';
  parentExternals?: ExternalRecords;
  name: string;
  aboveFold?: boolean;
  base?: string;
}

export type ContainerFactory = NodeTypesCL<ContainerNode>;
