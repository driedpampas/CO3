# Agent Guidelines & Workflow Rules

## Package Manager Rules
- **NEVER use `npm`, `yarn`, or `pnpm`.**
- **ALWAYS use `bun`.** The Bun binary is available at `~/.bun/bin/bun` (or via `bun` in PATH).
- Common commands:
  - Install dependencies: `~/.bun/bin/bun install`
  - Add package: `~/.bun/bin/bun add <package>`
  - Add dev package: `~/.bun/bin/bun add -d <package>`
  - Run scripts: `~/.bun/bin/bun run <script>`

---

## Code Quality & Verification
Always verify your work before concluding any task:
1. **Format code**:
   ```bash
   ~/.bun/bin/bun run format
   ```
2. **Lint & Checks**:
   ```bash
   ~/.bun/bin/bun run lint
   # Or to automatically apply safe fixes:
   ~/.bun/bin/bun run lint:fix
   ```
3. **Tests**:
   ```bash
   ~/.bun/bin/bun run test
   ```
4. **Web Build Check** (when making frontend/web changes):
   ```bash
   ~/.bun/bin/bun run build:web
   ```

---

## Project Overview & Conventions
- **Stack**: React Native (Android / iOS), React Native Web (Vite), Electron.
- **Linter & Formatter**: Biome (`biome.json`).
  - Indent: 4 spaces.
  - Quotes: Single quotes (`'`) for JS/TS, double quotes (`"`) for JSX.
  - Semicolons: Required.
- **Comments**: Keep comments to a minimum and strictly focused on the code they describe.
