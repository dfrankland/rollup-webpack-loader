import { used } from './lib.js';

// This uses unnecessary transforms to test Babel
(async () => {
  console.log(
    '',
    await (async () => used())(),
  );
})().catch(
  err => {
    console.error(err);
    process.exit(1);
  }
);
