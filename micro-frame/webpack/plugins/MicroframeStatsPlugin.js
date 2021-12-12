const { RawSource } = require('webpack').sources;

const PLUGIN_NAME = 'MicroFrameStatsPlugin';

class MicroFrameStatsPlugin {
  constructor() {

  }
  apply(compiler) {
    // compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
    compiler.hooks.make.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tap({
        name: PLUGIN_NAME,
        stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
      }, () => {

        const stats = compilation.getStats().toJson();
        const manifest = stats;
        // console.log('## stats', Object.keys(stats), stats.entries, stats.entrypoints);
        // modules, assets, chunks[0].files
        // const mods = compilation.chunkGraph.getChunkModules(compilation.chunks[0]);
        // console.log(compilation.chunkGraph.getChunkModules(compilation.chunks[0]));
        const entryAsset = './checkout.js';
        const { source, info } = compilation.getAsset(entryAsset);

        compilation.updateAsset(entryAsset, new RawSource(source._value + `export const __manifest = ${JSON.stringify(manifest)}`), info);

        // console.log(compilation.getAsset(entryAsset));
        // console.log(stats.chunks.modules(() => {
        // console.log(compilation.assets);
        //   return
        // }))
      })
      // compilation.hooks.afterOptimizeChunks.tap(PLUGIN_NAME, (chunks) => {
        // console.log(chunks);
    })
  }
}

module.exports = MicroFrameStatsPlugin;
