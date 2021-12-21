import path from 'path';
import { Command } from 'commander';
import globby from 'fast-glob';
import webpack, { Configuration, MultiStats } from "webpack";
import fse from 'fs-extra';
const getDevServerConfig = require('@micro-frame/webpack/dev-server');
import { ConfigEnvironment, ConfigOptions } from "@micro-frame/webpack/types";
import { MicroFrameContainerConfig, PackageJSON } from "@micro-frame/env-cl/types";
import { MicroFrameConfig, MicroFramePlugin } from "./types";
import federation from "@micro-frame/env-cl";
import createServer from "../env-node/create-server";

const getReactPluginConfigs = require('../plugins/react/webpack.config.js');
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
  // inspect = false, TODO: should be added at the outside of the process when calling it with ts loader
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

const run = async () => {
  const globalConfig = await dynamicImport<MicroFrameConfig>(`${projectRoot}/micro-frame`);

  const isRoot = !container || globalConfig.root.indexOf(container) >= 0
  const glob = isRoot ? ROOT_GLOB : getContainerGlob(container);

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
    mode: 'development',
    // '--open'
  };

  const containerConfigPaths = await globby(glob, { cwd: globCWD });

  if(containerConfigPaths.length === 0) {
    throw new ReferenceError(`Could not find any container matching "${container}"`);
  } else if(containerConfigPaths.length > 1) {
    console.warn(`Multiple root entries possible with pattern ${container}, picking first!`)
  }


  const [containerConfigPath] = containerConfigPaths;
  const context = path.join(globCWD, path.dirname(containerConfigPath));
  const containerPackageJSON = await dynamicImport<PackageJSON>(context + '/package.json');
  const { name: containerPackageName } = containerPackageJSON;

  const { externals = [], entry, dist, name } = await dynamicImport<MicroFrameContainerConfig>(globCWD + '/'+ containerConfigPath);
  const containerConfig = await getContainerConfig(env, options, { context, name, externals, entry, dist, containerPackageName });
  const devConfig = getDevServerConfig(env, options);

  const reactPluginConfigs = getReactPluginConfigs(env, options);
  const envBrowserConfig = getEnvBrowserConfig(env, options);
  const configs = [
    devConfig,
    envBrowserConfig,
      ...reactPluginConfigs,
    containerConfig,
  ];

  await webpackPromise(configs);

  const rootEntry = await federation(env, options, { cwd: projectRoot, base: context, root: containerPackageName, publicPath: globalConfig.publicPath });

  // const privatePath = typeof dist === "object" && dist.private || globalConfig.privatePath;
  // const statsFile = require(path.join(context, statsFilePath));
  // const resolved = path.join(statsFile.publicPath, containerPackageName, statsFile.entryByChunkName[statsFile.entry]);
  await createServer({ ...globalConfig, projectRoot, root: context, container: containerPackageName, rootEntry });
};

run();

//
// const args = [
//   'ts-webpack',
//   // 'serve',
//   // `-c ${require.resolve('../webpack/dev-server.js')}`,
//   // `-c ${require.resolve('../env-browser/webpack.config.js')}`,
//   // `-c ${require.resolve('../plugins/react/webpack.config.js')}`,
//
//   // `-c ${require.resolve('../env-node/webpack.config.js')}`,
//   // `-c ${require.resolve('../../packages/containers/Application/webpack.config.js')}`,
//   // `-c ${require.resolve('../../packages/containers/Checkout/webpack.config.js')}`,
//   // `-c ${require.resolve('../../packages/containers/Webshop/webpack.config.js')}`,
//   `-c ${searchConfig}`,
//
//   // `-c ${require.resolve('../../modules/Checkout/webpack.config.js')}`,
//
//   // // TODO: disable in dev-server and always use the same service worker
//   // production && '-c=../webpack/service-worker.js',
//   // analyze && '--env analyze',
//   // `--env root=${process.cwd()}`,
//   // `--env port=${PORT}`,
//   // `--env rendering=${rendering}`,
//   // "--stats-error-details",
//   // `--mode=${production ? 'production' : 'development'}`,
//   // '--mode=production',
//   // '--open'
// ].filter(Boolean).join(' ').split(' ');
//
// try {
//   spawn('yarn', args, { stdio: 'inherit', cwd: __dirname });
// } catch (e) {
//   console.log(e);
// }

