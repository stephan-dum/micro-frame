import getSyncNode from "@micro-frame/env-build/nodes/getSyncNode";
import { PreactFactoryCL } from "./types";

const preact: PreactFactoryCL = (...args) => getSyncNode(...args);

preact.externals = [
  // 'preact',
  // 'preact/compat'
  {
    type: "module",
    "name": "preact",
    paths: ['./', './jsx-runtime', './compat'],
  }
];

// @ts-ignore
preact.dirname = __dirname;

export default preact;
