// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config({
  files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
  languageOptions: {
    globals: globals.browser,
  },
}, js.configs.recommended, ...tseslint.configs.recommended, storybook.configs["flat/recommended"]);
