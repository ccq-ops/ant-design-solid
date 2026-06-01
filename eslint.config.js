import js from '@eslint/js'
import solid from 'eslint-plugin-solid'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { solid },
    rules: {
      ...solid.configs.typescript.rules,
      '@typescript-eslint/no-explicit-any': 'off',
      'solid/reactivity': 'off',
    },
  },
  {
    ignores: ['node_modules', 'dist', 'coverage', '.superpowers'],
  },
)
