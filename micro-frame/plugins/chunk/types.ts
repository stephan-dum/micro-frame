import { RawExternalModule, NodeTypesCL } from "@micro-frame/env-cl/types";
import { MicroNode } from "../../env-core/types";

export interface ChunkNode {
  type: 'chunk';
  chunkName: string;
  externals?: RawExternalModule[];
  chunk: <T = MicroNode>() => Promise<T | { default: T; }>;
  aboveFold: boolean;
}

export type ChunkFactory = NodeTypesCL<ChunkNode>;
