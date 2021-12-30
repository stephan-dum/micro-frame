import {CLINodeContainer, CLINodeResult, CLIRenderContext, ExternalRecords} from "../types";
import {mergeChunkExternals} from "./getChunkNode";

interface GetContainerNodeOptions {
  externals: ExternalRecords;
  parentExternals: ExternalRecords;
  node: CLINodeResult;
  dist?: string;
  externalsByPlugins: Record<string, Record<string, ExternalRecords>>;
}

type GetContainerNode = (options: GetContainerNodeOptions, context: CLIRenderContext) => CLINodeContainer;

const getContainerNode: GetContainerNode = (
  {
    node,
    externals,
    parentExternals,
    externalsByPlugins,
    dist,
  },
  context
) => {
  return {
    type: 'container',
    container: context.containerName,
    externals: mergeChunkExternals(context, externals, node, parentExternals),
    externalsByPlugins,
    parentExternals,
    dist,
    node,
  };
};

export default getContainerNode;
