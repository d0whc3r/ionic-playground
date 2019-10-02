const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = function override(config, env) {
  if (!config.plugins) {
    config.plugins = [];
  }

  config.plugins.push(
      new MonacoWebpackPlugin({
        languages: ['javascript', 'css', 'html', 'typescript', 'scss', 'json'],
      }),
  );
  config.module.rules.push({ test: /(\.d.ts|\.txt)$/, use: 'raw-loader' });
  return config;
};
