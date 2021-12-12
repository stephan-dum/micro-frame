const { ModuleFederationPlugin } = require("webpack").container;

const getModuleFederationPlugin = (config) => new ModuleFederationPlugin(config);

module.exports = getModuleFederationPlugin;
