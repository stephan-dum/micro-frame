import { ConfigEnvironment, ConfigOptions } from "../types";
import { AssetRecords, EntryRecords, ExternalModule } from "../../env-cl/types";
import { StatsCompilation } from "webpack";

const path = require("path");
const { StatsWriterPlugin } = require('webpack-stats-plugin');

const getResolve = require("../getResolve");
const getBabelRule = require("../rules/getBabelRule");
const getTypescriptRule = require("../rules/getTypescriptRule");
const getCSSRule = require("../rules/getCSSRule");
const getExtractCSSChunksPlugin = require("../plugins/getExtractCSSChunksPlugin");
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const normalizeExternal = require("@micro-frame/env-cl/utils/normalizeExternal");

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
const getExternals = (externals: ExternalModule[]) => externals.map((external) => normalizeExternal(external).name);

const allowedExtensions = ['.js', '.mjs'];

interface ContainerConfig {
  context: string;
  name: string;
  externals?: ExternalModule[];
  entry: string;
  dist?: DistOption;
  tsConfig?: string;
  containerPackageName: string;
}

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
          const entryFileIndex = assetsByChunkName[entry].findIndex((file) => allowedExtensions.indexOf(path.extname(file)) >= 0);
          const [entryFile] = assetsByChunkName[entry].splice(entryFileIndex, 1);

          return JSON.stringify({
            root: path.join(publicDist, entryFile).replace(/\\/g, '/'),
            assetsByChunkName,
            entry,
          })
        },
      }),
      getExtractCSSChunksPlugin(),
    ]
  };
}

module.exports = getContainerConfig;
