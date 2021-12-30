import { ExternalsByChunkName, IRenderContext, MicroNode } from "@micro-frame/core/types";
import { EntryByChunkName } from "../webpack/configs/getContainerConfig";

interface RecursiveRecord<T> {
  [index: string]: T;
}
// TODO: fix recursion
export type Json = string | boolean | number | null | Array<Json> | RecursiveRecord<Json>;

export interface PackageJSON extends Record<string, any> {
  nme: string;
}
// export interface ExternalVersion {
//   resolve: string;
//   container: string;
// }
type ExternalImports = string | string[];
// type ExternalExports = string | string[];
type Environments = 'node' | 'browser';

interface RawExternalExportsObject {
  pick?: ExternalImports;
  path?: string;
}
export interface RawExternalExports extends RawExternalExportsObject {
  node?: RawPackageExports;
  default?: RawPackageExports;
}


type RawImportPaths = string | string[];
interface RawImportEnvironments {
  node?: RawImportPaths;
  browser?: RawImportPaths;
  default?: RawImportPaths
}
interface RawImportModes {
  production?: RawImportEnvironments;
  development?: RawImportEnvironments
}
type RawImports = RawImportModes & RawImportEnvironments;

interface NewRawExternalObject {
  type: string;
  packageName: string;
  imports: RawImports;
}
// const myExternals: NewRawExternalObject[] = [{
//   type: 'module',
//   packageName: '@mf/env-browser',
//   imports: {
//     default: '',
//     browser: '',
//     node: '',
//   },
// }];


export type RawPackageExports = string | RawExternalExports;
export interface ExternalObject {
  noParse?: boolean;
  type: string;
  name: string;
  exports?: RawPackageExports;
  paths?: string[];
}
interface RawExternalObjectUMD extends ExternalObject {
  type: 'umd';
  varName?: string; // default to name
}
export interface RawExternalObjectModule extends ExternalObject {
  type: 'module';
}

export type RawExternalModule = string | [string, RawPackageExports[]] | RawExternalObjectModule | RawExternalObjectUMD;

interface NormalizedModule extends ExternalObject {
  merged: ExternalObject[];
  container: string;
  chunkName: string;
  base: string;
  resolve: string;
  version: string;
  exports: NormalizedExports;
}
export interface NormalizedExportLeaf {
  pick?: string[];
  path: string;
}
export interface NormalizedExports {
  default?: NormalizedExportLeaf;
  node?: NormalizedExportLeaf;
}
interface NormalizedUMDModule extends NormalizedModule {
  type: 'umd';
  varName: string;
}
interface NormalizedExternalModule extends NormalizedModule {
  type: 'module';
}

// export type NormalizedExternal = RawExternalObjectModule | RawExternalObjectUMD;
export type NormalizedExternal = NormalizedExternalModule | NormalizedUMDModule;


//
// interface ContainerConfigEntriesNode {
//   node: string;
// }
// interface ContainerConfigEntriesBrowser {
//   browser: string;
// }
//
// type ContainerConfigEntriesEnv = ContainerConfigEntriesNode | ContainerConfigEntriesBrowser | string;
//
// interface ContainerConfigEntriesMode {
//   development?: ContainerConfigEntriesNode;
//   production?: ContainerConfigEntriesBrowser
// }
//
// type ContainerConfigEntries = ContainerConfigEntriesMode | ContainerConfigEntriesEnv;

export interface MicroFrameContainerConfig {
  name: string;
  // context: string;
  dist?:string | { public?: string, private?: string; };
  tsConfig?: string;
  provides?: RawProvide;
  injects?: RawInject[];
  entry?: string;
  externals?: RawExternalModule[];
  services?: string[];
  statsFile?: string;
}

export type NeededExternals = Record<string, NormalizedExternal>;

export type VersionSet = Map<
  string, // version
  NormalizedExternal
>;

export type ExternalRecords = Record<
  string, // name of external
  VersionSet
>;

export interface CLINode {
  type: string;
  externals: ExternalRecords;
  parentExternals: ExternalRecords;
}

export interface ProvideObject {
  options?: any;
  cache?: 'client' | boolean;
  package: string;
  mode?: 'production' | 'development';
}

export interface InjectObject {
  property: string;
  as?: string;
  mock?: string; // similar to a fallback but just for dev / cypress
}
type InjectArray = [
  string, //property
  string, // mock
  string? // as
];

export interface NormalizedInjectObject {
  property: string;
  as?: string | undefined;
  mock?: string | undefined;
}

export type NormalizedInject = NormalizedInjectObject[];
export type RawInject = string | InjectArray |InjectObject;

export type RawProvide = Record<string, string | ProvideObject>;

