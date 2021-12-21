import {
  NormalizedExportLeaf,
  NormalizedExports,
  RawExternalExports,
  RawExternalModule,
} from "../types";

const defaultExports = {
  default: {
    path: '.',
  },
};

const normalizeExport = (exports: RawExternalExports, target: NormalizedExports ,type: 'node' | 'default') => {
  if (typeof exports[type] === 'string') {
    target[type] = {
      path: exports[type] as string,
    };
  } else {
    target[type] = exports[type] as NormalizedExportLeaf;
  }
}

const normalizeExternal = (rawExternal: RawExternalModule) => {
  if (typeof rawExternal === 'string') {
    return {
      type: 'module',
      name: rawExternal,
      exports: defaultExports,
    };
  }
  if (Array.isArray(rawExternal)) {
    const [name, imports] = rawExternal;

    return {
      type: 'module',
      name,
      imports,
      exports: defaultExports
    };
  }

  switch (typeof rawExternal.exports) {
    case 'string':
      rawExternal.exports = {
        default: {
          path: rawExternal.exports,
        },
      }
      break;
    case 'object':
      const exports = {};
      normalizeExport(rawExternal.exports, exports, 'node');
      normalizeExport(rawExternal.exports, exports, 'default');

      return {
        ...rawExternal,
        exports
      };
    default:
      rawExternal.exports = defaultExports;
      return {
        ...rawExternal,
        exports: defaultExports
      }
  }

  return rawExternal;
}

export default normalizeExternal;
