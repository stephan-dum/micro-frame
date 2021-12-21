import {ClientPlugin, IRenderContext} from "@micro-frame/core/types";
import { PnPLocation, StreamNode } from "@micro-frame/core/types";

declare global {
  type ESImport = (id: string) => Promise<any>;

  const esImport: ESImport;
  interface Window {
    esImport: ESImport;
  }
}

export interface VirtualNode {
  start: Comment;
  end: Comment;
  node: Element;
  split: () => VirtualNode;
  fork: (newChild: Element) => VirtualNode;
}

export interface SubmitEvent extends Omit<Event, 'target'> {
  submitter: HTMLInputElement | HTMLButtonElement;
  target: HTMLFormElement;
}

export interface IRenderContextClient extends IRenderContext {
  virtual: VirtualNode;
  location: PnPLocation;
  setAssets: (asset: string[]) => Promise<void>;
  removeAssets: (assets: string[]) => void;
}

export interface PnPNode {
  navigate?: (location: PnPLocation) => Promise<void>;
  unload: () => void;
}

export interface PnPNodeConstructor<Node = StreamNode> {
  (node: Node, context: IRenderContextClient, isHydrate: boolean): PnPNode | Promise<PnPNode>;
  key: string;
}
// export interface ContextBase {
//   assetsByChunkName: Record<string, string[]>;
//   externalsByChunkName: Record<string, string[]>;
//   entryByChunkName: Record<string, string>;
// }
export type Init = (rootLibraryName: string, rootContainer: string, plugins: ClientPlugin[], htmlElement: HTMLElement) => Promise<void>;
