import {
  ExternalModule,
  ExternalNormalizedObjects,
  ExternalRecords,
  ResolveOptions
} from "../types";

import {intersects} from "semver";

// @ts-ignore
import normalizeExternal from './normalizeExternal';
import * as path from "path";


const createExternals = (
  rawExternals: ExternalModule[],
  resolveOptions: ResolveOptions,
  container: string,
  allParentExternals: ExternalRecords,
  parentExternals: ExternalRecords,
) => {
  const externals: ExternalRecords = {};
  const packageJSONPath = require.resolve(`./package.json`, resolveOptions);
  const packageJSON = require(packageJSONPath);

  rawExternals.forEach((rawExternal) => {
    const external = normalizeExternal(rawExternal);
    const externalName = external.name;

    const externalPath = path.dirname(require.resolve(externalName, resolveOptions));
    const externalPackageJSONPath = path.join(externalPath, 'package.json');
    const dependencyPackageJSON = require(externalPackageJSONPath)

    const range = packageJSON.dependencies[externalName] || packageJSON.devDependencies[externalName];

    if (!range) {
      throw new ReferenceError(`Dependency ${externalName} not found in package.json for '${resolveOptions.paths}'`);
    }

    if (externalName in allParentExternals) {
      // uses reverse to chose the external which is the closest ancestor
      const possibleVersion = Array.from(allParentExternals[externalName].values()).reverse().find(
        (resolve) => intersects(resolve.version, range)
      );
      if(possibleVersion) {
        parentExternals[externalName] = new Map([[range, possibleVersion]]);
        return;
      } else {
        allParentExternals[externalName].set(range, external);
      }
    } else {
      allParentExternals[externalName] = new Map([[range, external]]);
    }

    external.merged = [];
    external.container = container;
    external.resolve = require.resolve(externalName, resolveOptions);
    external.version = dependencyPackageJSON.version;
    externals[externalName] = new Map([[range, external]]);
  });

  return externals;
};

export default createExternals;
