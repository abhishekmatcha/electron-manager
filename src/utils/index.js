/**
 * @file utils/index.js
 * @author Sanoop Jose T <sanoop.jose@hashedin.com>
 * Created on: 14/11/2019
 */

/**
 * @function getUuid
 * @description Generates uuid v4
 * @return { string } uuid
 */
export function getUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);

    return v.toString(16);
  });
}

/**
 * @function isDev
 * @description Check the node environment
 * @return { boolean } True if development mode, else false.
 */
export function isDev() {
  return process.env.EM_IS_DEV === "true"
}
