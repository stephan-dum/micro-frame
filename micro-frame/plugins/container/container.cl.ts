import path from "path";
import createNode from "@micro-frame/env-build/utils/createNode";
import getContainerNode from "@micro-frame/env-build/nodes/getContainerNode";
import { ContainerFactory } from "./types";
import {
  CLIRenderContext, InjectObject,
  NeededExternals, NormalizedInject, NormalizedInjectObject,
  NormalizedProvide, RawInject,
  RawProvide,
  StatsFile
} from "@micro-frame/env-build/types";
import createExternals from "@micro-frame/env-build/utils/createExternals";

import mergeExternals from "@micro-frame/env-build/utils/mergeExternals";

const normalizeProvides = (rawProvide: RawProvide): NormalizedProvide => {
  const provide: NormalizedProvide = {};
  Object.entries(rawProvide).forEach(([key, value]) => {
    if (typeof value === 'string') {
      provide[key] = { package: value };
    } else {
      provide[key] = value;
    }
  })
  return provide;
}

const normalizeInject = (rawInjects: RawInject): NormalizedInjectObject => {
  if (typeof rawInjects === "string") {
    return {
      property: rawInjects
    };
  }
  if (Array.isArray(rawInjects)) {
    const [property, mock, as] = rawInjects;

    return {
      property,
      mock,
      as
    }
  }

  return rawInjects;
};

// check if inject is possible otherwise add mock as fallback if provided
const linkInjects = (rawInjects: RawInject[], provides: NormalizedProvide, parentContext: CLIRenderContext): InjectObject[] => {
  const injects: NormalizedInject = [];

  rawInjects.forEach((rawInject) => {
    const inject = normalizeInject(rawInject);
    const { mock, property } = inject;

    if(property in provides) {
      console.warn(`Inject is also declared in provide ${property}, ignoring inject!`);
    } else if (property in parentContext.provides) {
      injects.push(inject);
    } else if (mock) {
      provides[property] = { package: mock };
    } else {
      throw new ReferenceError(`Inject "${property}" could not be full filled and no fallback mock was provided!`);
    }
  });

  return injects;
}

const container: ContainerFactory = async (options, parentContext, config) => {
  const { parentExternals, pluginExternals } = config;
  const { name, base: rawBase } = options;

  const base = rawBase ? rawBase : path.dirname(require.resolve(`${name}/package.json`, parentContext.resolveOptions));

  const containerConfigPath = `${base}/micro-frame`;
  const containerConfig = (await import(containerConfigPath)).default;

  const { externals: rawExternals = [], statsFile = ".dist/private/stats.json", provides : rawProvides = {}, injects: rawInjects = [] } = containerConfig;

  const provides = normalizeProvides(rawProvides);
  const injects = linkInjects(rawInjects, provides, parentContext);

  const { assetsByChunkName, entry, entryByChunkName, publicPath } = require(`${base}/${statsFile}`) as StatsFile;
  const root = entryByChunkName[entry];
  const resolved = `${base}/${publicPath}/${root.path}`;
  const container = require(resolved).default;

  // const externalsMap = {};
  const externalsByPlugins = {};
  const externalsByChunkName = {};
  const externalsEntryByChunkName = {};

  const subContext = {
    ...parentContext,
    provides: {
      ...parentContext.provides,
      ...provides,
    },
    externalsByPlugins,
    resolveOptions: { paths: [base] },
    containerName: name,
    chunkName: entry,
    assetsByChunkName,
    externalsByChunkName,
    entryByChunkName,
    externalsEntryByChunkName,
  };

  const rawProviderExternals = Object.values(provides).map((provider) => provider.package);
  const providerExternals = createExternals(rawProviderExternals, { paths: [base] }, parentContext.containerName, parentContext.allParentExternals, parentExternals);

  const externals = createExternals(rawExternals, subContext.resolveOptions, name, subContext.allParentExternals, parentExternals);
  mergeExternals(externals, pluginExternals, providerExternals);

  const node = await createNode(container, subContext);
  const containerNode = getContainerNode({ node, externals, parentExternals, externalsByPlugins, dist: publicPath }, subContext);
  // TODO: reuse chunk instead
  const allExternals = mergeExternals({}, externals, parentExternals);
  const neededExternals: NeededExternals = {};
  Object.entries(allExternals).forEach(([name, externalMap]) => {
    neededExternals[name] = externalMap.values().next().value;
  });

  parentContext.externalsByChunkName[name] = neededExternals;

  // TODO: check if this is still needed
  parentContext.resolveByContainer[name] = subContext.resolveOptions;
  // TODO: prefix should happen later in aggregateContainers
  // parentContext.entryByChunkName[name] = prefixAssetPaths.call(name, path.basename(root));
  parentContext.entryByChunkName[name] = entryByChunkName[entry];
  // delete entryByChunkName[entry];
  parentContext.assetsByChunkName[name] = assetsByChunkName[entry].map((asset: string) => require.resolve(`${name}/.dist/public/${asset}`, subContext.resolveOptions));
  delete assetsByChunkName[entry];


  parentContext.webpackConfigs.push({
    container: name,
    entry,
    resolved,
    externals,
    neededExternals,
    assetsByChunkName,
    parentExternalsEntryByChunkName: parentContext.externalsEntryByChunkName,
    externalsEntryByChunkName,
    externalsByChunkName,
    externalsByPlugins,
    parentExternals,
    entryByChunkName,
    injects,
    provides,
    base,
    dist: publicPath,
  });

  return containerNode;
}

export default container;
