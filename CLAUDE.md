# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Interactive prototype for exploring and validating Agorapulse UI redesigns. No build step, no bundler — static files served locally. The language in the codebase mixes English (code) and French (some comments/labels).

## Running the prototype

```bash
python3 -m http.server 8000
# Then open http://localhost:8000
```

With Claude Code, the dev server auto-launches via `.claude/launch.json` (Python http.server on port 8000).

## Architecture

**Vanilla JS only** — no build step, no bundler. State lives in a Zustand vanilla store (`store.js`) with `store.subscribe(renderApp)` driving re-renders.

### Source layout

```
src/
  app.js              — entry point: imports, renderApp(), global event listeners
  store.js            — Zustand store + selectors
  utils.js            — shared helpers: icons map, escapeHtml, actionButton, pills, etc.
  mock-generators.js  — deterministic mock data via seed hashing
  views/              — view renderers (one file per workspace area)
    sidebar.js          renderSidebar, renderSessionBar, renderWorkflowTabs
    library.js          renderLibraryView, renderSourceCard, renderSelectionBar
    brief.js            renderStrategyBriefView, renderBriefSection, renderBriefEntry*
    posts.js            renderPostsView, renderDraftCard, renderPostsRail, previews
    drawer.js           renderDrawer + initDrawer (DOM refs + listeners)
    workspace.js        renderWorkspace, renderStepPlaceholder (router between views)
  modals/             — self-contained modals (HTML injected at init)
    session.js          create/rename session
    feedback.js         feedback form
    bug-report.js       bug report + screenshot capture
    schedule.js         schedule posts
    generate-image.js   AI image generation
```

Each view module imports utilities from `utils.js` and selectors from `store.js`, and exports its render functions. Each modal exports `init()` (injects HTML + binds events) and `render(state)`.

### State management

- Single Zustand vanilla store in `src/store.js`, created via `createStore` from `https://esm.sh/zustand@5/vanilla`
- State is persisted to `localStorage` under key `bigbet-library-prototype-v2`
- Selectors exported as standalone functions: `getActiveSession`, `getSessionUi`, `getIdeaById`, `countIdeas`, `countPinnedIdeas`, `sortSessions`
- All mutations go through `store.getState().actionName()` — actions are defined inline in the store creator

### View routing

`app.js` uses a tab-based model (`currentTab` in state). The `renderApp()` function calls `renderWorkspace()` from `views/workspace.js`, which dispatches to the per-tab view renderer (`renderLibraryView`, `renderPostsView`, `renderStrategyBriefView`, `renderStepPlaceholder`). Event delegation on container elements (`workspaceContent`, `assistantPanel`, `sessionSwitcher`) routes clicks via `data-*` attributes.

### Module loading

All JS imports use ES modules with `?v=N` cache-busting suffixes. External deps load from `esm.sh`. `package.json` exists only for the DS npm packages.

## Design System

Uses the official Agorapulse Design System CSS (`@agorapulse/ui-theme` + `@agorapulse/ui-symbol`).

### DS files (in `ds/`)

```
ds/
  desktop_variables.css  — ~700 design tokens (--ref-*, --sys-*, --comp-*)
  css-ui/font-face.css   — Averta font-face (5 weights)
  css-ui/index.css       — all .ap-* component classes (37 components)
  ap-icons.css           — icon font (290 icons via <i class="ap-icon-*">)
  fonts/averta/          — OTF font files
```

### App styles (in `styles/`)

```
styles/
  tokens.css             — app-specific tokens only (surface aliases, radius, mermaid)
  base.css               — resets, keyframes, @media queries
  layout.css             — app shell, topbar, sidebar, workspace chrome
  app-components.css     — custom components with no DS equivalent (ai-notice, search, toolbar, etc.)
  views/                 — feature/page-specific styles
    session.css, assistant.css, library.css, sources.css, ideas.css,
    brief.css, posts.css, previews.css, drawer.css, modals.css
```

### Token tiers

- `--ref-*` — reference tokens (colors, spacing, fonts, radii) from the DS
- `--sys-*` — semantic tokens (text colors, border colors, component states) — prefer these
- `--comp-*` — component-level tokens (infobox, etc.) — do not use directly in app CSS

### Icons

Use the DS icon font: `<i class="ap-icon-{name}"></i>`. 290 icons available. Size via classes: `.xs`, `.sm`, `.md`, `.lg`. Exception: `sparklesMermaid` uses inline SVG for gradient fill.

### Components

All `.ap-*` components come from the DS (`ds/css-ui/index.css`). Available: button, icon-button, dialog, infobox, badge, status, input, textarea, select, tabs, card, tag, avatar, tooltip, snackbar, etc. Use `get_component` from the ds-css MCP for details.

## Key conventions

- `index.html` is the single entry point — HTML markup only (~380 lines). CSS is in `styles/` and `ds/`.
- Mock data is generated in `src/mock-generators.js` (deterministic via seed hashing) and seed data is defined in `src/store.js`.
- Import paths use `?v=N` suffixes — keep them consistent when editing imports.

## MCP

The `ds-css` MCP server provides design system tools: `validate_css`, `recommend_token`, `search_tokens`, `get_component`, `list_components`, `search_icons`, `get_text_style`, `get_layout_pattern`.

