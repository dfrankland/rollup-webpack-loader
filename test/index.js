import { readFile } from 'fs';
import { promisify } from 'bluebird';
import { resolve as resolvePath } from 'path';
import build from './tools/build';

const readFilePromise = promisify(readFile);

const buildWithRollup = async rollup => {
  await build(rollup);

  const filePath = resolvePath(__dirname, `./dist/${rollup ? 'rollup' : 'webpack'}.js`);

  process.stdout.write(`Testing file compiled OK with${rollup ? '' : 'out'} Rollup: `);
  try {
    require(filePath);
  } catch (err) {
    console.error(`File \`${filePath}\` did not compile OK.`);
    throw err;
  }

  const file = await readFilePromise(filePath, { encoding: 'utf8' });

  const isTranspiled = file.match(/const .*? =/g) === null;
  const isTreeShaken = file.match(/NOT USED/g) === null;

  process.stdout.write(`Testing treeshaking with${rollup ? '' : 'out'} Rollup: `);
  if (isTreeShaken === rollup) {
    console.log('Test successful!');
  } else {
    throw new Error('Tree was not shaken! Code for "NOT USED" was found.');
  }

  process.stdout.write(`Testing files with${rollup ? '' : 'out'} Rollup got transpiled with Babel: `);
  if (isTranspiled) {
    console.log('Test successful!');
  } else {
    throw new Error('File was not transpiled! Found use of `const` instead of `var`.');
  }

  return Buffer.byteLength(file, 'utf8');
};

(async () => {
  const bytes = await Promise.all([buildWithRollup(false), buildWithRollup(true)]);

  const bytesSaved = bytes[0] - bytes[1];

  process.stdout.write('Testing that treeshaking saved bytes: ');
  if (bytesSaved > 0) {
    console.log(`Saved ${bytesSaved} bytes!`);
  } else {
    throw new Error(`Rollup did not save any bytes! The difference was ${bytesSaved} bytes.`);
  }
})().catch(
  err => {
    console.error(err);
    process.exit(1);
  }
);
