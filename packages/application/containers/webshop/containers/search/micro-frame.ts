import { MicroFrameContainerConfig } from "@micro-frame/env-build/types";

const config: MicroFrameContainerConfig = {
  name: 'search',
  entry: './index.ts',
  externals: [
    {
      "type": "umd",
      "name": "react",
      "varName": "React",
    }
  ],
  injects: [
    {
      property: 'translations',
      as: 'translations',
      mock: '@xxxs-shop/services-translations'
    },
    ['svg', '@xxxs-shop/services-svg'],
    ['logger', '@xxxs-shop/services-logger', 'logger'],
  ],
};

export default config;
