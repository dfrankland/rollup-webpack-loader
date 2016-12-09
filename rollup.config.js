import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

export default {
  onwarn: process.argv.includes('--verbose') ? undefined : () => undefined,
  entry: './src/index.js',
  format: 'cjs',
  plugins: [
    babel({
      presets: [
        ['modern-node', { modules: false, version: '0.12' }],
        'stage-0',
      ],
      plugins: ['external-helpers'],
      babelrc: false,
    }),
    uglify(),
  ],
  dest: './dist/index.js',
};
