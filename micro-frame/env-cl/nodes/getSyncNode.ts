import createExternals from "../utils/createExternals";
import {CLINodeLeaf, CLIRenderContext, ExternalModule, ExternalsOptions} from "../types";
import mergeExternals from "../utils/mergeExternals";

interface getModuleNodeOptions {
  externals?: ExternalModule[];
}

type GetSyncNode = (node: getModuleNodeOptions, context: CLIRenderContext, externals: ExternalsOptions) => CLINodeLeaf;

const getSyncNode: GetSyncNode = ({ externals: rawExternals = [] }, context, { parentExternals, pluginExternals}) => {
  const externals = createExternals(rawExternals, context.resolveOptions, context.containerName, context.allParentExternals, parentExternals)
  mergeExternals(externals, pluginExternals);

  return {
    type: 'leaf',
    externals,
    parentExternals,
  };
};

export default getSyncNode;
