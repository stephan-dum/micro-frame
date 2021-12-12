// #!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
const packageJSONPath = path.join(dir, 'package.json');
const packageJSON = require(packageJSONPath);

const { entry, assetsByChunkName } = require(path.join(dir, packageJSON.statsFile || './.dist/private/stats.json'))

const entryFile = assetsByChunkName[entry].find((file) => path.extname(file) === '.js');

packageJSON.root = path.join('./.dist/public', entryFile).replace(/\\/g, '/');

fs.writeFileSync(packageJSONPath, JSON.stringify(packageJSON, null, 2));
