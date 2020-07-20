module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended',
    'airbnb-base',
  ],
  // add your custom rules here
  rules: {
    'dot-notation': ['error', { 'allowPattern': '^[a-z]+(_[a-z]+)+$' }],
    'semi': ['error', 'always'],
    'import/no-unresolved': 'off',
    'no-console': 0,
    'no-param-reassign': [
      'error',
      {
        'props': true,
        'ignorePropertyModificationsFor': [
          'state'
        ]
      },
    ],
  }
}
