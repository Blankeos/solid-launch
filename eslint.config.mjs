import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import solid from 'eslint-plugin-solid/configs/recommended';
import globals from 'globals';

export default [
  {
    ignores: ['dist/**/*', '**/*.js', '**/*.cjs', '**/*.mjs'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    ...solid,
  },
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },

    rules: {
      '@typescript-eslint/no-unused-vars': [
        1,
        {
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
];
