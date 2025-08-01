const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add path alias resolution
config.resolver.alias = {
  '@': path.resolve(__dirname),
};

// Ensure proper module resolution with extensions
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add proper extensions resolution
config.resolver.sourceExts = [
  'js',
  'jsx',
  'json',
  'ts',
  'tsx',
  'cjs',
  'mjs',
];

module.exports = config; 