module.exports = {
  extends: [
    'airbnb',
    'plugin:jsx-a11y/recommended',
    'prettier',
    'react-app',
    'plugin:react/recommended',
    'plugin:testing-library/react',
    'plugin:jest-dom/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { project: './tsconfig.json', tsconfigRootDir: __dirname },
  plugins: [
    'jsx-a11y',
    'prettier',
    'react-hooks',
    'etc',
    'jest',
    'jest-dom',
    'testing-library',
  ],
  overrides: [
    {
      files: ['**/*.js'],
      parser: '@babel/eslint-parser',
    },
  ],
  env: {
    'jest/globals': true,
  },
  ignorePatterns: ['/build/**/*.js', 'cypress/*'],
  rules: {
    'react/display-name': 'off',
    'react/function-component-definition': 'off',
    'react/jsx-no-constructed-context-values': 'off',
    'react/jsx-no-useless-fragment': 'off',
    'react/require-default-props': 'off',
    'testing-library/prefer-screen-queries': 'off',
    'testing-library/prefer-presence-queries': 'off',
    'testing-library/no-wait-for-multiple-assertions': 'off',
    'testing-library/prefer-find-by': 'off',
    'testing-library/no-render-in-setup': 'off',
    'testing-library/no-wait-for-side-effects': 'off',
    'testing-library/render-result-naming-convention': 'off',
    'testing-library/no-node-access': 'off',
    'testing-library/no-debugging-utils': 'off',
    'no-case-declarations': 'off',
    semi: 0,
    'etc/no-commented-out-code': 'error',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'warn',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    'import/extensions': [
      'error',
      'ignorePackages',
      { js: 'never', jsx: 'never', ts: 'never', tsx: 'never' },
    ],
    'prettier/prettier': [
      'error',
      {
        semi: false,
        endOfLine: 'auto',
      },
    ],
    'react/jsx-filename-extension': [
      1,
      {
        extensions: ['.js', '.jsx', '.tsx'],
      },
    ],
    'react/jsx-props-no-spreading': 'off',
    'no-underscore-dangle': 0,
    'import/imports-first': ['error', 'absolute-first'],
    'import/newline-after-import': 'error',
    'import/no-cycle': [
      2,
      {
        maxDepth: 1,
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true,
      },
    ],
    'react-hooks/rules-of-hooks': 'error', // Check rules of hooks
    'react-hooks/exhaustive-deps': 'warn', // Checks effect dependencies
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'jest/no-mocks-import': 'off',
  },
  globals: {
    window: true,
    document: true,
    localStorage: true,
    FormData: true,
    FileReader: true,
    Blob: true,
    navigator: true,
  },
  settings: {
    'import/resolver': {
      node: {
        paths: ['src'],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
}
