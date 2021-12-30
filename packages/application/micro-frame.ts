import { MicroFrameContainerConfig } from "@micro-frame/env-build/types";

const config: MicroFrameContainerConfig = {
  name: 'application',
  // context: import.meta.url,
  externals: [],
  entry: './index.ts',
  provides: {
    translations: '@xxxs-shop/services-translations',
    logger: '@xxxs-shop/services-logger',
    svg: {
      package: '@xxxs-shop/services-svg'
    },
    // apollo: {
    //   package: '@xxxs-shop/services-apollo',
    //   singleton: 'client', // vs cache: 'client'
    // },
  },
  // "services": [
  //   "@xxxs-shop/services-translations",
  //   "@xxxs-shop/services-svg",
  //   "@xxxs-shop/services-logger"
  // ],
  statsFile: "./.dist/private/stats.json",
};

export default config;