export type NormalizedProvide = Record<string, ProvideObject>;

// export interface ProviderNode {
//   type: 'provider';
//   provide: RawProvide;
//   children: MicroNode[];
//   externals?: RawExternalModule[];
// }

// export type ProviderFactory = NodeTypesCL<ProviderNode>;



export interface CLINodeLeaf extends CLINode {
  type: 'leaf';
}

export interface CLINodeChunk extends CLINode {
  type: 'chunk';
  chunkName: string;
  node: CLINodeResult;
}
export interface CLINodeContainer extends CLINode {
  type: 'container';
  container: string;
  node: CLINodeResult;
  dist: string;
  externalsByPlugins: Record<string, Record<string, ExternalRecords>>;
}

export interface CLINodeIntersection extends CLINode {
  type: 'intersect',
  chunks: CLINodeResult[];
}
export interface CLINodeUnion extends CLINode {
  type: 'union';
  chunks: CLINodeResult[];
}

export type CLINodeResult = CLINodeLeaf | CLINodeChunk | CLINodeIntersection | CLINodeUnion | CLINodeContainer;

export interface ContainerWebpackConfig {
  base: string;
  dist: string;
  container: string;
  entry: string;
  // assets: string[];
  resolved: string;
  injects: NormalizedInject;
  provides: NormalizedProvide;
  externalsEntryByChunkName: Record<string, string[]>;
  parentExternalsEntryByChunkName: Record<string, string[]>;
  externals: ExternalRecords;
  // rawExternals: RawExternalModule[];
  neededExternals: NeededExternals;
  parentExternals: ExternalRecords;
  assetsByChunkName: AssetRecords;
  entryByChunkName: EntryByChunkName;
  externalsByChunkName: ExternalsByChunkName;
  externalsByPlugins: Record<string, Record<string, ExternalRecords>>
}
export type InternalFS = Record<string, string>;
export type AssetRecords = Record<string, string[]>;
// export type EntryRecords = Record<string, string>;
export interface RawStatsFile {
  assetsByChunkName: AssetRecords;
  entrypoints: Record<string, string>;
}
export interface StatsFile {
  entryByChunkName: EntryByChunkName;
  assetsByChunkName: AssetRecords;
  entry: string;
  publicPath: string;
  // root: string;
}
export interface BuildContext {
  publicPath: string;
  container: string;
  chunkName: string;
  allParentExternals: ExternalRecords;
  resolveOptions: ResolveOptions;
  assetsByChunkName: AssetRecords;
  externalsByChunkName: Record<string, string[]>;
  entryByChunkName: EntryByChunkName;
  webpackConfigs: ContainerWebpackConfig[];
  internalFS: InternalFS;
  resolveByContainer: Record<string, ResolveOptions>;
}
// export interface CLINodeResult {
//   chunkName?: string;
//   chunks?: CLINodeResult[];
//   container?: string;
//   type?: string;
//   externals: ExternalRecords;
//   parentExternals?: Record<string, ExternalVersion>;
//   // resolved?: string;
//   // assetsByChunkName?: Record<string, string[]>;
// }

export type PromisedCLINodeResult = Promise<CLINodeResult> | CLINodeResult;
export interface ExternalsOptions {
  parentExternals: ExternalRecords;
  pluginExternals: ExternalRecords;
}
export interface NodeTypesCL<Node = unknown> {
  (node: Node, context: CLIRenderContext, externals: ExternalsOptions): PromisedCLINodeResult;
  externals?: RawExternalModule[];
  dirname?: string;
}

export type MicroNodeFactory = NodeTypesCL<MicroNode>;

export interface ResolveOptions {
  paths: string[];
}

export interface CLIRenderContext extends Omit<IRenderContext, 'entryByChunkName'>, Pick<PackageJSON, "dependencies"> {
  // parentExternals: ExternalRecords;
  // inputFS: Record<string, string | string[]>,
  // publicPath: string;
  externalsEntryByChunkName: Record<string, string[]>;
  provides: NormalizedProvide;
  webpackConfigs: ContainerWebpackConfig[];
  allParentExternals: ExternalRecords;
  cwd: string;
  externalsByPlugins: Record<string, Record<string, ExternalRecords>>;
  resolveOptions: ResolveOptions;
  assetsByChunkName: AssetRecords;
  // externalsByChunkName: Record<string, string[]>;
  entryByChunkName: EntryByChunkName;
  resolveByContainer: Record<string, ResolveOptions>;
}

export interface PublicConfig {
  cwd: string;
  publicPath: string;
  root: string;
  base: string;
}

type globalExternal = Record<string, {}>;
type ExternalResult = Record<string, {}>;

export interface ExternalBuildResult {
  externals: []
}
