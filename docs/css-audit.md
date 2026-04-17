# CSS audit — post-split state (2026-04-17)

Audit of `styles/` after the granular CSS split + DS migration, to track
leftover duplications and inconsistencies. Nothing here is actively broken —
this is a cleanup backlog.

## Summary

| Kind                       | Count | Status                                                            |
| -------------------------- | ----- | ----------------------------------------------------------------- |
| Cross-file duplicates      | 3     | Identical bodies — no impact                                      |
| **Cross-file conflicts**   | 24    | **Real cascade drift — view files silently override base tokens** |
| Within-file "conflicts"    | 44    | Intentional DS-migration overrides — mergeable                    |
| Missing CSS (JS → no rule) | 4     | **Fixed** (see commit `7c6a688`)                                  |
| Lost during split          | 5     | **Fixed** — `.pin-chip` → `.ap-status.yellow`                     |
| Broken media-query cascade | 1     | **Fixed** — media queries moved to `responsive.css` (loads last)  |

---

## Context & workflow

**Baseline**: commit `a2efa9a` (merge-base of `refactor/split-modules-and-views`
with `main`). At that commit, **all CSS lived inline in `index.html`** inside
one `<style>` block (~5400 lines). The split moved those rules into
`styles/*.css`, preserving content but changing the cascade order.

**Stylesheet load order** (see `index.html:7-28`): DS files first, then
`tokens.css` → `base.css` → `layout.css` → `ds-patches.css` →
`app-components.css` → `views/*.css` (alphabetical) → `responsive.css` last.
Later files override earlier ones at equal specificity.

**To diff a selector against baseline**:

```bash
# Find original baseline rule(s) for .step-card
git show a2efa9a:index.html | grep -n -B 1 -A 10 '\.step-card {'

# Find current split location(s)
rg --multiline '^\.step-card \{[\s\S]*?\}' styles/
```

The **last baseline rule** in source order is the effective winner (no media
query). Compare to the current last-loaded declaration to know which value
shipped to users originally.

**Verify visually**: `npm start` (serves on :3000 via `npx serve`). Compare
against the deployed reference: `https://mbousendorfer.github.io/probable-spoon/`.
For mobile cascade checks, resize below 900px.

**DS token lookup**: the `ds-css` MCP exposes `recommend_token`, `search_tokens`,
`validate_css`. If unavailable, grep `ds/desktop_variables.css` for
`--ref-spacing-*` / `--ref-radius-*` / `--ref-color-*`.

---

## Cross-file duplicates (identical)

These were duplicated across files during the split. Safe to delete the copy
in `app-components.css` since they logically belong to the Library view.

- `.empty-state .icon` — `app-components.css` + `views/library.css`
- `.empty-state .icon [class^="ap-icon-"]` — `app-components.css` + `views/library.css`
- `.empty-state p` — `app-components.css` + `views/library.css`

## Cross-file conflicts (property-level)

These were missed by the original audit because the detector keyed on the raw
selector string (so `.a, .b, .step-card` did not match `.step-card`). After
splitting grouped selectors and comparing at property level, **24 selectors**
have conflicting values across files.

**Cascade drift pattern**: baseline had two rules in the same `<style>` block
(e.g. `.step-card { padding: 20px }` then later `.step-card { padding: var(--ref-spacing-sm) }`
→ 16px wins). After the split, the first rule landed in a view file loaded
**after** `base.css`, so the view-file value now wins — flipping the baseline
outcome.

### List (24)

| Selector                   | Files                               | Conflicting props                                                     |
| -------------------------- | ----------------------------------- | --------------------------------------------------------------------- |
| `.toolbar`                 | app-components.css, base.css        | background, border, border-radius, box-shadow                         |
| `.idea-intro`              | app-components.css, ideas.css       | padding                                                               |
| `.selection-bar`           | base.css, ideas.css, posts.css      | background, border-color                                              |
| `.empty-state`             | base.css, sources.css               | border, border-radius                                                 |
| `.skeleton`                | app-components.css, base.css        | border-radius                                                         |
| `.app-shell`               | base.css, layout.css                | background                                                            |
| `.assistant-panel`         | base.css, layout.css, assistant.css | background                                                            |
| `.assistant-panel__bottom` | base.css, layout.css, assistant.css | background, box-shadow                                                |
| `.assistant-composer`      | base.css, assistant.css             | background, box-shadow                                                |
| `.assistant-turn__content` | base.css, assistant.css             | background, box-shadow                                                |
| `.assistant-empty`         | base.css, assistant.css             | background                                                            |
| `.assistant-prompt`        | base.css, assistant.css             | background                                                            |
| `.library-overview`        | base.css, library.css               | background (gradient vs solid), box-shadow                            |
| `.step-card`               | base.css, brief.css                 | background, border, border-radius, box-shadow, **padding (16 vs 20)** |
| `.session-empty`           | base.css, session.css               | border, border-radius                                                 |
| `.hero`                    | base.css, layout.css                | background, border, border-radius, box-shadow                         |
| `.source-index`            | base.css, sources.css               | border, border-radius, **padding (16 vs 18)**                         |
| `.source-card`             | base.css, sources.css               | border, border-color, border-radius                                   |
| `.source-body`             | base.css, sources.css               | background, **padding (16 vs 18 20 20)**                              |
| `.idea-item`               | base.css, ideas.css                 | border, border-radius                                                 |
| `.drawer-section--primary` | base.css, drawer.css                | border, border-radius, **padding (16 vs 20)**                         |
| `.session-modal`           | base.css, session.css               | border                                                                |
| `.source-header`           | base.css, sources.css               | **padding (16 vs 20)**                                                |
| `.drawer-fact`             | drawer.css, library.css             | border, min-height, padding                                           |

