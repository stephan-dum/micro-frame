import webpackPromise from "../webpackPromise";
import getExternalsConfig from "./getExternalsConfig";
import aggregateContainers from "./aggregateContainers";
import { ContainerWebpackConfig } from "../../env-cl/types";
import { ConfigEnvironment, ConfigOptions } from "../types";
import path from "path";

interface FederationBuildConfig {
  cwd: string;
  base: string;
  webpackConfigs: ContainerWebpackConfig[];
  publicPath: string;
}

const executeFederationBuild = async (env: ConfigEnvironment, options: ConfigOptions, config: FederationBuildConfig) => {
  const { cwd, base, webpackConfigs, publicPath } = config;
  const externalsOptions = {
    cwd,
    base,
    webpackConfigs,
  };

  const [client] = await webpackPromise(getExternalsConfig(env, options, externalsOptions));
  const stats = await client.toJson('assets');
  const aggregationOptions = { stats, webpackConfigs, publicPath };

  // webpackConfigs.forEach(({ container, parentExternalsEntryByChunkName}) => {
  //   parentExternalsEntryByChunkName[container] = stats.entrypoints[container].assets.map(({ name }) => path.join('externals', name))
  // });

  await aggregateContainers(env, options, aggregationOptions);
}

export default executeFederationBuild;
