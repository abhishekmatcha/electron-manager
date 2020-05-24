const fs = require('fs-extra');
const path = require('path');
const paths = require('./paths.js');

/**
 * @function getModules
 * @description return list of module names
 */
function getModules() {
  try {
    return fs.readdirSync(paths.modules);
  } catch (ex) {
    console.log('Faild to read module names: ', ex)
    return [];
  }
}

module.exports = {
  entry: function getEntryPoints(ps) {
    let entryConfig = {};
    const modules = getModules(ps);

    for (let module of modules) {
      entryConfig[module] = [
        `./src/modules/${module}/${module}.${ps}.js`
      ];
    }

    return entryConfig;
  }
};
