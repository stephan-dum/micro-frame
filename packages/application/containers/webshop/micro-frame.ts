import { MicroFrameContainerConfig } from "@micro-frame/env-cl/types";

const config: MicroFrameContainerConfig = {
  name: 'webshop',
  entry: 'index.ts',
  "externals": [
    "@xxxs-shop/react-hooks-icon",
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
