import path from "path";
import * as realFileSystem from 'fs';

import { Volume } from 'memfs';
const { Union } = require('unionfs');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

import { ContainerWebpackConfig, ExternalRecords, InternalFS, NeededExternals } from "@micro-frame/env-build/types";

import { ConfigEnvironment, ConfigOptions } from "../types";
import { ExternalsByChunkName } from "../../env-core/types";
import { Configuration } from "webpack";
const getResolve = require("../getResolve");
const getTypescriptRule = require("../rules/getTypescriptRule");

// const externalsToAssets = (externals: ExternalRecords, container: string, allExternals: ExternalRecords) => Object.entries(externals).map(
//   ([name, versions]) => {
//     const externalAssets: string[] = [];
//
//     Object.entries(versions).forEach(([version, resolve]) => {
//         if(!allExternals[name]?.has(version)) {
//           const externalAsset = `/${container}/${name}${version}.js`;
//           // const external = { resolve: externalAsset, container };
//           // TODO: this needs to be fix something is wrong in typing
//           // const external = { paths: ['external ']};
//           // if (name in allExternals) {
//           //   allExternals[name][version] = resolve;
//           // } else {
//           //   allExternals[name] = { [version]: resolve };
//           // }
//
//           externalAssets.push(externalAsset)
//         }
//       }
//     );
//
//     return externalAssets;
//   }
// ).flat();
//
// function prefixAssetPaths(this: string, asset: string) {
//   return path.join('/', this, asset).replace(/\\/g, '/');
// }

const getVersionName = (name: string, version: string = '') => (name+version).replace(/[\^@/=><.*+-]/g, '_');

const getExternalsMap = (externalsByChunkName: ContainerWebpackConfig["externalsByChunkName"]) => {
  const externalsMap: Record<string, Record<string, [string, string]>> = {};
  Object.entries(externalsByChunkName).forEach(([chunkName, externals]) => {
    externalsMap[chunkName] = {};
    Object.entries(externals).forEach(([externalName, external]) => {
      const { exports, paths = ['./'], version } = external;
      const { default: browser } = exports;

      if (browser) {
        paths.forEach((subPath) => {
          externalsMap[chunkName][externalName] = [
            external.container,
            getVersionName(externalName + subPath, version)
          ];
        });
      }
    });
  });
  return JSON.stringify(externalsMap);
}
const getNodeExternalsMap = (externalsByChunkName: ContainerWebpackConfig["externalsByChunkName"], serverExternals: Record<string, Record<string, string>>) => {
  Object.entries(externalsByChunkName).forEach(([chunkName, externals]) => {
    if (!(chunkName in serverExternals)) {
      serverExternals[chunkName] = {};
    }
    const externalsMap = serverExternals[chunkName];
    Object.entries(externals).forEach(([externalName, external]) => {
      // TODO: merge or overwrite externals from different usages!?
      if (!(externalName in externalsMap)) {
        const { paths = ['./'], base, exports } = external;
        const { default: fallback, node = fallback } = exports;

        if (node) {
          paths.forEach((subPath) => {
            const versionedName = path.join(externalName, subPath, node.path).replace(/\\/g, '/').replace(/\/$/, '');
            externalsMap[versionedName] = path.join(base, subPath, node.path).replace(/\\/g, '\\\\');
          });
          // externalsMap[path.join(externalName, node.path).replace(/\\/g, '/')] = path.join(external.base, node.path);
        } else {
          externalsMap[externalName] = external.resolve;
        }
        // externalsMap[externalName] = external.resolve;
      }
    });
  });
}

const createExternalFile = (externals: ExternalRecords, parentExternals: ExternalRecords, externalsByChunkName: ExternalsByChunkName, container: string) => {
  const imports: string[] = [];
  const exportsMap: string[] = [];

  Object.entries(externals).forEach(
    ([name, versions]) => Array.from(versions.values()).forEach(
      ({exports, version, paths = ['./'], base}) => {
        const {default: browser} = exports;

        if (browser) {
          paths.forEach((subPath) => {
            // const realName = path.join(name, subPath).replace(/\\/g, '/').replace(/\/$/, '')
            const versionedName = getVersionName(name + subPath, version);
            // console.log('## imported from', browser, paths, path.join(base, subPath).replace(/\\/g, '\\\\'));
            imports.push(`import * as ${versionedName} from '${path.join(base, subPath).replace(/\\/g, '\\\\')}';`);
            exportsMap.push(`${versionedName}: ${versionedName}.default || ${versionedName}`);
          })
        }
      })
  );

  return [
    ...imports,
    `importExternal.register(`,
      `${getExternalsMap(externalsByChunkName)},`,
      `'${container}',`,
      `{${exportsMap.join(',')}},`,
    `);`,
  ].join('');
};

