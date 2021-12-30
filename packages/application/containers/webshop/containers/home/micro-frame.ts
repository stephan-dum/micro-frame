import { MicroFrameContainerConfig } from "@micro-frame/env-build/types";

const config: MicroFrameContainerConfig = {
  name: 'home',
  entry: './index.tsx',
  externals: [
    {
      "type": "umd",
      "name": "preact",
      "varName": "Preact",
      paths: ['./', './jsx-runtime', './compat'],
    }
  ]
};

export default config;
