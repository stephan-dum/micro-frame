import { ConfigEnvironment, ConfigOptions } from "@micro-frame/webpack/types";

import executeFederationBuild from "@micro-frame/webpack/federation";

import createNode from "./utils/createNode";
import { CLINodeContainer, CLIRenderContext, ContainerWebpackConfig, NeededExternals, PublicConfig } from "./types";
import getContainerNode from "./nodes/getContainerNode";

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
  aboveFold: false,
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
  const entryByChunkName = { root: ROOT };
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

  // TODO: this is less then ideal and can be remove if there can be no more imports within the files
  global.importExternal = mockedImport;
  const structure = await createNode(node, initialContext) as CLINodeContainer;
  delete global.importExternal;

  const containerNode = getContainerNode({ node: structure, externals: {}, parentExternals: {}, externalsByPlugins: initialContext.externalsByPlugins, dist: structure.dist }, initialContext);

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

  return ROOT;
  // return rootConfig.entryByChunkName[rootConfig.container];
};

export default federation;

