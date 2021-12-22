import { StatsCompilation } from 'webpack';
import mkdirp from "mkdirp";
import {
  AssetRecords,
  ContainerWebpackConfig,
  NeededExternals, NormalizedInject, NormalizedProvide,
} from "@micro-frame/env-cl/types";

import path from "path";
import { ConfigEnvironment, ConfigOptions } from "../types";
import { copyFile, readFile, writeFile } from "fs/promises";

// export const getContainerExports = ({ assetsByChunkName, externalsByChunkName, entryByChunkName }: ContainerWebpackConfig) => [
//   `export const assetsByChunkName = ${JSON.stringify(assetsByChunkName)};`,
//   `export const externalsByChunkName = ${JSON.stringify(externalsByChunkName)};`,
//   `export const entryByChunkName = ${JSON.stringify(entryByChunkName)};`,
// ].join('');

const getUMDExternals = (neededExternals: NeededExternals, container: string) => {
  const content: string[] = [];

  Object.values(neededExternals).forEach((external) => {
    const { type, name } = external;

    if(type === 'umd') {
      content.push(`const ${external.varName || name} = importExternal("${container}", "${name}");`);
    }
  });

  return content.join('');
};

// bytes
const EXTERNAL_MIN_SIZE = 40000;
const EXTERNAL_MAX_SIZE = 2500000

const getInlinedExternals = ({ entrypoints, outputPath }: StatsCompilation, container: string) => {
  const externalsGroup = entrypoints[container];

  // TODO: must also walk all parent chunks and delete the asset
  // if(externalsGroup.assetsSize <= EXTERNAL_MIN_SIZE) {
  //   return externalsGroup.assets.map((asset) => {
  //     return readFileSync(path.join(outputPath, asset.name))
  //   }).join('')
  // }

  return '';
};


interface SortableFactory {
  requires: string[];
  config: {
    package: string;
  }
}
const dependencySort = (factoryA: SortableFactory, factoryB: SortableFactory) => {
  const hasB = factoryA.requires.indexOf(factoryB.config.package) >= 0;
  const hasA = factoryB.requires.indexOf(factoryA.config.package) >= 0;

  if(hasA && hasB) {
    throw new ReferenceError(`Circular require between ${factoryA.config.package} and ${factoryB.config.package}`)
  }

  return hasA ? 1 : 0;
};
const createProviders = (provides: NormalizedProvide, container: string, base: string) => {
  const packageToAs: Record<string, string> = {};
  const imports: string[] = [];
  const initializers: string[] = [];

  const dependencies = Object.entries(provides).map(([as, config]) => {
    const { requires = [] } = require(require.resolve(`${config.package}/package.json`, { paths: [base] })) as { requires: string[] };

    packageToAs[config.package] = as;

    return {
      requires,
      as,
      config
    }
  }).sort(dependencySort);

  dependencies.forEach(({ as, config, requires = [] }) => {
    imports.push(
      `const ${as}_factory = importExternal('${container}', '${config.package}');`
    );
    initializers.push(
      `const ${as} = ${as}_factory(${JSON.stringify(config.options || {})}, [${requires.map((required) => packageToAs[required]).join(',')}]);`
    )
  });

  const finalObject = [
    `Object.assign(`,
      `context.provides,`,
      `{${Object.values(packageToAs).join(',')}}`,
    `);`
  ].join('');

  return imports.join('') + initializers.join('') + finalObject;
}
const createInjects = (injects: NormalizedInject) => {
  return injects.map(({ as, property }) => {
    return as && as !== property ? `context[${as}] = context[${property}];` : ''
  }).join('');
}
// const getContext = (provides: NormalizedProvide, injects: NormalizedInject, container: string, base: string) => {
//   return [
//     `const __contextFactory = (context) => {`,
//       createInjects(injects),
//       createProviders(provides, container, base),
//     `};`
//   ].join('');
// }
// const getExternalsMap = (externalsByChunkName: ContainerWebpackConfig["externalsByChunkName"]) => {
//   const externalsMap: Record<string, Record<string, [string, string]>> = {};
//   Object.entries(externalsByChunkName).forEach(([chunkName, externals]) => {
//     externalsMap[chunkName] = {};
//     Object.entries(externals).forEach(([externalName, external]) => {
//       externalsMap[chunkName][externalName] = [external.container, external.version]
//     });
//   });
//   return JSON.stringify(externalsMap);
// }

