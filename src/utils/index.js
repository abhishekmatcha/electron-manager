/**
 * @file utils/index.js
 * @description electron-manager utility functions
 * @author Sanoop Jose T <sanoop.jose@hashedin.com>
 * Created on: 14/11/2019
 */

/**
 * @function isDev
 * @description Check the node environment
 * @default false
 * @return {boolean} True if development mode, else false.
 */
export function isDev() {
  return process.env.EM_IS_DEV === "true"
}
