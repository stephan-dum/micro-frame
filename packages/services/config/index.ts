import { ConfigServiceFactory } from "./types";

const ConfigService: ConfigServiceFactory = (options) => {
const { featureFlags, rail, flavour } = options;
  return {
    rail,
    flavour,
    hasFeatureFlag: (rawFeatures, mode = 'every') => {
      const features = (Array.isArray(rawFeatures) ? rawFeatures : [rawFeatures])
      return features[mode]((feature) => featureFlags.indexOf(feature) >= 0);
    },
  };
}

export default ConfigService;
