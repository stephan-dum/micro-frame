import {ExternalRecords} from "../types";

const externalsToAssets = (externals: ExternalRecords, container: string, allExternals: ExternalRecords) => Object.entries(externals).map(
  ([name, versions]) => {
    const externalAssets: string[] = [];

    versions.forEach((resolve, version) => {
        if(!allExternals[name]?.has(version)) {
          const externalAsset = `/${container}/${name}${version}.js`;
          // const external = { resolve: externalAsset, container };
          // TODO: this needs to be fix something is wrong in typing
          // const external = { paths: ['external ']};

          if (name in allExternals) {
            allExternals[name].set(version, resolve);
          } else {
            allExternals[name] = new Map([[version, resolve]]);
          }

          externalAssets.push(externalAsset)
        }
      }
    );

    return externalAssets;
  }
).flat();

export default externalsToAssets;
