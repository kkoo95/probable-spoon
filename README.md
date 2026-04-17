# bigbet-tests

Prototype interactif pour explorer et valider des redesigns de l'interface Agorapulse. Pas de build, pas de framework — juste des fichiers statiques servis localement.

## Stack

- HTML/CSS/JS vanilla (ES modules)
- Design System Agorapulse (`@agorapulse/ui-theme` + `@agorapulse/ui-symbol`) — composants `.ap-*`, icônes `<i class="ap-icon-*">`, tokens `--ref-*` / `--sys-*`
- État : Zustand vanilla store, persisté dans `localStorage`

## Lancer le projet

```bash
npm install                  # installe le Design System (@agorapulse/ui-theme + ui-symbol)
python3 -m http.server 8000
```

Puis ouvrir [http://localhost:8000](http://localhost:8000).

> Avec Claude Code, le serveur se lance automatiquement via la config `.claude/launch.json`.

## Structure

```
index.html             # Shell HTML (topbar, sidebar, workspace)
src/
  app.js               # Entrée : imports, renderApp(), event listeners globaux
  store.js             # Zustand store + sélecteurs
  utils.js             # Helpers partagés : icons, escapeHtml, actionButton, pills
  mock-generators.js   # Données de démo (déterministes via seed hashing)
  views/               # Renderers de vues (un fichier par zone du workspace)
    sidebar.js           # session bar, workflow tabs, assistant chat
    library.js           # sources, idées, sélection
    brief.js             # strategy brief
    posts.js             # drafts, previews, rail, filtres
    drawer.js            # idea detail (HTML injecté + listeners)
    workspace.js         # router entre les vues par tab
  modals/              # Modals self-contained (HTML injecté à init)
    session.js           # créer/renommer une session
    feedback.js          # feedback form
    bug-report.js        # bug report + capture screenshot
    schedule.js          # planifier des posts
    generate-image.js    # génération d'image AI
ds/                    # Design System Agorapulse (généré par `npm install` — ne pas éditer)
styles/                # Styles app : tokens, base, layout, composants, vues
scripts/
  sync-ds.mjs          # Copie le DS depuis node_modules/ vers ds/ (lancé via postinstall)
```

## Périmètre couvert

- **Library** — sources, idées extraites, filtres, tri
- **Posts** — drafts, revue, actions (éditer, planifier, dupliquer, supprimer)
- **Prévisualisations sociales** — LinkedIn, X/Twitter, Facebook, Instagram
- **Assistant** — fil de conversation, suggestions, pièces jointes
