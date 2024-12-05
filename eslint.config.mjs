// eslint.config.mjs
import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginPrettier from 'eslint-plugin-prettier';
import configPrettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      prettier: pluginPrettier,
    },
    rules: {
      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error', // Enforce Rules of Hooks
      'react-hooks/exhaustive-deps': 'warn', // Enforce Hook dependencies

      // Prettier integration
      'prettier/prettier': 'error',
    },
  },
  // Disable conflicting rules from other configs
  configPrettier,

  // ESLint's recommended rules
  pluginJs.configs.recommended,

  // TypeScript ESLint recommended rules
  ...tseslint.configs.recommended,

  // React recommended rules (Flat Config)
  pluginReact.configs.flat.recommended,
];
