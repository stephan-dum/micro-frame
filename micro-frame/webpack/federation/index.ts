import webpackPromise from "../webpackPromise";
import getExternalsConfig from "./getExternalsConfig";
import aggregateContainers from "./aggregateContainers";
import { ContainerWebpackConfig } from "../../env-cl/types";
import { ConfigEnvironment, ConfigOptions } from "../types";

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
  const aggregationOptions = { stats: await client.toJson('assets'), webpackConfigs, publicPath };
  await aggregateContainers(env, options, aggregationOptions);
}

export default executeFederationBuild;
