import { IRenderContext } from "@micro-frame/core/types";
import { Readable } from 'stream';
import { TemplateNode } from "@micro-frame/utils-create-element/types";
import { MicroFrameConfig } from "../cli/types";
import { NormalizedProvide } from "../env-cl/types";

export type QueueResponseTypes = string | ReadableStream | Response['body'] | Readable;
export type QueueResponse = (promise: Promise<QueueResponseTypes> | QueueResponseTypes) => void;

export interface IRenderContextSSR extends IRenderContext {
  queueResponse: QueueResponse;
  url: string;
  setAssets: (assets?: string[], aboveFold?: boolean) => void;
  setHead: (node?: TemplateNode[], last?: boolean) => void;
  projectRoot: string;
  publicPath: string;
  provides: NormalizedProvide;
}

export interface NodeTypes<Node = unknown> {
  (node: Node, context: IRenderContextSSR): Promise<void> | void;
  key: string;
}

export interface ServerConfig extends MicroFrameConfig {
  rootEntry: {
    base: string;
    publicPath: string;
    path: string;
    container: string;
  };
  projectRoot: string;
  // resolved: string;
  container: string;
}
