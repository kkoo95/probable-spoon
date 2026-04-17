# CSS audit — post-split state (2026-04-17)

Audit of `styles/` after the granular CSS split + DS migration, to track
leftover duplications and inconsistencies. Nothing here is actively broken —
this is a cleanup backlog.

## Summary

| Kind                       | Count | Status                                         |
| -------------------------- | ----- | ---------------------------------------------- |
| Cross-file duplicates      | 3     | Identical bodies — no impact                   |
| Within-file "conflicts"    | 45    | Intentional DS-migration overrides — mergeable |
| Missing CSS (JS → no rule) | 4     | **Fixed** (see commit `7c6a688`)               |
| Lost during split          | 5     | **Fixed** — `.pin-chip` → `.ap-status.yellow`  |

---

## Cross-file duplicates (identical)

These were duplicated across files during the split. Safe to delete the copy
in `app-components.css` since they logically belong to the Library view.

- `.empty-state .icon` — `app-components.css` + `views/library.css`
- `.empty-state .icon [class^="ap-icon-"]` — `app-components.css` + `views/library.css`
- `.empty-state p` — `app-components.css` + `views/library.css`

## Within-file "conflicting" duplicates (mergeable)

These are the DS-migration pattern: the original rule was kept and a second
rule with the same selector was added later to override specific properties
with DS tokens. Works, but noisy. Fix = merge each pair into one rule using
the DS tokens.

### Example

```css
/* current — two rules in views/ideas.css */
.idea-item {
  border: 1px solid var(--border-soft);
  border-radius: var(--ref-radius-lg);
  background: var(--ref-color-white);
  padding: 18px;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease;
}
.idea-item {
  padding: var(--ref-spacing-sm);
}

/* merged */
.idea-item {
  border: 1px solid var(--border-soft);
  border-radius: var(--ref-radius-lg);
  background: var(--ref-color-white);
  padding: var(--ref-spacing-sm);
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease;
}
```

### By file

- **`app-components.css`** (5): `.platform-switch`, `.platform-switch button.active`, `.toolbar`, `.search`, `.search input`
- **`base.css`** (2): `html, body`, `@media (max-width: 720px)`
- **`layout.css`** (5): `.app-topbar`, `.product-mark`, `.product-mark .mark`, `.app-body`, `.workspace-main__inner`
- **`views/assistant.css`** (13): `.assistant-panel`, `.assistant-panel__top`, `.assistant-thread__list`, `.assistant-turn__content`, `.assistant-turn__prompt .assistant-turn__content`, `.assistant-empty`, `.assistant-prompt`, `.assistant-prompt:hover, .assistant-prompt:focus-visible`, `.source-type-tab`, `.assistant-panel__bottom`, `.assistant-panel__bottom::before`, `.assistant-composer`, `.assistant-input`
- **`views/drawer.css`** (4): `.drawer`, `.drawer-header`, `.drawer-content`, `.drawer-section + .drawer-section`
- **`views/ideas.css`** (5): `.idea-list`, `.idea-item`, `.idea-item:hover`, `.idea-main h4`, `.idea-summary`
- **`views/library.css`** (3): `.library-overview`, `.library-overview__title`, `.library-overview__description`
- **`views/session.css`** (3): `.workflow-tabs`, `.workflow-tab`, `.workflow-tab:hover`
- **`views/sources.css`** (5): `.source-header`, `.source-icon`, `.source-title`, `.source-actions`, `.source-body`

## How to reproduce the audit

```bash
# List cross-file + within-file duplicate CSS selectors
python3 <<'PY'
import re, os
from collections import defaultdict
rules = []
for root, _, files in os.walk('styles'):
    for f in sorted(files):
        if not f.endswith('.css'): continue
        path = os.path.join(root, f)
        with open(path) as fp:
            text = re.sub(r'/\*.*?\*/', '', fp.read(), flags=re.DOTALL)
        pos = 0
        while pos < len(text):
            brace = text.find('{', pos)
            if brace == -1: break
            start = text.rfind('}', 0, brace) + 1
            sel = re.sub(r'\s+', ' ', text[start:brace].strip())
            depth, j = 1, brace + 1
            while j < len(text) and depth:
                if text[j] == '{': depth += 1
                elif text[j] == '}': depth -= 1
                j += 1
            if sel:
                rules.append((path, sel, text[brace+1:j-1].strip()))
            pos = j
by_sel = defaultdict(list)
for p, s, b in rules:
    by_sel[s].append((p, b))
for sel, locs in by_sel.items():
    if len(locs) < 2: continue
    files = set(l[0] for l in locs)
    tag = "cross-file" if len(files) > 1 else "within-file"
    same = len({b for _, b in locs}) == 1
    state = "identical" if same else "conflicting"
    print(f"[{tag}/{state}] {sel}  ({len(locs)}x)")
PY
```

## Recommended order for cleanup

1. **Cross-file dupes** (low risk, 3 edits) — delete the `app-components.css`
   copies.
2. **Views with most dupes first**: `assistant.css` (13), `ideas.css` (5),
   `sources.css` (5), `layout.css` (5), `app-components.css` (5).
3. **DS tokens pass** — while merging, replace any remaining hardcoded hex
   values with `--ref-color-*` / `--sys-*` via the ds-css MCP
   (`recommend_token`).

Each merge should keep the effective rendering identical (confirm by
screenshot diff before/after).