const chunkTransform = (rawContent: string, config: ContainerWebpackConfig, stats: StatsCompilation, assetsByChunkName: AssetRecords) => {
  const { container, neededExternals } = config;
  return [
    getUMDExternals(neededExternals, container),
    rawContent,
  ].join('');
};

const exportReplacement = 'const __nodeFactory = $1;';
const transform = (rawContent: string, config: ContainerWebpackConfig, stats: StatsCompilation, assetsByChunkName: AssetRecords) => {
  const { neededExternals, container, provides, injects, base, entry, externalsEntryByChunkName, entryByChunkName, parentExternalsEntryByChunkName } = config;

  const parsedEntryByChunkName: Record<string, string> = {};
  Object.entries(entryByChunkName).forEach(([chunkName, chunk]) => {
    parsedEntryByChunkName[chunkName] = chunk.path;
  });

  return [
    getInlinedExternals(stats, container),
    getUMDExternals(neededExternals, container),

    rawContent
      .replace(/export\s*{\s*(\w+)\s+as\s+default\s*};/, exportReplacement)
      .replace(/export\s+default\s+(\w+);/, exportReplacement),

    `export default (context) => {`,
      createInjects(injects),
      createProviders(provides, container, base),

      `Object.assign(context, {`,
        `assetsByChunkName: ${JSON.stringify(assetsByChunkName)},`,
        // `externalsByChunkName: ${getExternalsMap(externalsByChunkName)},`,
        `externalsEntryByChunkName: ${JSON.stringify(externalsEntryByChunkName)},`,
        `entryByChunkName: ${JSON.stringify(parsedEntryByChunkName)},`,
      `});`,

      `return typeof __nodeFactory === 'function' ? __nodeFactory(context) : __nodeFactory;`,
    `};`
  ].join('');
};

interface AggregationConfig {
  publicPath: string;
  webpackConfigs: ContainerWebpackConfig[];
  stats: StatsCompilation;
}
const copyContainerAssets = ({ container, assetsByChunkName, dist, base }: ContainerWebpackConfig, toBase: string) => {
  const normalizedAssetsByChunkName: AssetRecords = {};

  return Promise.all(
    Object.entries(assetsByChunkName).map(([chunkName, assets]) =>
      Promise.all(assets.map((asset) => {
        const filePath = path.join(container, path.basename(asset));
        return copyFile(asset, path.join(toBase, filePath)).then(() => filePath);
      }))
        .then((normalizedAssets) => {
          normalizedAssetsByChunkName[chunkName] = normalizedAssets;
        })
    ).flat()
  ).then(() => normalizedAssetsByChunkName);
};

type AggregateContainers = (env: ConfigEnvironment, options: ConfigOptions, config: AggregationConfig) => Promise<void>;
const prepareTransform = (normalizedAssetsByChunkName: AssetRecords, config: ContainerWebpackConfig, toBase: string, stats: StatsCompilation) => {
  const { container, entryByChunkName, parentExternalsEntryByChunkName, entry } = config

  return Promise.all(Object.entries(entryByChunkName).map(([chunkName, chunk]) => {
    if (chunk.container !== container) {
      return;
    }

    const isContainer = chunkName === entry;
    const transformer = isContainer ? transform : chunkTransform;

    return readFile(path.join(chunk.base, chunk.publicPath, chunk.path), 'utf-8')
      .then((rawContent) => {
        return writeFile(
          path.join(toBase, chunk.container, chunk.path),
          transformer(rawContent, config, stats, normalizedAssetsByChunkName),
        );
      });
  }));

}

const toVoid = () => {};
const aggregateContainers: AggregateContainers = (
  { root },
  options,
  { webpackConfigs, stats, publicPath }
) => Promise.all(webpackConfigs.map((config) => {
  const { container, parentExternalsEntryByChunkName } = config;
  const toBase = path.join(root, publicPath);

  // this must be executed sync to guarantee order
  parentExternalsEntryByChunkName[container] = stats.entrypoints[container].assets.map(({ name }) => path.join('externals', name))

  return mkdirp(path.join(toBase, container))
    .then(() => copyContainerAssets(config, toBase).then(
      (assetsByChunkName) => prepareTransform(assetsByChunkName, config, toBase, stats)
    ));
})).then(toVoid);

export default aggregateContainers;
