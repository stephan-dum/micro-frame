export interface MicroFramePlugin {
  node_module: string;
  lazy?: true;
  type: string;
}

export interface MicroFrameConfig {
  plugins: MicroFramePlugin[];
  port: number;
  root: string;
  publicPath: string;
  privatePath: string;
  staticPath: string;
}
