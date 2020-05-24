
'use strict';

const path = require('path');
const fs = require('fs');
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = {
  config: resolveApp('config'),
  dotenv: resolveApp('.env'),
  lib: resolveApp('lib'),
  modules: resolveApp('src/modules'),
  nodeModules: resolveApp('node_modules'),
  packageJson: resolveApp('package.json'),
  public: resolveApp('public'),
  root: appDirectory,
  src: resolveApp('src')
};
