/**
 * @file YYC³ Family-π³ ESLint Configuration
 * @description YYC³ 标准化代码规范配置
 * @author YYC³ Team
 * @version 1.0.0
 *
 * 规则优先级:
 * - error: 必须修复的问题
 * - warn: 建议修复的问题
 * - off: 关闭的规则
 */

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      import: importPlugin,
      'unused-imports': unusedImports,
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        crypto: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        Blob: 'readonly',
        File: 'readonly',
        FormData: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        AbortController: 'readonly',
        WebSocket: 'readonly',
        EventSource: 'readonly',
        performance: 'readonly',
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        import: 'readonly',
        self: 'readonly',
        caches: 'readonly',
        clients: 'readonly',
        ServiceWorkerGlobalScope: 'readonly',
      },
    },
    rules: {
      // ============================================================
      // TypeScript 规则
      // ============================================================
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/no-require-imports': 'off',

      // ============================================================
      // React 规则
      // ============================================================
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/jsx-no-undef': 'error',
      'react/jsx-key': ['error', { checkFragmentShorthand: true }],
      'react/no-danger': 'warn',
      'react/no-deprecated': 'warn',
      'react/no-unknown-property': ['error', { ignore: ['css'] }],
      'react/self-closing-comp': 'warn',
      'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],

      // ============================================================
      // React Hooks 规则
      // ============================================================
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // ============================================================
      // Import 规则
      // ============================================================
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before',
            },
          ],
        },
      ],
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'off',
      'import/first': 'error',
      'import/newline-after-import': 'warn',
      'unused-imports/no-unused-imports': 'error',

      // ============================================================
      // 通用代码质量规则
      // ============================================================
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-alert': 'warn',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': ['warn', { allowNamedFunctions: true }],
      'no-param-reassign': ['warn', { props: true, ignorePropertyModificationsFor: ['state', 'draft', 'acc'] }],
      'no-nested-ternary': 'warn',
      'no-unneeded-ternary': 'warn',
      'no-else-return': ['warn', { allowElseIf: false }],
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'curly': ['error', 'multi-line'],
      'default-case': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-multi-spaces': 'warn',
      'no-multiple-empty-lines': ['warn', { max: 2, maxEOF: 1 }],
      'no-trailing-spaces': 'warn',
      'padding-line-between-statements': [
        'warn',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
      ],
      'quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'arrow-spacing': 'error',
      'arrow-parens': ['error', 'as-needed'],
      'keyword-spacing': 'error',
      'space-before-blocks': 'error',
      'space-infix-ops': 'error',
      'key-spacing': 'error',
      'comma-spacing': 'error',
      'no-mixed-spaces-and-tabs': 'error',
      'indent': ['error', 2, { SwitchCase: 1, ignoredNodes: ['ConditionalExpression'] }],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '*.min.js',
      '*.d.ts',
      'vite.config.ts',
      'vitest.config.ts',
      'src/vite-env.d.ts',
      'src/types/global.d.ts',
      'src/sw.ts',
      'src/workbox-*.js',
      'backend/**',
      'utils/**',
      'scripts/**',
      'database/**',
      'sw.js',
      'workbox-*.js',
      'registerSW.js',
      'public/sw.js',
    ],
  }
);
