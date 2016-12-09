import webpack from 'webpack';
import { promisify } from 'bluebird';
import webpackConfig from './webpack.config';

const VERBOSE = process.argv.includes('--verbose');

export default rollup =>
  new Promise(
    (resolve, reject) => {
      webpack(webpackConfig(rollup)).run(
        (err, stats) => {
          if (err) {
            console.error(err);
            return reject(err);
          }

          if (VERBOSE) console.log(stats.toString(webpackConfig.stats));
          resolve();
        }
      );
    }
  );
