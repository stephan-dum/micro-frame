import spawn from 'cross-spawn';
import { Command } from 'commander';
import { MicroFrameConfig } from "./types";
import path from "path";
import * as console from "console";

const program = new Command()
  .option('-c, --config <config>', 'root config object')
  .option('-d, --debugEnabled', 'enable debug mod');

program.parse(process.argv);

const { cwd = process.cwd() } = process.env;

const { debugEnabled, config = path.resolve(cwd, 'micro-frame.js') } = program.opts();

const { port, publicPath } = require(config) as MicroFrameConfig;

const args = [
  'cross-env',
  `PORT=${port}`,
  `PUBLIC_PATH=${publicPath}`,
  `CONFIG=${config}`,
  'node',
  debugEnabled && '--inspect-brk',
  path.join(__dirname, '../node/.dist/runtime.js'),
].filter(Boolean);

console.log(args.join(' '));

spawn('yarn', args, { stdio: 'inherit', cwd });

