# Webpack to Vite Migration Summary

This document describes the migration from Webpack to Vite for the Holocron Dashboard project.

## Changes Made

### 1. Package.json Updates

**Removed Webpack-related dependencies:**
- webpack
- webpack-cli
- webpack-dev-server
- babel-loader
- babel-polyfill
- ts-loader
- html-webpack-plugin
- fork-ts-checker-webpack-plugin
- tsconfig-paths-webpack-plugin
- svg-url-loader
- raw-loader
- @babel/core
- @babel/preset-env
- @babel/preset-react
- @babel/runtime
- @babel/plugin-transform-runtime
- @babel/plugin-proposal-private-property-in-object
- @types/webpack

**Added Vite dependencies:**
- vite@^5.0.0
- @vitejs/plugin-react@^4.2.0
- vite-tsconfig-paths@^4.2.0
- vite-plugin-svgr@^4.2.0
- @types/node@^20.0.0

**Updated scripts:**
- `start`: `vite` (was `webpack serve --mode=development`)
- `start:docker`: `vite --host=0.0.0.0` (was `webpack serve --mode=development --host=0.0.0.0`)
- `build`: `vite build` (was `webpack --mode=production --progress`)
- `preview`: `vite preview` (new command for previewing production builds)

### 2. Configuration Files

**Created:**
- `vite.config.ts` - Main Vite configuration
- `tsconfig.node.json` - TypeScript config for Vite config file
- `src/vite-env.d.ts` - Vite environment variable type definitions

**Updated:**
- `tsconfig.json` - Updated for Vite with ESNext modules and bundler resolution

**Removed/Deprecated:**
- `webpack.config.mjs` - No longer needed (can be deleted)

### 3. HTML Entry Point

**Moved:** `public/index.html` → `index.html` (root directory)

**Updated:**
- Added `<script type="module" src="/src/index.tsx"></script>` for Vite entry
- Removed Webpack comments

### 4. Environment Variables

**Changed from `process.env` to `import.meta.env`:**

| Webpack | Vite |
|---------|------|
| `process.env.NODE_ENV` | `import.meta.env.MODE` or `import.meta.env.DEV`/`import.meta.env.PROD` |
| `process.env.REACT_APP_*` | `import.meta.env.VITE_*` |

**Files updated:**
- `src/index.tsx`: Changed `process.env.NODE_ENV === 'development'` to `import.meta.env.DEV`
- `src/__mocks__/mockServer.ts`: Changed `process.env.NODE_ENV` to `import.meta.env.MODE` and `process.env.REACT_APP_IN_DOCKER` to `import.meta.env.VITE_IN_DOCKER`

### 5. TypeScript Configuration

**tsconfig.json changes:**
- `target`: ES5 → ES2020
- `module`: commonjs → ESNext
- `moduleResolution`: node → bundler
- Added: `allowImportingTsExtensions`, `isolatedModules`, `noEmit`
- Added: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- Added type reference: `vite/client`

### 6. Node.js Global Polyfill

**Added to vite.config.ts:**
- `global: 'globalThis'` in the `define` section to fix compatibility with packages that use Node.js globals (like `local-storage`)

**Security Note:**
- Originally included `'process.env': process.env` which exposed all environment variables (security risk)
- This was removed in favor of Vite's built-in `import.meta.env` for environment variables
- Only the `global` polyfill remains for Node.js compatibility

## Migration Benefits

1. **Faster Development Server**: Vite uses native ES modules for instant HMR
2. **Faster Builds**: Vite uses esbuild for pre-bundling dependencies
3. **Simpler Configuration**: No need for complex loader configurations
4. **Better Developer Experience**: Near-instant server start and faster updates
5. **Modern Tooling**: Built for modern JavaScript ecosystem

## Next Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Test the development server:**
   ```bash
   npm start
   ```

3. **Test the production build:**
   ```bash
   npm run build
   npm run preview
   ```

4. **Run tests:**
   ```bash
   npm test
   ```

5. **Clean up old files (optional):**
   - Delete `webpack.config.mjs`
   - Delete `public/index.html` (if not already removed)

## Environment Variables

If you were using environment variables with the `REACT_APP_` prefix, you'll need to:

1. Rename them to use `VITE_` prefix
2. Update any references in the code
3. Update `.env` files if they exist

Example:
- `.env.local`: Change `REACT_APP_API_URL=...` to `VITE_API_URL=...`
- Code: Change `process.env.REACT_APP_API_URL` to `import.meta.env.VITE_API_URL`

## Troubleshooting

### Import Issues
If you encounter module resolution issues, ensure:
- `vite-tsconfig-paths` plugin is installed and configured
- `tsconfig.json` has correct `baseUrl` and `paths` configuration

### SVG Imports
SVGs are handled by `vite-plugin-svgr`. Import SVGs as React components:
```tsx
import Logo from './logo.svg'
```

### Markdown Files
If raw markdown imports are needed, you can use the `?raw` suffix:
```tsx
import content from './content.md?raw'
```

## Docker Support

For Docker deployments, set the `VITE_IN_DOCKER` environment variable to prevent the mock server from starting.

## References

- [Vite Documentation](https://vitejs.dev/)
- [Vite Migration Guide](https://vitejs.dev/guide/migration.html)
- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react)
