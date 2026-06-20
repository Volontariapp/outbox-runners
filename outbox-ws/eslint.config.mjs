import volontariappConfig from '@volontariapp/eslint-config';
import globals from 'globals';

export default [
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },
  ...volontariappConfig,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
