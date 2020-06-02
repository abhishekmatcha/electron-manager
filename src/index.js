/**
 * @file index.js
 * @description electron-manager index file
 * @author Sanoop Jose T <sanoop.jose@hashedin.com>
 * Created on: 22/05/2020
 */

"use strict";

let runtimeProcess = (process && process.type === 'browser') ? 'main' : 'renderer';

module.exports = {
  ...require(`./index.${runtimeProcess}.js`).default,
  init: function (config = {}) {
    process.env.EM_IS_INIT = 'true';
    process.env.EM_IS_DEV = config.isDev || (process.env.NODE_ENV === 'development') || 'false';
  }
}
