module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended',
    'airbnb-base',
  ],
  // add your custom rules here
  rules: {
    'dot-notation': ['error', { allowPattern: '^[a-zA-Z0-9]+(_[a-zA-Z0-9]+)+$' }],
    semi: ['error', 'always'],
    'import/no-unresolved': 'off',
    'import/extensions': [
      'error',
      'always',
      {
        js: 'never',
        jsx: 'never',
        mjs: 'neve',
      },
    ],
    'max-len': [
      'error', {
        ignorePattern: 'd="([\\s\\S]*?)"', // for svg
        ignoreTemplateLiterals: true,
        ignoreStrings: true,
        ignoreComments: true,
        code: 110,
      },
    ],
    'vue/max-len': [
      'error', {
        ignoreTemplateLiterals: true,
        ignoreStrings: true,
        ignoreHTMLAttributeValues: true,
        ignoreHTMLTextContents: true,
        ignoreComments: true,
        code: 110,
        template: 110,
        comments: 110,
      },
    ],
    'arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }],
    'no-console': 0,
    'no-param-reassign': [
      'error',
      {
        props: true,
        ignorePropertyModificationsFor: [
          'state',
        ],
      },
    ],
  },
};
