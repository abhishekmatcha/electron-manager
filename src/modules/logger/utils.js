/**
 * @file logger/utils.js
 * @description logger utils
 * @author Sanoop Jose T <sanoop.jose@hashedin.com>
 * Created on: 12/05/2020
 */

import { EOL } from 'os';

/**
 * @function _getFormattedString
 * @param {string} type - Log type
 * @param {array} args - Arguments
 * @description Return formatted log string.
 */
export function getFormattedString(type, ...args) {
  let message = '';

  args.forEach((arg) => {
    if (typeof arg === 'string') {
      message = `${message} ${arg}`;
    } else {
      try {
        message = `${message} ${JSON.stringify(arg)}`;
      } catch (err) {
        console.warn('Error while stringifying the message');
        message = `${message} ${arg}`;
      }
    }
  })

  return formatLogString(type, message);
}

/**
 * @function formatLogString
 * @param {string} type - Log type
 * @param {string} message - Log message
 * @description Formats the messages with date-time and type
 */
export function formatLogString(type, message) {
  const formattedDate = generateDateTimeFormat();
  const dateTime = formattedDate.split('_');

  return `[${dateTime[0]} ${dateTime[1].replace(/-/g, ':')}] [${type}]: ${message}${EOL}`;
}

/**
 * @function generateDateTimeFormat
 * @description Generate a date-time string for file name.
 * @returns {string} - date-time string 
 */
export function generateDateTimeFormat() {
  const date = new Date();
  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();
  const dateString = `${day}-${monthIndex + 1}-${year}`;
  const timeString = date.toLocaleTimeString().replace(/:/g, '-');

  return `${dateString}_${timeString}`;
}

