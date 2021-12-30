import path from 'path';
import { Command } from 'commander';
import globby from 'fast-glob';
import webpack, { Configuration, MultiStats } from "webpack";
import fse from 'fs-extra';
// const getDevServerConfig = require('@micro-frame/webpack/dev-server');
import { ConfigEnvironment, ConfigOptions } from "@micro-frame/webpack/types";
import { MicroFrameContainerConfig, PackageJSON } from "@micro-frame/env-build/types";
import { MicroFrameConfig } from "./types";
import federation from "@micro-frame/env-build";
import createServer from "../env-node/create-server";

const getReactPluginConfigs = require('../plugins/react/webpack.config.js');
const getPreactPluginConfigs = require('../plugins/preact/webpack.config.js');
const getEnvBrowserConfig = require('../env-browser/webpack.config.js');
const getContainerConfig = require('@micro-frame/webpack/configs/getContainerConfig');

const PORT = 3100;

const program = new Command()
  // .option('--render <mode>', 'csr or ssr')
  .option('-c, --container <container>', 'list of containers to watch for')
  .option('-i, --inspect', 'should attach a debugger') // this can stay because it describes the feature of node.js it self that is also available
  .option('-p, --port', '')
  .option('-a, --analyze <mode>', 'start bundle analyzer in a mode server, static, json, disabled')
  .option('--root', 'project root');

program.parse(process.argv);

interface DevelopmentOptionValues {
  analyze?: ConfigEnvironment["analyze"];
  container?: string;
  port?: number;
  root: string;
}

const {
  analyze = 'disabled',
  container = '',
  port = PORT,
  root: projectRoot = process.cwd(),
} = program.opts<DevelopmentOptionValues>();

const dynamicImport = <Type>(url: string): Promise<Type> => import(url).then((mod) => mod.default || mod);

const webpackPromise = (configs: Configuration[]): Promise<MultiStats> => new Promise((resolve, reject) => {
  webpack(configs, (error, stats) => {
    if (error) {
      return reject(error);
    }
    resolve(stats);
  });
});

const MICRO_CONFIG_GLOB = 'micro-frame.{ts,js}';
const ROOT_GLOB = `./${MICRO_CONFIG_GLOB}`;
const getContainerGlob = (container: string) => `**/${container}/${MICRO_CONFIG_GLOB}`;
const SUB_CONTAINER_GlOB = `**/${MICRO_CONFIG_GLOB}`;

const prepareContainerConfig = async (env: ConfigEnvironment, options: ConfigOptions, base: string, subPath: string) => {
  const context = path.join(base, path.dirname(subPath));
  const containerPackageJSON = await dynamicImport<PackageJSON>(context + '/package.json');
  const { name: containerPackageName } = containerPackageJSON;

  const { externals = [], entry, dist, name } = await dynamicImport<MicroFrameContainerConfig>(base + '/'+ subPath);

  return getContainerConfig(env, options, { context, name, externals, entry, dist, containerPackageName });
};

const run = async () => {
  const globalConfig = await dynamicImport<MicroFrameConfig>(`${projectRoot}/micro-frame`);

  if ("staticPath" in globalConfig) {
    await fse.copy(globalConfig.staticPath, globalConfig.publicPath);
  }

  const globCWD = path.dirname(require.resolve(`${globalConfig.root}/package.json`, { paths: [projectRoot]}));

  const env: ConfigEnvironment = {
    port,
    // render,
    root: projectRoot,
    analyze,
  };
  const options: ConfigOptions = {
    // TODO: must be controlled in the individual callbacks
    // stats: "detailed",
    // mode: 'production',
    mode: 'development',
    // '--open'
  };

  const isRoot = !container || globalConfig.root.indexOf(container) >= 0
  const glob = isRoot ? ROOT_GLOB : getContainerGlob(container);
  const containerConfigPaths = await globby(glob, { cwd: globCWD });

  if(containerConfigPaths.length === 0) {
    throw new ReferenceError(`Could not find any container matching "${container}"`);
  } else if(containerConfigPaths.length > 1) {
    console.warn(`Multiple root entries possible with pattern ${container}, picking first!`)
  }

  const [containerConfigPath] = containerConfigPaths;
  const subBase = path.join(globCWD, path.dirname(containerConfigPath), 'containers');
  const subContainerPaths = await globby(SUB_CONTAINER_GlOB, { cwd: subBase})

  const subContainers = await Promise.all(subContainerPaths.map(
    (subPath) => prepareContainerConfig(env, options, subBase, subPath)
  ));

  const containerConfig = await prepareContainerConfig(env, options, globCWD, containerConfigPath);
  const { name: containerPackageName, context } = containerConfig;

  const reactPluginConfigs = getReactPluginConfigs(env, options);
  const preactPluginConfigs = getPreactPluginConfigs(env, options);
  const envBrowserConfig = getEnvBrowserConfig(env, options);
  const configs = [
    // getDevServerConfig(env, options),
    envBrowserConfig,
    ...reactPluginConfigs,
    ...preactPluginConfigs,
    containerConfig,
    ...subContainers,
  ];

  await webpackPromise(configs);

  const rootEntry = await federation(env, options, { cwd: projectRoot, base: context, root: containerPackageName, publicPath: globalConfig.publicPath });

  await createServer({ ...globalConfig, projectRoot, root: context, container: containerPackageName, rootEntry });
};

run();
