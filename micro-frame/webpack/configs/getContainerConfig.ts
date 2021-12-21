import { ConfigEnvironment, ConfigOptions } from "../types";
import { RawExternalModule } from "../../env-cl/types";
import { StatsCompilation } from "webpack";

import path from "path";
import normalizeExternal from '@micro-frame/env-cl/utils/normalizeExternal';

const { StatsWriterPlugin } = require('webpack-stats-plugin');
const getResolve = require("../getResolve");
const getBabelRule = require("../rules/getBabelRule");
const getTypescriptRule = require("../rules/getTypescriptRule");
const getCSSRule = require("../rules/getCSSRule");
const getExtractCSSChunksPlugin = require("../plugins/getExtractCSSChunksPlugin");
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

type DistOption = string | { publicDist: string; privateDist: string};

const normalizeDist = (dist: DistOption) => {
  switch (typeof dist) {
    case "string":
      return { publicDist: dist, privateDist: dist };
    case "object":
      return { publicDist: dist.publicDist || '.dist/public', privateDist: dist.privateDist || '.dist/private' }
    default:
      return { publicDist: '.dist/public', privateDist: '.dist/private' };
  }
}
const getExternals = (externals: RawExternalModule[]) => externals.map((external) => normalizeExternal(external).name);

const allowedExtensions = ['.js', '.mjs'];

interface ContainerConfig {
  context: string;
  name: string;
  externals?: RawExternalModule[];
  entry: string;
  dist?: DistOption;
  tsConfig?: string;
  containerPackageName: string;
}

export type EntryByChunkName = Record<string, { base: string,  publicPath: string; path: string; container: string; }>

const getContainerConfig = async (env: ConfigEnvironment, options: ConfigOptions, config: ContainerConfig) => {
  const { root, analyze } = env;
  const { mode } = options;

  const {
    context,
    name,
    tsConfig = path.join(context, './tsconfig.json'),
    containerPackageName,
    entry,
    externals: rawExternals = [],
    dist: rawDist
  } = config;

  const externals = getExternals(rawExternals);
  const { publicDist, privateDist } = normalizeDist(rawDist);

  const babelOptions = {
    plugins: [
      [
        require.resolve('../babel/replaceExternalImports'),
        {
          container: containerPackageName,
          externals,
        }
      ]
    ]
  };

  return {
    mode,
    name: `${name}_${mode}`,
    context,
    target: 'es2020',
    entry: {
      [name]: path.resolve(context, entry),
    },
    externals,
    ...getResolve(),
    module: {
      rules: [
        getBabelRule(babelOptions),
        tsConfig && getTypescriptRule(tsConfig),
        getCSSRule({ scope: path.relative(root, context) }),
      ].filter(Boolean)
    },
    experiments: {
      outputModule: true,
    },
    externalsType: 'module',
    output: {
      module: true,
      chunkFormat: 'module',
      path: path.join(context, publicDist),
      filename: './[name]_[contenthash].js',
      publicPath: '/',
      environment: {
        module: true,
      },
      library: {
        type: "module",
      }
    },
    plugins: [
      new BundleAnalyzerPlugin({ analyzerMode: analyze, analyzerPort: 8888 }),
      new StatsWriterPlugin({
        // TODO: resolve to privateDist
        filename: "../private/stats.json",
        fields: ["assetsByChunkName", "entrypoints"],
        transform: ({ assetsByChunkName, entrypoints }: StatsCompilation) => {
          const entry = Object.keys(entrypoints)[0];


          // const entryFileIndex = assetsByChunkName[entry].findIndex((file) => allowedExtensions.indexOf(path.extname(file)) >= 0);
          // const [entryFile] = assetsByChunkName[entry].splice(entryFileIndex, 1);

          const entryByChunkName: EntryByChunkName  = {};
          Object.entries(assetsByChunkName).forEach(([chunkName, assets]) => {
            const entryFileIndex = assets.findIndex((file) => allowedExtensions.indexOf(path.extname(file)) >= 0);

            const [entryFile] = assets.splice(entryFileIndex, 1);
            entryByChunkName[chunkName] = {
              base: context,
              publicPath: publicDist,
              path: entryFile,
              container: containerPackageName,
            };
          });

          return JSON.stringify({
            publicPath: publicDist,
            base: context,
            // root: path.join(publicDist, entryByChunkName[entry]).replace(/\\/g, '/'),
            // root: path.join(publicDist, entryFile).replace(/\\/g, '/'),
            assetsByChunkName,
            entryByChunkName,
            entry,
          })
        },
      }),
      getExtractCSSChunksPlugin(),
    ]
  };
}

module.exports = getContainerConfig;