const upsertNoParseExternals = (noParseExternals: Set<string>, neededExternals: NeededExternals) => {
  Object.values(neededExternals).forEach(({ noParse, resolve }) => {
    if (noParse !== false) {
      noParseExternals.add(resolve);
    }
  });
};

const createEntry = (fileName: string, dir: string, container: string) => ({
  import: path.join(dir, fileName),
  // library: {
  //   type: 'var',
  //   name: [`__externals`, `${getVersionName(container)}`],
  // },
});

export interface ExternalsConfig {
  cwd: string;
  base: string;
  webpackConfigs: ContainerWebpackConfig[];
}

const getBaseConfig = (env:ConfigEnvironment, options: ConfigOptions, config: ExternalsConfig, inputFS: InternalFS) => {
  const { cwd, base} = config;
  const { mode } = options;

  return {
    cache: {
      type: 'filesystem',
    },
    inputFileSystem: new Union()
      .use(realFileSystem)
      .use(Volume.fromJSON(inputFS, path.join(cwd, base))),
    mode,
    module: {
      // TODO: default needs to be changed to false first
      // noParse: noParseExternals,
      rules: [getTypescriptRule(require.resolve("@micro-frame/webpack/tsconfig.browser.json"))],
    },
    ...getResolve(),
  }
}

const getNodeConfig = (env: ConfigEnvironment, options: ConfigOptions, config: ExternalsConfig, serverFS: InternalFS) => {
  const { cwd, base} = config;

  const baseConfig = getBaseConfig(env, options, config, serverFS);

  return {
    ...baseConfig,
    target: 'node',
    name: 'externals_node',
    entry: {
      index: path.join(cwd, base, 'index.js'),
    },
    experiments: {
      outputModule: true,
    },
    externalsType: 'module',
    output: {
      filename: './[name].js',
      path: path.join(cwd, '.dist/private/externals'),
      chunkFormat: 'module',
      module: true,
      environment: {
        module: true,
      },
      library: {
        type: 'module',
      },
    },
  };
};

const getClientConfig = (env: ConfigEnvironment, options: ConfigOptions, config: ExternalsConfig, clientFS: InternalFS, entry: Configuration['entry']) => {
  return {
    ...getBaseConfig(env, options, config, clientFS),
    name: 'externals_web',
    target: 'web',
    entry,
    optimization: {
      splitChunks: {
        chunks: 'all',
      },
    },
    output: {
      filename: './[name]_[contenthash].js',
      publicPath: '/',
      path: path.join(config.cwd, '.dist/public/externals'),
      // library: ['__externals', '[name]'],
    },
    plugins: [
      new BundleAnalyzerPlugin({analyzerMode: env.analyze, analyzerPort: 8889}),
    ],
  };
};

const getExternalsConfig = (env: ConfigEnvironment, options: ConfigOptions, config: ExternalsConfig) => {
  const { webpackConfigs, cwd, base} = config;
  const noParseExternals = new Set<string>();
  const clientFS: InternalFS = {};

  const serverExternals: Record<string, Record<string, string>> = {};
  const entry: Record<string, any> = {};
  const dir = path.join(cwd, base);
  webpackConfigs.forEach((config) => {
    const { container, externals, parentExternals, neededExternals, externalsByChunkName } = config;
    const fileName = `${container}.js`;

    upsertNoParseExternals(noParseExternals, neededExternals);
    entry[container] = createEntry(fileName, dir, container);
    // entry[container] = path.join(dir, fileName);
    clientFS[fileName] = createExternalFile(externals, parentExternals, externalsByChunkName, container);
    getNodeExternalsMap(externalsByChunkName, serverExternals);
  });

  const serverFS: InternalFS = {
    "index.js": `export default ${JSON.stringify(serverExternals)}`
  };

  return [
    getClientConfig(env, options, config, clientFS, entry),
    getNodeConfig(env, options, config, serverFS),
  ] as Configuration;
};

export default getExternalsConfig;
