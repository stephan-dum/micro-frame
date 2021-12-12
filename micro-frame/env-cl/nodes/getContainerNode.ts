import {CLINodeContainer, CLINodeResult, CLIRenderContext, ExternalModule, ExternalRecords} from "../types";
import {mergeChunkExternals} from "./getChunkNode";

interface GetContainerNodeOptions {
  externals: ExternalRecords;
  parentExternals: ExternalRecords;
  node: CLINodeResult;
  externalsByPlugins: Record<string, Record<string, ExternalRecords>>;
}

type GetContainerNode = (options: GetContainerNodeOptions, context: CLIRenderContext) => CLINodeContainer;

const getContainerNode: GetContainerNode = (
  {
    node,
    externals,
    parentExternals,
    externalsByPlugins
  },
  context
) => {
  return {
    type: 'container',
    container: context.containerName,
    externals: mergeChunkExternals(context, externals, node, parentExternals),
    externalsByPlugins,
    parentExternals,
    node,
  };
};

export default getContainerNode;
