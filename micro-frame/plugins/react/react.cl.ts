import getSyncNode from "@micro-frame/env-cl/nodes/getSyncNode";
import { ReactFactoryCL } from "./types";

const react: ReactFactoryCL = getSyncNode;

react.externals = [
  "react",
  [
    "react-dom",
    [
      "render",
      "hydrate"
    ]
  ]
];

// @ts-ignore
react.dirname = __dirname;

export default react;
