module.exports = {
  globals: {
    server: true,
  },
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  extends: [
    'eslint:recommended',
    "plugin:flowtype/recommended"
  ],
  env: {
    browser: true
  },
  rules: {
    "eqeqeq": "off"
  },
  "plugins": [
    "flowtype"
  ]
};
