const WebpackShellPluginNext = require('webpack-shell-plugin-next');

const getShellPlugin = (options) => new WebpackShellPluginNext(options);

module.exports = getShellPlugin;
