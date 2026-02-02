import { presetJavaScript, sxzz } from '@sxzz/eslint-config'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

export default sxzz(
  {
    vue: true,
    prettier: true
  },
  presetJavaScript,
  [
    {
      plugins: {
        'simple-import-sort': simpleImportSort
      },
      rules: {
        'unicorn/consistent-function-scoping': 'off',
        'no-debugger': 2,
        'no-console': 'off',
        'import/order': 'off',
        'no-shadow': 'off',
        'sort-imports': 'off',
        'perfectionist/sort-imports': 'off',
        'import/extensions': 'off',
        'import/prefer-default-export': 'off',
        'import/no-extraneous-dependencies': 'off',
        'import/no-default-export': 'off',
        'perfectionist/sort-named-imports': 'off',
        'simple-import-sort/exports': 'error',
        'simple-import-sort/imports': [
          'error',
          {
            groups: [
              // External packages
              ['^vue', String.raw`^@?\w`],
              // Alias
              [String.raw`^~(([\/.]?\w)|assets)`],
              // Side effect imports
              [String.raw`^\u0000`],
              // Parent imports
              [String.raw`^\.\.(?!/?$)`, String.raw`^\.\./?$`],
              // Other relative imports
              [
                String.raw`^\./(?=.*/)(?!/?$)`,
                String.raw`^\.(?!/?$)`,
                String.raw`^\./?$`
              ],
              // Style imports
              [String.raw`^.+\.s?css$`]
            ]
          }
        ]
      }
    },
    {
      ignores: ['*yml', '*env*']
    }
  ]
)
