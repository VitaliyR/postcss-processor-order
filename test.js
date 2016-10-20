const postcss = require('postcss');
const test = require('ava');
const plugin = require('./');
const pkg = require('./package.json');

const plugins = [];
const defaultOpts = { order: ['red', 'green', 'blue', 'yellow', 'white'] };

const generatePlugin = (color) => {
  plugins.push(
    postcss.plugin(`${color}`, function() {
      return function(root) {
        root.walkDecls('color', decl => {
          decl.value = color;
        });
      };
    })()
  );
};

defaultOpts.order.forEach(generatePlugin);

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