**Resolution pattern**:

1. Compare each conflict to baseline (`a2efa9a`) to know the original winner.
2. If the base.css value (DS token) matches baseline → remove the view-file
   override.
3. If the view-file value matches baseline → remove the redundant base.css
   declaration (merge: base groups it into a big multi-selector rule; split
   that rule to exclude the view-owned selector).
4. Prefer DS tokens over hardcoded values when both match baseline's effect.

## Broken media-query cascade (fixed)

`base.css` contained 4 `@media` + 1 `@container` query. In the baseline, these
sat at the end of the `<style>` block and overrode earlier `.app-body` rules
correctly. After the split, `base.css` loaded **before** `layout.css`, so
`layout.css`'s unconditional `.app-body` redeclarations silently suppressed the
mobile breakpoints — the 900px single-column layout never activated.

**Fix**: moved all 5 responsive queries to `styles/responsive.css`, loaded last
in `index.html`. Matches baseline cascade behavior.

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

Detects cross-file + within-file duplicates AND property-level cross-file
conflicts. Splits grouped selectors and tracks `@media`/`@container` context
so responsive overrides are not falsely flagged.

```bash
python3 <<'PY'
import re, os
from collections import defaultdict

def extract_rules(text, path):
    text = re.sub(r'/\*.*?\*/', '', text, flags=re.DOTALL)
    rules = []
    pos, stack = 0, []
    while pos < len(text):
        c = text[pos]
        if c == '{':
            i = pos - 1
            while i >= 0 and text[i] not in '{};': i -= 1
            sel = re.sub(r'\s+', ' ', text[i+1:pos].strip())
            stack.append((sel, pos))
        elif c == '}':
            if stack:
                sel, op = stack.pop()
                body = text[op+1:pos].strip()
                if '{' not in body:
                    ctx = 'top'
                    for ps, _ in stack:
                        if ps.startswith('@media') or ps.startswith('@container'):
                            ctx = ps; break
                    for s in [x.strip() for x in sel.split(',') if x.strip()]:
                        rules.append((path, s, re.sub(r'\s+', ' ', body), ctx))
        pos += 1
    return rules

all_rules = []
for root, _, files in os.walk('styles'):
    for f in sorted(files):
        if f.endswith('.css'):
            with open(os.path.join(root, f)) as fp:
                all_rules.extend(extract_rules(fp.read(), os.path.join(root, f)))

def props(body):
    return {k.strip(): v.strip() for d in body.split(';') if ':' in d for k, v in [d.split(':', 1)]}

by_key = defaultdict(list)
for p, s, b, ctx in all_rules:
    if s and not s.startswith('@'):
        by_key[(s, ctx)].append((p, b))

for (sel, ctx), locs in by_key.items():
    if len(locs) < 2: continue
    files = {l[0] for l in locs}
    if len(files) < 2: continue
    conflicts = []
    props_by_file = {}
    for p, b in locs:
        props_by_file.setdefault(p, {}).update(props(b))
    all_props = {k for d in props_by_file.values() for k in d}
    for prop in all_props:
        vals = {f: v for f, d in props_by_file.items() for k, v in [(prop, d.get(prop))] if v}
        if len(vals) >= 2 and len(set(vals.values())) > 1:
            conflicts.append((prop, vals))
    if conflicts:
        print(f"[{ctx}] {sel}")
        for prop, fv in conflicts:
            for f, v in fv.items():
                print(f"    {prop}: {v}  ({f.replace('styles/', '')})")
        print()
PY
```

## Recommended order for cleanup

1. **Cross-file conflicts (24)** — highest value: each one is a silent
   cascade-drift bug. For each, diff against baseline `a2efa9a` to pick the
   winner, then delete the loser declaration.
2. **Cross-file dupes (3)** — low risk, delete the `app-components.css` copies.
3. **Within-file "conflicts" (44)** — merge each pair into one rule using DS
   tokens. Group by file (most dupes first): `assistant.css` (13), `ideas.css`,
   `sources.css`, `layout.css`, `app-components.css` (5 each).
4. **DS tokens pass** — while merging, replace hardcoded hex values with
   `--ref-color-*` / `--sys-*` via the ds-css MCP (`recommend_token`).

Each merge should keep the effective rendering identical (confirm by screenshot
diff before/after).
