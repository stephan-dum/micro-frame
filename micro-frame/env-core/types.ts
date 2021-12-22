import { Service } from "../../packages/services/types";
import { NormalizedExternal, ExternalRecords, NeededExternals } from "../env-cl/types";

export type ExternalsByChunkName = Record<string, Record<string, NormalizedExternal>>;

export interface IRenderContext {
  // queueResponse: QueueResponse;
  // route: IRouteProps;
  // match: match;
  // url: string;
  // loadModule: LoadModule;
  // services: Record<string, Service>;
  aboveFold: boolean;
  load: <T = any>(id: string) => Promise<T | { default: T}>;
  props: Record<string, any>;
  levelId: string;
  containerName: string;
  chunkName: string;
  params: Record<string, string>;
  assetsByChunkName: Record<string, string[]>;
  externalsByChunkName: ExternalsByChunkName;
  entryByChunkName: Record<string, string>;
  externalsEntryByChunkName: Record<string, string[]>;
  // assetsByContainer: Record<string, string[]>;
  // nodes: Record<NodeTypeEnum, (options: NodeUnion, context: IRenderContext) => Promise<PnPNode>>;
}

export interface MicroNode {
  type: string;
  // this will add a window.stop to abort the request and an intersection observer to continue only on the client side
  stop?: boolean;
  [index: string]: any;
}

export type NodeResult = MicroNode | MicroNode[];
type NodeFactory = (context: IRenderContext, isHydrate?: boolean) => NodeResult;

export interface PnPLocation {
  pathname: string;
  hash: string;
  search: string;
}

export type StreamNode = NodeResult | NodeFactory;

export interface ClientPlugin {
  type: string;
  lazy: boolean;
  src: string;
}
