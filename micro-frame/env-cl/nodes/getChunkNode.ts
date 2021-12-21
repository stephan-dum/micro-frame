import {
  CLINodeChunk,
  CLINodeResult,
  CLIRenderContext,
  RawExternalModule,
  ExternalObject,
  ExternalRecords,
  NormalizedExternal
} from "../types";
import createExternals from "../utils/createExternals";
import mergeExternals from "../utils/mergeExternals";

interface GetChunkNodeOptions {
  node: CLINodeResult;
  externals?: RawExternalModule[];
}

type GetChunkNode = (options: GetChunkNodeOptions, context: CLIRenderContext) => CLINodeChunk;

const updateAllMergedExternals = (externals: ExternalRecords, container: string) => {
  const setAllContainer = (mergedResolve: NormalizedExternal) => {
    mergedResolve.container = container;
    mergedResolve.merged?.forEach(setAllContainer)
  };

  Object.values(externals).forEach((range) => {
    range.forEach((resolve) => {
      setAllContainer(resolve);
    })
  })
};

export const mergeChunkExternals = (context: CLIRenderContext, chunkExternals: ExternalRecords, node: CLINodeResult, parentExternals: ExternalRecords) => {
  mergeExternals(chunkExternals, node.externals);

  // update the child
  mergeExternals(node.parentExternals, node.externals);
  Object.keys(node.externals).forEach((key) => {
    delete node.externals[key];
  })


  updateAllMergedExternals(chunkExternals, context.containerName);

  return chunkExternals;
};

const getChunkNode: GetChunkNode = ({ node, externals: rawExternals = [] }, context) => {
  const parentExternals = {};
  const externals = createExternals(rawExternals, context.resolveOptions, context.containerName, context.allParentExternals, parentExternals);

  return {
    type: 'chunk',
    chunkName: context.chunkName,
    externals: mergeChunkExternals(context, externals, node, parentExternals),
    parentExternals,
    node,
  };
}

export default getChunkNode;
