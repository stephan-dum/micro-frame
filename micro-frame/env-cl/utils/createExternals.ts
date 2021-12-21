import {
  RawExternalModule,
  ExternalRecords,
  ResolveOptions, NormalizedExternal
} from "../types";

import {intersects} from "semver";

import normalizeExternal from './normalizeExternal';
import path from "path";


const createExternals = (
  rawExternals: RawExternalModule[],
  resolveOptions: ResolveOptions,
  container: string,
  allParentExternals: ExternalRecords,
  parentExternals: ExternalRecords,
) => {
  const externals: ExternalRecords = {};
  const packageJSONPath = require.resolve(`./package.json`, resolveOptions);
  const packageJSON = require(packageJSONPath);

  rawExternals.forEach((rawExternal) => {
    const external = normalizeExternal(rawExternal) as NormalizedExternal;
    const externalName = external.name;

    const externalPackageJSONPath = require.resolve(externalName + '/package.json', resolveOptions);
    // const externalPath = path.dirname(require.resolve(externalName+'/package.json', resolveOptions));
    // const externalPackageJSONPath = path.join(externalPath, 'package.json');
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
    external.base = path.dirname(externalPackageJSONPath);

    external.version = dependencyPackageJSON.version;
    externals[externalName] = new Map([[range, external]]);
  });

  return externals;
};

export default createExternals;
