import { IRenderContext } from "@micro-frame/core/types";
import { APIService, FactoryOptions } from "./api/types";

export interface ServiceFactory<Config> {
  (options: FactoryOptions, config: Config): APIService;
  requires?: string[];
}

export interface Service {
  onMount?: (context: IRenderContext) => void;
  onNavigate?: (path: string) => void;
}
