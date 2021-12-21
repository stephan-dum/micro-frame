import { ExternalRecords } from "../types";
import semverIntersects from "semver/ranges/intersects";

const mergeExternalsOld = (target: ExternalRecords, source: ExternalRecords) => {
  Object.entries(source).forEach(([name, versions]) => {
    Object.assign(target[name] || (target[name] = new Map()), versions);
  });

  return target;
}
const mergeExternals = (target: ExternalRecords, ...sources: ExternalRecords[]): ExternalRecords => {
  sources.forEach((source) => {
    Object.entries(source).forEach(([name, ranges]) => {
      if (name in target) {
        ranges.forEach((sourceResolve, sourceRange) => {
          const possibleMatch = Array.from(target[name].values()).find(
            (resolve) => semverIntersects(resolve.version, sourceRange)
          )

          if(possibleMatch) {
            possibleMatch.merged.push(sourceResolve);
          } else {
            target[name].set(sourceRange, sourceResolve);
          }
        });
      } else {
        target[name] = new Map(ranges);
      }
    });
  });

  return target;
}

export default mergeExternals;
