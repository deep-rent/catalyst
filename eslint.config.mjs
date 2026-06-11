import eslint from '@eslint/js';
import headers from 'eslint-plugin-headers';
import prettier from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tsdoc from 'eslint-plugin-tsdoc';
import tseslint from 'typescript-eslint';

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      tsdoc: tsdoc,
      headers: headers,
    },
    rules: {
      'headers/header-format': [
        'error',
        {
          source: 'string',
          style: 'jsdoc',
          content:
            'Copyright (c) {year} deep.rent GmbH (https://deep.rent).' +
            '\nLicensed under the MIT License.',
          trailingNewlines: 2,
          variables: {
            year: '2026',
          },
        },
      ],
      '@typescript-eslint/naming-convention': 'warn',
      curly: 'warn',
      eqeqeq: 'warn',
      '@typescript-eslint/only-throw-error': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
        },
      ],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'tsdoc/syntax': 'error',
    },
  },
  {
    ignores: ['out/', 'dist/', '**/*.d.ts'],
  },
];
