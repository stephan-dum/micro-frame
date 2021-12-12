import { Service, ServiceFactory } from "../types";
import { ConfigService } from "@xxxs-shop/services-config/types";

export interface APIService extends Service {
  fetch: (url: string, options?: RequestInit) => Promise<Response>;
}

export interface FactoryOptions {
  host: string;
}
export interface APIServiceRequire {
  config: ConfigService
}

export type APIServiceFactory = ServiceFactory<APIServiceRequire>;

