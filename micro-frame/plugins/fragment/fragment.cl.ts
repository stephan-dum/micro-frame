import semverIntersects from 'semver/ranges/intersects';

import { CLINodeResult } from "@micro-frame/env-cl/types";
import createExternals from "@micro-frame/env-cl/utils/createExternals";
import createNode from "@micro-frame/env-cl/utils/createNode";
import {FragmentFactoryCL} from "./types";
import getIntersectNode from "../../env-cl/nodes/getIntersectNode";
import mergeExternals from "../../env-cl/utils/mergeExternals";

const fragment: FragmentFactoryCL = async ({ children, externals: rawExternals = [] }, context, { pluginExternals, parentExternals}) => {
  const externals = createExternals(rawExternals, context.resolveOptions, context.containerName, context.allParentExternals, parentExternals);
  mergeExternals(externals, pluginExternals);
  const chunks = await Promise.all(children.map((child) => createNode(child, context)));
  return getIntersectNode({ externals, parentExternals, chunks }, context, context.containerName);
}

export default fragment;
