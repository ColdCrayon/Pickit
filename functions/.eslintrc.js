module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
  },
  extends: ['eslint:recommended', 'google'],
  rules: {
    // ---- Formatting relaxations ----
    'object-curly-spacing': ['off'], // allow spaces inside { }
    'max-len': ['warn', { code: 100 }], // warn, don’t error, at 100 chars
    'indent': ['warn', 2, { SwitchCase: 1 }], // soft indent rule
    'comma-dangle': ['off'], // no trailing comma errors
    'quotes': ['warn', 'single', { allowTemplateLiterals: true }],
    'semi': ['error', 'always'],

    // ---- Practical adjustments ----
    'no-console': 'off',
    'require-jsdoc': 'off',
  },
  overrides: [
    {
      files: ['lib/stripe.js'],
      rules: {
        'valid-jsdoc': 'off', // don’t require full JSDoc in this file
        'quotes': ['warn', 'single', { allowTemplateLiterals: true }],
        'operator-linebreak': 'off', // allow ternary formatting as written
      },
    },
    {
      files: ['**/*.spec.*'],
      env: { mocha: true },
      rules: {},
    },
  ],
  globals: {},
};
