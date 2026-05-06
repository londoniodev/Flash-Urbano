const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [
  projectRoot,
  path.resolve(workspaceRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'packages'),
];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// CRÍTICO: Forzar que React y react-native SIEMPRE se resuelvan desde
// la raíz del monorepo, evitando copias duplicadas que rompen los hooks.
config.resolver.extraNodeModules = {
  'react': path.resolve(workspaceRoot, 'node_modules/react'),
  'react-native': path.resolve(workspaceRoot, 'node_modules/react-native'),
  'react/jsx-runtime': path.resolve(workspaceRoot, 'node_modules/react/jsx-runtime'),
  'react/jsx-dev-runtime': path.resolve(workspaceRoot, 'node_modules/react/jsx-dev-runtime'),
};

module.exports = config;
