import publish from "@micro-frame/env-cl";
import path from "path";

const { CWD = process.cwd() } = process.env;
const ROOT = '@xxxs-shop/application';
const PUBLIC = path.join(CWD, '.dist/public');
console.log('not implemented');
// publish({ cwd: CWD, root: ROOT, publicPath: PUBLIC });
