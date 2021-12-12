import { ConfigEnvironment, ConfigOptions } from "@micro-frame/webpack/types";

import executeFederationBuild from "@micro-frame/webpack/federation";

import createNode from "./utils/createNode";
import { CLIRenderContext, ContainerWebpackConfig, NeededExternals, PublicConfig } from "./types";
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
  entryByChunkName: {},
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

const federation = async (env: ConfigEnvironment, options: ConfigOptions, { cwd, publicPath, root, base }: PublicConfig) => {
  const resolveOptions = { paths: [cwd] };
  const assetsByChunkName = {};
  const resolveByContainer = {};
  const webpackConfigs: ContainerWebpackConfig[] = [];

  const initialContext = getInitialContext({
    resolveOptions,
    assetsByChunkName,
    cwd,
    webpackConfigs,
    resolveByContainer,
  });

  const node = {
    type: 'container',
    base,
    name: root,
  };

  global.importExternal = mockedImport;
  const structure = await createNode(node, initialContext);
  delete global.importExternal;

  console.log('## entryByChunkName', initialContext.entryByChunkName)

  const containerNode = getContainerNode({ node: structure, externals: {}, parentExternals: {}, externalsByPlugins: initialContext.externalsByPlugins }, initialContext);

  console.debug(structure);
  webpackConfigs.push({
    container: 'root',
    entry: 'root',
    injects: [],
    provides: [],
    parentExternalsEntryByChunkName: initialContext.externalsEntryByChunkName,
    externals: containerNode.externals,
    parentExternals: {},
    base,
    resolved: require.resolve('./root'),
    neededExternals: {},
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
};

export default federation;

