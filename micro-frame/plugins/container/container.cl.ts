import path from "path";
import createNode from "@micro-frame/env-cl/utils/createNode";
import getContainerNode from "@micro-frame/env-cl/nodes/getContainerNode";
import { ContainerFactory, ContainerNode } from "./types";
import {
  AssetRecords, CLIRenderContext,
  EntryRecords, ExternalsOptions, InjectObject,
  NeededExternals, NormalizedInject, NormalizedInjectObject,
  NormalizedProvide, RawInject,
  RawProvide,
  StatsFile
} from "@micro-frame/env-cl/types";
import externalsToAssets from "@micro-frame/env-cl/utils/externalsToAssets";
import createExternals from "@micro-frame/env-cl/utils/createExternals";

import mergeExternals from "@micro-frame/env-cl/utils/mergeExternals";
import { IRenderContext } from "../../env-core/types";

const patchedRequire = (id: string, options: { paths: string[] }) => require(require.resolve(id, options));

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

function prefixAssetPaths(this: string, asset: string) {
  return path.join(path.dirname(asset), this, path.basename(asset)).replace(/\\/g, '/');
}

// const setEntryByChunkName = (assetsByChunkName: AssetRecords, entryByChunkName: EntryRecords, chunkName: string) => {
//   const entryFileIndex = assetsByChunkName[chunkName].findIndex((file: string) => file === `${chunkName}.js`);
//   const [entryFile] = assetsByChunkName[chunkName].splice(entryFileIndex, 1);
// // TODO: check if this can be moved into stats file plugin
//   delete assetsByChunkName[chunkName];
//   entryByChunkName[chunkName] = prefixAssetPaths.call(chunkName, entryFile);
// };
const loadExternal = (id: string, container: string) => {
  return Object.assign(() => {
  }, {
    required: []
  });
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
const containerCache: Record<string, any> = {};



// const getCachedContainer = async (options: ContainerNode, parentContext: CLIRenderContext, externalsOptions: ExternalsOptions) => {
//   const { parentExternals, pluginExternals } = externalsOptions;
//   const { name, base: rawBase } = options;
//
//   if (name in containerCache) {
//     return containerCache[name];
//   }
//
//   const base = rawBase ? rawBase : path.dirname(require.resolve(`${name}/package.json`, parentContext.resolveOptions));
//
//   const containerConfigPath = `${base}/micro-frame`;
//   const containerConfig = (await import(containerConfigPath)).default;
//
//   const { externals: rawExternals = [], statsFile = ".dist/private/stats.json", provides : rawProvides = {}, injects: rawInjects = [] } = containerConfig;
//
//   const provides = normalizeProvides(rawProvides);
//   const injects = linkInjects(rawInjects, provides, parentContext);
//
//   const { assetsByChunkName, entry, root } = require(`${base}/${statsFile}`) as StatsFile;
//
//   const resolved = `${base}/${root}`;
//   const container = (require(resolved)).default;
//
//   // const externalsMap = {};
//   const externalsByPlugins = {};
//   const externalsByChunkName = {};
//   const entryByChunkName: EntryRecords = {};
//   const externalsEntryByChunkName = {};
//
//   const subContext = {
//     ...parentContext,
//     provides: {
//       ...parentContext.provides,
//       ...provides,
//     },
//     // externalsMap,
//     externalsByPlugins,
//     resolveOptions: { paths: [base] },
//     containerName: name,
//     chunkName: entry,
//     assetsByChunkName,
//     externalsByChunkName,
//     entryByChunkName,
//     externalsEntryByChunkName,
//   };
//
//   const rawProviderExternals = Object.values(provides).map((provider) => provider.package);
//   const providerExternals = createExternals(rawProviderExternals, { paths: [base] }, parentContext.containerName, parentContext.allParentExternals, parentExternals);
//
//   const externals = createExternals(rawExternals, subContext.resolveOptions, name, subContext.allParentExternals, parentExternals);
//   mergeExternals(externals, pluginExternals, providerExternals);
//
//   const node = await createNode(container, subContext);
//   const containerNode = getContainerNode({ node, externals, parentExternals, externalsByPlugins }, subContext);
//
//   return {
//
//   }
// }
const container: ContainerFactory = async (options, parentContext, config) => {
  const { parentExternals, pluginExternals } = config;
  const { name, base: rawBase } = options;

  // const cachedContainer = getCachedContainer(options, parentContext, config);
  // const { resolveOptions } = parentContext;

  const base = rawBase ? rawBase : path.dirname(require.resolve(`${name}/package.json`, parentContext.resolveOptions));

  const containerConfigPath = `${base}/micro-frame`;
  const containerConfig = (await import(containerConfigPath)).default;

  const { externals: rawExternals = [], statsFile = ".dist/private/stats.json", provides : rawProvides = {}, injects: rawInjects = [] } = containerConfig;

  const provides = normalizeProvides(rawProvides);
  const injects = linkInjects(rawInjects, provides, parentContext);

  const { assetsByChunkName, entry, root } = require(`${base}/${statsFile}`) as StatsFile;

  const resolved = `${base}/${root}`;
  const container = require(resolved).default;

  // const externalsMap = {};
  const externalsByPlugins = {};
  const externalsByChunkName = {};
  const entryByChunkName: EntryRecords = {};
  const externalsEntryByChunkName = {};

  const subContext = {
    ...parentContext,
    provides: {
      ...parentContext.provides,
      ...provides,
    },
    // externalsMap,
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
  const containerNode = getContainerNode({ node, externals, parentExternals, externalsByPlugins }, subContext);

  parentContext.resolveByContainer[name] = subContext.resolveOptions;
  const localAssets = assetsByChunkName[entry];
  delete assetsByChunkName[entry];
  parentContext.entryByChunkName[name] = prefixAssetPaths.call(name, path.basename(root));

  // parentContext.assetsByChunkName[name] = localAssets.map(prefixAssetPaths, name);
  parentContext.assetsByChunkName[name] = localAssets.map((asset: string) => require.resolve(`${name}/.dist/public/${asset}`, subContext.resolveOptions));
  // parentContext.externalsByChunkName[name] = externalsToAssets(node.externals, name, subContext.allParentExternals);
  const allExternals = mergeExternals({}, externals, parentExternals);
  const neededExternals: NeededExternals = {};
  Object.entries(allExternals).forEach(([name, externalMap]) => {
    neededExternals[name] = Array.from(externalMap.values())[0]
  });
  parentContext.externalsByChunkName[name] = neededExternals;
  // parentContext.externalsEntryByChunkName[name] = {};
  // parentContext.externalsMap[name] = {
  //   externals,
  //   parentExternals,
  // };

  parentContext.webpackConfigs.push({
    container: name,
    entry,
    // assets,
    resolved,
    externals,
    neededExternals,
    assetsByChunkName,
    parentExternalsEntryByChunkName: parentContext.externalsEntryByChunkName,
    externalsEntryByChunkName,
    // externalsMap,
    externalsByChunkName,
    externalsByPlugins,
    parentExternals,
    entryByChunkName,
    injects,
    provides,
    base
  });

  return containerNode;
}

export default container;
