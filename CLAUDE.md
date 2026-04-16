# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Interactive prototype for exploring and validating Agorapulse UI redesigns. No build step, no bundler — static files served locally. The language in the codebase mixes English (code) and French (some comments/labels).

## Running the prototype

```bash
npx serve
# Then open http://localhost:3000
```

With Claude Code, the dev server auto-launches via `.claude/launch.json` (`npx serve -l 3000 .`).

## Architecture

**Vanilla JS only** — `index.html` + `src/app.js` + `src/store.js`. All markup lives in `index.html` (~6600 lines of HTML/CSS). `app.js` renders views by mutating the DOM directly. State lives in a Zustand vanilla store (`store.js`) with `store.subscribe(renderApp)` driving re-renders.

### State management

- Single Zustand vanilla store in `src/store.js`, created via `createStore` from `https://esm.sh/zustand@5/vanilla`
- State is persisted to `localStorage` under key `bigbet-library-prototype-v2`
- Selectors exported as standalone functions: `getActiveSession`, `getSessionUi`, `getIdeaById`, `countIdeas`, `countPinnedIdeas`, `sortSessions`
- All mutations go through `store.getState().actionName()` — actions are defined inline in the store creator

### View routing

`app.js` uses a tab-based model (`currentTab` in state). The `renderApp()` function dispatches to view renderers: `renderLibraryView`, `renderPostsView`, `renderStrategyBriefView`, `renderStepPlaceholder`, etc. Event delegation on container elements routes clicks via `data-*` attributes.

### Module loading

All JS imports use ES modules with `?v=N` cache-busting suffixes. External deps load from `esm.sh`. There is no `package.json` or `node_modules`.

## CSS architecture

Styles are split into granular files following ITCSS (Inverted Triangle CSS):

```
styles/
  tokens.css              — :root design tokens (colors, spacing, fonts, radii)
  base.css                — resets, keyframes, @media queries, multi-selector normalizations
  layout.css              — app shell, topbar, sidebar, workspace chrome
  components/             — reusable DS-level UI components
    icons.css, buttons.css, inputs.css, status.css, infobox.css,
    dialogs.css, ai-notice.css, utilities.css
  views/                  — feature/page-specific styles
    session.css, assistant.css, library.css, sources.css, ideas.css,
    brief.css, posts.css, previews.css, drawer.css, modals.css
```

- Token naming: `--ref-color-{palette}-{weight}`, `--ref-font-size-{scale}`, `--ref-spacing-{scale}`, `--ref-radius-{scale}`
- Icons use an inline SVG sprite (`#ap-icons-sprite`) with `<use href="#icon-{name}"/>` convention
- The source sprite file is `icons-sprite.svg`

## Key conventions

- `index.html` is the single entry point — HTML markup and the SVG sprite live here (~370 lines). CSS is in `styles/`.
- Mock data is generated in `src/mock-generators.js` (deterministic via seed hashing) and seed data is defined in `src/store.js`.
- Import paths use `?v=N` suffixes — keep them consistent when editing imports.
- The `__BIGBET_APP_V2_DISABLED__` flag in `index.html` controls whether a legacy inline script block initializes or the module system takes over.

## Hooks

A post-tool-call hook (`.claude/hooks/post-tool-call.py`) sends file diffs to a local provenance-tracking webserver after Write/Edit operations. It may emit errors if the provenance server isn't running — these are safe to ignore.
