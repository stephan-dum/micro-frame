import { StreamNode } from "@micro-frame/core/types";
import {RawExternalModule} from "../../env-cl/types";

export type ILoadable<T = unknown> = () => Promise<{ default: T }>;

export interface IRouteProps {
  path?: string;
  chunkName: string;
  chunk?: ILoadable<StreamNode>;
  node?: StreamNode;
  container?: string;
  externals?: RawExternalModule[];
}

export interface RouterNode {
  type: 'router';
  externals?: RawExternalModule[];
  routes: IRouteProps[];
}

interface MicroNode extends RouterNode {}
