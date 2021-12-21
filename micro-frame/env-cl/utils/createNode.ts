import {CLINodeResult, CLIRenderContext, ExternalRecords, MicroNodeFactory} from "../types";
import {MicroNode} from "@micro-frame/core/types";

import container from "@micro-frame/plugin-container/container.cl";
import fragment from "@micro-frame/plugin-fragment/fragment.cl";
import react from "@micro-frame/plugin-react/react.cl";
import router from "@micro-frame/plugin-router/router.cl";
import chunk from "@micro-frame/plugin-chunk/chunk.cl";
import createExternals from "./createExternals";
import mergeExternals from "./mergeExternals";

const types: Record<string, MicroNodeFactory> = {
  fragment,
  router,
  react,
  container,
  chunk,
}

async function createNode(options: MicroNode, context: CLIRenderContext): Promise<CLINodeResult> {
  const { type } = options;
  const { externalsByPlugins, chunkName } = context;

  const allParentExternals = mergeExternals({}, context.allParentExternals);
  const parentExternals = {};
  const resolveOptions = types[type].dirname ? { paths: [types[type].dirname]} : { paths: [context.cwd] };
  const pluginExternals = createExternals(types[type].externals || [], resolveOptions, context.containerName, allParentExternals, parentExternals);

  const node = await types[type](options, {
    ...context,
    allParentExternals,
  }, { parentExternals, pluginExternals });

  const mergedPluginExternals = mergeExternals({}, parentExternals);
  mergeExternals(mergedPluginExternals, pluginExternals);

  if (chunkName in externalsByPlugins) {
    externalsByPlugins[chunkName][type] = mergedPluginExternals;
  } else {
    externalsByPlugins[chunkName] = {
      [type]: mergedPluginExternals
    };
  }

  return node;
}

export default createNode;
