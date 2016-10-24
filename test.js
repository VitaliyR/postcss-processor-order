const postcss = require('postcss');
const test = require('ava');
const plugin = require('./');
const pkg = require('./package.json');
const defaultConfig = require('./config');

const shuffle = (a) => {
  for (let i = a.length; i; i--) {
    let j = Math.floor(Math.random() * i);
    [a[i - 1], a[j]] = [a[j], a[i - 1]];
  }
  return a;
};

const random = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const generatePlugin = (color) => {
  return postcss.plugin(`${color}`, function() {
    return function(root) {
      root.walkDecls('color', decl => {
        decl.value = color;
      });
    };
  })();
};

const generatePlugins = (pluginsNames) => {
  return pluginsNames.map(pluginName => generatePlugin(pluginName));
};

const defaultOpts = { order: ['red', 'green', 'blue', 'yellow', 'white'] };
const plugins = generatePlugins(defaultOpts.order);

function run(t, input, output, opts = { }, processors, cb) {
  processors = processors || [ plugin(opts) ].concat(plugins);
  const initialProcessors = processors.slice();
  return postcss(processors).process(input)
    .then(result => {
      if (cb) {
        cb(result);
        return;
      }

      t.deepEqual(result.warnings().length, 0);
      if (output) {
        t.deepEqual(result.css, output);
      }

      if (opts.order) {
        const processorPlugins = result.processor.plugins;
        const intersects = opts.order.reduce((arr, pluginName) => {
          const exists = initialProcessors.filter(p => p.postcssPlugin === pluginName)[0];
          exists && arr.push(pluginName);
          return arr;
        }, []);
        const unique = initialProcessors.reduce((arr, p) => {
          if (p.postcssPlugin === pkg.name) return arr;
          !~intersects.indexOf(p.postcssPlugin) && arr.push(p.postcssPlugin);
          return arr;
        }, []);

        t.deepEqual(processorPlugins[0].postcssPlugin, pkg.name);
        intersects.forEach((pluginName, i) => {
          t.deepEqual(processorPlugins[i + 1].postcssPlugin, pluginName);
        });

        let j = 0;
        for (var i = intersects.length + 1; i < processorPlugins.length; i++) {
          t.deepEqual(processorPlugins[i].postcssPlugin, unique[j++]);
        }
      }
    });
}

/* Tests */

test('It rests', t => {
  return run(t, 'div { color: initial; }', 'div { color: white; }');
});

test('It should be first processor', t => {
  t.throws(run(t, '', null, defaultOpts, plugins.concat(plugin(defaultOpts))));
});

test('It works', t => {
  const opts = {
    order: ['blue', 'green', 'red']
  };
  return run(t, 'div { color: initial; }', 'div { color: white; }', opts);
});

test('It works correctly', t => {
  const opts = {
    order: ['green', 'yellow']
  };
  return run(t, 'div { color: initial; }', 'div { color: white; }', opts);
});

test('It works in project', t => {
  const currentPlugins = [plugin()].concat(generatePlugins(defaultConfig.order.slice().reverse()));
  const initialCSS = 'div { color: initial; }';
  const resultCSS = 'div { color: csswring; }';
  return run(t, initialCSS, resultCSS, defaultConfig, currentPlugins);
});

test('It works if shuffle it', t => {
  let currentPlugins = generatePlugins(shuffle(defaultConfig.order.slice()));

  for (let i = 0; i < 5; i++) {
    currentPlugins.splice(random(0, currentPlugins.length - 1), 0, generatePlugin('plugin-' + i));
  }

  currentPlugins = [plugin()].concat(currentPlugins);

  let i = currentPlugins.length - 1;
  let lastPlugin;
  while (!lastPlugin) {
    let p = currentPlugins[i--].postcssPlugin;
    !~defaultConfig.order.indexOf(p) && (lastPlugin = p);
  }

  const initialCSS = 'div { color: initial; }';
  const resultCSS = `div { color: ${lastPlugin}; }`;

  return run(t, initialCSS, resultCSS, defaultConfig, currentPlugins);
});
