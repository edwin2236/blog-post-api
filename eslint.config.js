import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import prettierConfig from 'eslint-config-prettier/flat'
import importPlugin from 'eslint-plugin-import'
import prettier from 'eslint-plugin-prettier/recommended'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  { ignores: ['node_modules', 'dist', 'coverage', 'tsconfig.json'] },
  // General rules
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    plugins: { js },
    extends: ['js/recommended'],
  },
  {
    rules: {
      'padding-line-between-statements': [
        'warn',
        { blankLine: 'always', prev: '*', next: ['return', 'export'] },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        {
          blankLine: 'any',
          prev: ['const', 'let', 'var'],
          next: ['const', 'let', 'var'],
        },
      ],
      'no-console': 'warn',
    },
  },

  // TypeScript rules
  ...[
    ...tseslint.configs.recommended,
    {
      files: ['**/*.{js,mjs,cjs,ts}'],
      languageOptions: {
        globals: globals.node,
        parserOptions: {
          project: true,
          tsconfigRootDir: process.cwd(),
        },
      },
      rules: {
        ...tseslint.configs.recommended.rules,
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-shadow': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/no-confusing-void-expression': 'off',
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            args: 'after-used',
            ignoreRestSiblings: false,
            argsIgnorePattern: '^_.*?$',
            varsIgnorePattern: '^_.*?$',
          },
        ],
      },
    },
  ],

  // Prettier rules
  ...[
    prettier,
    prettierConfig,
    {
      rules: {
        'prettier/prettier': [
          'error',
          {
            printWidth: 80,
            trailingComma: 'all',
            tabWidth: 2,
            semi: false,
            singleQuote: true,
            bracketSpacing: true,
            arrowParens: 'always',
            endOfLine: 'auto',
          },
        ],
      },
    },
  ],

  // Import rules
  {
    ...importPlugin.flatConfigs.recommended,
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      'import/no-unresolved': 'error',
      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          warnOnUnassignedImports: true,
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          groups: [
            'type', // Type imports
            'builtin', // Node.js built-in modules
            'external', // External packages/modules
            'internal', // Internal aliases/paths
            'parent', // Parent directory imports (../)
            'sibling', // Same directory imports (./)
            'index', // Index imports
            'unknown', // Any unmatched imports
            'object', // Object imports (like stylesheets)
          ],
          pathGroups: [
            // Node.js built-in modules
            {
              pattern: '{node:**,node:**/**}',
              group: 'builtin',
              position: 'before',
            },
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before',
            },
          ],
        },
      ],
    },
  },
])
