import loaderUtils from 'loader-utils';
import { rollup } from 'rollup';
import memory from 'rollup-plugin-memory';

module.exports = function (contents) {
  if (this.cacheable) this.cacheable();

  const callback = this.async();

  const options = loaderUtils.getLoaderConfig(this, 'rollupWebpackLoader');

  // Set defaults for options
  if (typeof options.rollup !== 'object') options.rollup = {};
  if (typeof options.rollup.entry !== 'object') options.rollup.entry = {};
  if (!Array.isArray(options.rollup.plugins)) options.rollup.plugins = [];
  if (typeof options.generate !== 'object') options.generate = {};

  // Create rollup config for usage with webpack (needs memory plugin to accept a string)
  //
  // More info on options can be found here:
  // https://github.com/rollup/rollup/wiki/JavaScript-API#rolluprollup-options-
  //
  // More info on memory plugin can be found here:
  // https://github.com/TrySound/rollup-plugin-memory
  const rollupConfig = {
    ...options.rollup,
    entry: {
      ...options.rollup.entry,
      path: this.resourcePath,
      contents,
    },
    plugins: [memory(), ...options.rollup.plugins],
  };

  (async () => {
    // Create rollup bundle
    //
    // More info on rollup can be found here:
    // https://github.com/rollup/rollup/wiki/JavaScript-API#rolluprollup-options-
    const bundle = await rollup(rollupConfig);

    // Generate code from bundle
    //
    // More info on generate can be found here:
    // https://github.com/rollup/rollup/wiki/JavaScript-API#bundlegenerate-options-
    const { code, map } = await bundle.generate({
      format: 'cjs',
      ...options.generate,
    });

    callback(null, code, map);
  })().catch(err => callback(err));
};

module.exports.raw = true;
