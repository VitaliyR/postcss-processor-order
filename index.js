const postcss = require('postcss');
const pkg = require('./package.json');

module.exports = postcss.plugin(pkg.name, function(opts) {
  opts = opts || require('./config');

  return function pluginHandler(root, result) {
    const plugins = result.processor.plugins;
    const pluginsNames = plugins.map(plugin => plugin.postcssPlugin).splice(1);
    const order = opts.order || [];

    if (plugins.indexOf(pluginHandler) !== 0) {
      throw root.error('This plugin should be first in processors array');
    }

    const getPlugin = (pluginName) => {
      return plugins.filter(plugin => plugin.postcssPlugin === pluginName)[0];
    };

    const intersects = order.reduce((arr, pluginName) => {
      ~pluginsNames.indexOf(pluginName) && arr.push(pluginName);
      return arr;
    }, []);

    const unique = pluginsNames.filter(pluginName => !~intersects.indexOf(pluginName));
    const pluginsOrder = intersects.concat(unique).map(pluginName => getPlugin(pluginName));

    plugins.forEach((plugin, i) => {
      i > 0 && (plugins[i] = pluginsOrder[i - 1]);
    });
  };
});
