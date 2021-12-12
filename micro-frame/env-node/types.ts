import { IRenderContext } from "@micro-frame/core/types";
import { Readable } from 'stream';
import { TemplateNode } from "@micro-frame/utils-create-element/types";
import { MicroFrameConfig } from "../cli/types";

export type QueueResponseTypes = string | ReadableStream | Response['body'] | Readable;
export type QueueResponse = (promise: Promise<QueueResponseTypes> | QueueResponseTypes) => void;

export interface IRenderContextSSR extends IRenderContext {
  queueResponse: QueueResponse;
  url: string;
  setAssets: (assets?: string[]) => void;
  setHead: (node?: TemplateNode[], last?: boolean) => void;
  projectRoot: string;
  publicPath: string;
}

export interface NodeTypes<Node = unknown> {
  (node: Node, context: IRenderContextSSR): Promise<void> | void;
  key: string;
}

export interface ServerConfig extends MicroFrameConfig {
  projectRoot: string;
  resolved: string;
  container: string;
}