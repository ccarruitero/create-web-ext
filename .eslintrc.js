module.exports = {
  'env': {
    'commonjs': true,
    'es6': true,
    'node': true
  },
  'extends': 'eslint:recommended',
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly',
    jest: true,
    describe: true,
    beforeEach: true,
    afterEach: true,
    it: true,
    browser: true
    
  },
  'parserOptions': {
    'ecmaVersion': 2018
  },
  'rules': {
    'indent': [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ]
  }
};
