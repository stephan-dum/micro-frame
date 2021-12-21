import { ConfigEnvironment, ConfigOptions } from "@micro-frame/webpack/types";

import executeFederationBuild from "@micro-frame/webpack/federation";

import createNode from "./utils/createNode";
import { CLINodeContainer, CLIRenderContext, ContainerWebpackConfig, NeededExternals, PublicConfig } from "./types";
import getContainerNode from "./nodes/getContainerNode";
import * as path from "path";

const getInitialContext = (overWrite: Partial<CLIRenderContext>) => ({
  params: {},
  dependencies: {},
  containerName: 'root',
  chunkName: 'root',
  props: {},
  levelId: '',
  externalsByChunkName: {},
  externalsEntryByChunkName: {},
  // entryByChunkName: {},
  externalsByPlugins: {},
  allParentExternals: {},
  provides: {},
  ...overWrite
}) as CLIRenderContext;

interface LocalGlobal {
  importExternal: (container: string, url: string) => Record<string, any>;
}

declare const global: LocalGlobal;

const mockedImport = (container: string, url: string) => ({});
const ROOT = {
  base: __dirname,
  publicPath: '.',
  path: './root.js',
  container: 'root'
};
const federation = async (env: ConfigEnvironment, options: ConfigOptions, { cwd, publicPath, root, base }: PublicConfig) => {
  const resolveOptions = { paths: [cwd] };
  const assetsByChunkName = {};
  const resolveByContainer = {};
  const webpackConfigs: ContainerWebpackConfig[] = [];
  const entryByChunkName = {
    root: ROOT,
    // path: path.join(path.relative(path.join(base, '.dist/public'), __dirname), './root.js'),
  };
  const initialContext = getInitialContext({
    resolveOptions,
    assetsByChunkName,
    cwd,
    webpackConfigs,
    resolveByContainer,
    entryByChunkName,
  });
  // TODO: this should come from root micro-frame.js
  // const microFramePlugins = ['react', 'preact'];
  const node = {
    type: 'container',
    base,
    // TODO: use NewRawExternalObject
    // externals: [{ type: 'module', packageName: '@micro-frame/env-browser' }, ...microFramePlugins],
    name: root,
  };

  global.importExternal = mockedImport;
  const structure = await createNode(node, initialContext) as CLINodeContainer;
  delete global.importExternal;

  const containerNode = getContainerNode({ node: structure, externals: {}, parentExternals: {}, externalsByPlugins: initialContext.externalsByPlugins, dist: structure.dist }, initialContext);

  console.debug(initialContext);
  console.debug(structure);

  // const rootConfig = webpackConfigs.find((config) => config.container === root);
  // Object.assign(rootConfig, {
  //   externalsByChunkName: {
  //     ...rootConfig.externalsByChunkName,
  //     ...initialContext.externalsByChunkName,
  //   },
  //   assetsByChunkName: {
  //     ...rootConfig.assetsByChunkName,
  //     ...initialContext.assetsByChunkName,
  //   },
  //   entryByChunkName: {
  //     ...rootConfig.entryByChunkName,
  //     ...initialContext.entryByChunkName,
  //   }
  // });

  webpackConfigs.push({
    container: 'root',
    entry: 'root',
    injects: [],
    provides: [],
    parentExternalsEntryByChunkName: initialContext.externalsEntryByChunkName,
    // parentExternalsEntryByChunkName: {},
    externals: containerNode.externals,
    parentExternals: {},
    // base: path.dirname(require.resolve('.')),
    // dist: '.',
    base,
    dist: containerNode.dist,
    resolved: require.resolve('./root'),
    neededExternals: {},
    externalsByChunkName: {
      ...initialContext.externalsByChunkName,
      ...initialContext.externalsEntryByChunkName,
    },
    ...initialContext,
  });
  await executeFederationBuild(env, options, { cwd, base, webpackConfigs, publicPath })
  // try {
  //   const externalsOptions = {
  //     cwd,
  //     base,
  //     webpackConfigs,
  //   };
  //
  //   const externalsStats = await webpackPromise(getExternalsConfig(env, options, externalsOptions));
  //   const aggregationOptions = { stats: externalsStats, webpackConfigs, publicPath };
  //   await aggregateContainers(env, options, aggregationOptions);
  // } catch (error) {
  //   console.log(error);
  // }

  // console.log(internalFS);
  // const rootContent = [
  //   getDecoratorTemplate(buildContext),
  //   `export default ${JSON.stringify(node)};`
  // ].join('');
  //
  // await mkdirp('.dist/private');
  // fs.writeFileSync(path.join(cwd, '.dist/private/root.js'), rootContent);

  return ROOT;
  // return rootConfig.entryByChunkName[rootConfig.container];
};

export default federation;

