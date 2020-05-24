let runtimeProcess = (process && process.type === 'browser') ? 'main' : 'renderer';

module.exports = {
  windowManager: require(`./windowManager.${runtimeProcess}.js`).default,
  init: function (config = {}) {
    process.env.EM_IS_INIT = true;
    process.env.EM_IS_DEV = config.isDev || (process.env.NODE_ENV === 'development');
  }
}
