import intersects = require("semver/ranges/intersects");
import {CLINodeResult, CLINodeUnion, CLIRenderContext, RawExternalModule, ExternalRecords} from "../types";
import mergeExternals from "../utils/mergeExternals";

interface GetSplitNodeOptions {
  externals?: RawExternalModule[];
  parentExternals?: ExternalRecords;
  chunks: CLINodeResult[];
}

type GetUnionNode = (options: GetSplitNodeOptions, context: CLIRenderContext) => CLINodeUnion;

const getUnionNode: GetUnionNode = ({ chunks, externals = [], parentExternals = {} }, context) => {
  const externalsMap: ExternalRecords = {};
  const allChildExternals: ExternalRecords = {};

  chunks.forEach((childResult) => {
    mergeExternals(allChildExternals, childResult.externals);
  });

  Object.entries(allChildExternals).forEach(([name, versions]) => {
    versions.forEach((resolve, range) => {
      if (chunks.every((childResult) => {
        return Array.from(childResult.externals[name]?.keys() || []).some((childRange) => {
          return intersects(resolve.version, childRange);
        }) || Array.from(childResult.parentExternals[name]?.values() || []).some((childRange) => {
          return resolve.version === childRange.version;
          // return intersects(resolve.version, childRange);
        });
      })) {
        if (!(name in externalsMap)) {
          externalsMap[name] = new Map();
        }

        externalsMap[name].set(range, resolve);

        // update children
        chunks.forEach((childResult) => {
          const childExternal = childResult.externals[name] || new Map();

          if(childExternal.has(range)) {
            if (!(name in childResult.parentExternals)) {
              childResult.parentExternals[name] = new Map();
            }

            childResult.parentExternals[name].set(range, resolve);
            childExternal.delete(range);

            if (childExternal.size === 0) {
              delete childResult.externals[name];
            }
          }
        });
      }
    });
  });

  return {
    type: 'union',
    externals: externalsMap,
    parentExternals,
    chunks,
  }
};

export default getUnionNode;
