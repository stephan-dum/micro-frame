import {CLINodeIntersection, CLINodeResult, CLIRenderContext, ExternalRecords} from "../types";
import mergeExternals from "../utils/mergeExternals";

interface GetChunkNodeOptions {
  externals: ExternalRecords;
  parentExternals: ExternalRecords;
  chunks: CLINodeResult[];
}

type GetIntersectNode = (options: GetChunkNodeOptions, context: CLIRenderContext, container: string) => CLINodeIntersection;

const getIntersectNode: GetIntersectNode = ({ externals, chunks, parentExternals }, context, container) => {
  const allChildExternals: ExternalRecords = mergeExternals({}, externals);

  chunks.forEach((chunk) => {
    mergeExternals(allChildExternals, chunk.externals);

    // swap externals
    mergeExternals(chunk.parentExternals, chunk.externals);
    chunk.externals = {};
  });

  return {
    type: 'intersect',
    chunks,
    externals: allChildExternals,
    parentExternals,
  };
};

export default getIntersectNode;
