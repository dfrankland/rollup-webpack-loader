import { resolve as resolvePath } from 'path';
import { fileSync as tmpFileSync } from 'tmp';
import { buildExternalHelpers } from 'babel-core';
import { writeFileSync } from 'fs';
import babel from 'rollup-plugin-babel';

// Temporary `babelHelpers` dependency
const { name: tmpFileName } = tmpFileSync();
writeFileSync(
  tmpFileName,
  `
    ${buildExternalHelpers()}
    module.exports = babelHelpers;
  `,
);

export default rollup => {
  const babelConfig = {
    presets: [
      ['es2015', { modules: rollup ? false : undefined }],
      'stage-0',
    ],
    plugins: ['external-helpers'],
    babelrc: false,
  };

  return {
    target: 'node',
    entry: [
      ...(rollup ? [] : [tmpFileName]),
      'regenerator-runtime/runtime',
      resolvePath(__dirname, '../src/index.js'),
    ],
    output: {
      path: resolvePath(__dirname, '../dist'),
      filename: `${rollup ? 'rollup' : 'webpack'}.js`,
    },

    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: rollup ? resolvePath(__dirname, '../../dist/index.js') : 'babel-loader',
        },
      ],
    },

    babel: babelConfig,

    rollupWebpackLoader: {
      rollup: {
        onwarn: process.argv.includes('--verbose') ? undefined : () => undefined,

        external: id => {
          if (id.match(/\.js$/) === null) return true;
          return false;
        },

        paths: id => {
          if (id.match(/babelHelpers/g) !== null) return tmpFileName;
          return id;
        },

        plugins: [babel(babelConfig)],
      },
    },

    debug: true,
    stats: {
      color: true,
      reasons: true,
    },
  };
};
