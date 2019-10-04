const tmp = require('tmp');
const { promisify } = require('util');

const createTempDir = promisify(tmp.dir, { multiArgs: true });

module.exports = async (testPromise) => {
  return createTempDir({
    prefix: 'tmp-create-web-ext-',
    unsafeCleanup: true,
  })
  .then(([tmpPath]) => {
    return testPromise(tmpPath);
  });
};
