import { StreamNode } from "@micro-frame/core/types";
import {ExternalModule} from "../../env-cl/types";

export type ILoadable<T = unknown> = () => Promise<{ default: T }>;

export interface IRouteProps {
  path?: string;
  chunkName: string;
  chunk?: ILoadable<StreamNode>;
  node?: StreamNode;
  container?: string;
  externals?: ExternalModule[];
}

export interface RouterNode {
  type: 'router';
  externals?: ExternalModule[];
  routes: IRouteProps[];
}

interface MicroNode extends RouterNode {}
