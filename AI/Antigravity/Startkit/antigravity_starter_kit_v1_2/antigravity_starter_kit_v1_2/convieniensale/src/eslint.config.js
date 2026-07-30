import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    // Frontend Browser Config
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    rules: {
      'no-unused-vars': 'warn',
      'no-empty': 'warn',
    },
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    // Backend Node API Config
    files: ['../api/**/*.js'],
    extends: [
      js.configs.recommended,
    ],
    rules: {
      'no-unused-vars': 'warn',
      'no-empty': 'warn',
    },
    languageOptions: {
      globals: globals.node,
    },
  }
])
