module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
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
      files: ['**/*.spec.*'],
      env: {
        mocha: true,
      },
      rules: {},
    },
  ],
  globals: {},
};
