import getSyncNode from "@micro-frame/env-build/nodes/getSyncNode";
import { ReactFactoryCL } from "./types";

const react: ReactFactoryCL = (...args) => getSyncNode(...args);

react.externals = [
  "react",
  // {
  //   type: 'module',
  //   name: "react-dom/server",
  //   environments: ['node'],
  // },
  {
    type: 'module',
    name: 'react-dom',
    exports: {
      default: {
        pick: ["render", "hydrate"],
        path: './'
      },
      node: './server',
    },
  },
  // [
  //   "react-dom",
  //   [
  //     "render",
  //     "hydrate"
  //   ]
  // ]
];

// @ts-ignore
react.dirname = __dirname;

export default react;
