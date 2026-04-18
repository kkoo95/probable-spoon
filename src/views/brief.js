import { store } from "../store.js?v=15";
import { escapeHtml, formatText, icons, actionButton, iconButton } from "../utils.js?v=17";

export function strategyBriefMeta(session) {
  const brief = session.strategyBrief;
  const sections = brief?.sections || [];
  const entryCount = sections.reduce((total, section) => total + section.entries.length, 0);
  const populatedEntryCount = sections.reduce(
    (total, section) =>
      total +
      section.entries.filter((entry) => {
        if (entry.type === "cta") return (entry.items || []).length > 0;
        if (entry.type === "list" || entry.type === "chips") return (entry.items || []).length > 0;
        return Boolean((entry.value || "").trim());
      }).length,
    0,
  );
  return {
    sectionCount: sections.length,
    entryCount,
    populatedEntryCount,
  };
}

export function briefSectionIcon(iconName) {
  return icons[iconName] || icons.note;
}

export function escapeUrl(value = "") {
  return escapeHtml(value).replaceAll('"', "&quot;");
}

export function briefEntryHasContent(entry) {
  if (entry.type === "cta") return (entry.items || []).some((item) => item.label || item.url);
  if (entry.type === "list" || entry.type === "chips") return (entry.items || []).length > 0;
  return Boolean((entry.value || "").trim());
}

export function briefEntryDraftInstructions(type) {
  if (type === "cta") return "Use one line per CTA: Label | URL";
  if (type === "list") return "Use one line per item.";
  if (type === "chips") return "Use commas or one line per chip.";
  if (type === "textarea") return "Use short, concrete sentences.";
  return "";
}

export function briefEntrySourcePill(entry) {
  if (entry.locked) return '<span class="brief-meta-pill is-locked">Locked</span>';
  if (entry.source === "ai") return '<span class="brief-meta-pill is-ai">Auto</span>';
  return "";
}

export function briefSectionSummary(section) {
  const populatedEntries = section.entries.filter(briefEntryHasContent);
  if (!populatedEntries.length) return "No guidance yet";

  const labels = populatedEntries
    .slice(0, 2)
    .map((entry) => entry.label)
    .filter(Boolean)
    .join(" · ");

  if (populatedEntries.length <= 2) return labels;
  return labels + " +" + (populatedEntries.length - 2);
}

export function renderBriefEntryPreview(entry) {
  const placeholder = escapeHtml(entry.placeholder || "Add guidance");

  if (!briefEntryHasContent(entry)) {
    return '<div class="strategy-field__placeholder">' + placeholder + "</div>";
  }

  if (entry.type === "chips") {
    return (
      '<div class="brief-chip-list">' +
      entry.items.map((item) => '<span class="brief-chip">' + escapeHtml(item) + "</span>").join("") +
      "</div>"
    );
  }

  if (entry.type === "list") {
    return (
      '<ul class="strategy-field-list">' +
      entry.items.map((item) => "<li>" + escapeHtml(item) + "</li>").join("") +
      "</ul>"
    );
  }

  if (entry.type === "cta") {
    return (
      '<div class="brief-cta-list">' +
      entry.items
        .map(
          (item) =>
            '<div class="brief-cta-row"><span class="brief-cta-row__label">' +
            escapeHtml(item.label || "CTA") +
            '</span><a class="brief-cta-row__url" href="' +
            escapeUrl(item.url || "#") +
            '" target="_blank" rel="noreferrer noopener">' +
            escapeHtml(item.url || "Add URL") +
            "</a></div>",
        )
        .join("") +
      "</div>"
    );
  }

  return '<div class="strategy-entry__value">' + formatText(entry.value) + "</div>";
}

export function renderBriefEntryEditor(composer) {
  const multiline =
    composer.type === "textarea" || composer.type === "list" || composer.type === "chips" || composer.type === "cta";
  const labelInput =
    '<input class="brief-inline-input" type="text" placeholder="Field label" value="' +
    escapeHtml(composer.label) +
    '" data-brief-field="label" />';
  const typeInput =
    '<select class="brief-inline-input brief-inline-select" data-brief-field="type">' +
    ["text", "textarea", "list", "chips", "cta"]
      .map(
        (type) =>
          '<option value="' +
          type +
          '"' +
          (composer.type === type ? " selected" : "") +
          ">" +
          escapeHtml(type) +
          "</option>",
      )
      .join("") +
    "</select>";
  const valueInput = multiline
    ? '<textarea class="brief-inline-input brief-inline-textarea" rows="' +
      (composer.type === "cta" ? "4" : "3") +
      '" placeholder="' +
      escapeHtml(composer.placeholder || "Add content") +
      '" data-brief-field="rawValue">' +
      escapeHtml(composer.rawValue) +
      "</textarea>"
    : '<input class="brief-inline-input" type="text" placeholder="' +
      escapeHtml(composer.placeholder || "Add content") +
      '" value="' +
      escapeHtml(composer.rawValue) +
      '" data-brief-field="rawValue" />';

  return (
    '<div class="strategy-entry strategy-entry--editor" data-brief-editor="entry">' +
    '<div class="strategy-entry__editor-grid">' +
    '<div class="brief-editor__header">' +
    labelInput +
    typeInput +
    "</div>" +
    valueInput +
    '<div class="brief-editor__hint">' +
    escapeHtml(briefEntryDraftInstructions(composer.type)) +
    "</div>" +
    "</div></div>"
  );
}

export function renderBriefSection(session, ui, section) {
  const composer = ui.briefComposer;
  const isComposerInSection =
    composer && (composer.mode === "add-entry" || composer.mode === "edit-entry") && composer.sectionId === section.id;
  const isRefining = !!ui.pendingBriefRefine;
  const hasContent = section.entries.some(briefEntryHasContent);
  const collapsed = Boolean(section.collapsed);
  const summary = briefSectionSummary(section);
  const lockedCount = section.entries.filter((entry) => entry.locked).length;

  return (
    '<section class="step-card strategy-section strategy-section--accordion' +
    (collapsed ? " is-collapsed" : " is-expanded") +
    '"><div class="strategy-section__header"><div class="strategy-section__heading">' +
    briefSectionIcon(section.icon) +
    '<div class="strategy-section__heading-copy"><div class="strategy-section__title-row"><h3 class="strategy-section__title">' +
    escapeHtml(section.title) +
    '</h3><span class="strategy-section__meta">' +
    section.entries.filter(briefEntryHasContent).length +
    "/" +
    section.entries.length +
    ' filled</span></div><div class="strategy-section__summary">' +
    escapeHtml(summary) +
    '</div></div></div><div class="strategy-section__header-actions">' +
    iconButton({
      label: collapsed ? "Expand " + section.title : "Collapse " + section.title,
      icon: collapsed ? icons.chevronDown : icons.chevronUp,
      attrs: 'data-toggle-brief-section="' + section.id + '"',
      stroked: true,
    }) +
    '</div></div><div class="strategy-section__body' +
    (collapsed ? " is-collapsed" : "") +
    '">' +
    (!collapsed && section.entries.length
      ? '<div class="strategy-entry-list">' +
        section.entries
          .map((entry) => {
            const isEditing = isComposerInSection && composer.mode === "edit-entry" && composer.entryId === entry.id;

            if (isEditing) return renderBriefEntryEditor(composer);

            return (
              '<div class="strategy-entry"><button type="button" class="strategy-entry__trigger" data-edit-entry="' +
              entry.id +
              '" data-section-id="' +
              section.id +
              '"><div class="strategy-entry__title-row"><span class="strategy-entry__label">' +
              escapeHtml(entry.label || "Entry") +
              '</span><span class="strategy-entry__badges">' +
              briefEntrySourcePill(entry) +
              "</span>" +
              '</div><div class="strategy-entry__preview">' +
              renderBriefEntryPreview(entry) +
              '</div></button><div class="strategy-entry__actions">' +
              iconButton({
                label: "Delete entry",
                icon: icons.trash,
                attrs: 'data-delete-entry="' + entry.id + '" data-section-id="' + section.id + '"',
                stroked: true,
              }) +
              "</div></div>"
            );
          })
          .join("") +
        "</div>"
      : !collapsed
        ? '<div class="inline-empty-state strategy-section__empty"><div class="icon">' +
          briefSectionIcon(section.icon) +
          "</div><p>No content yet. Generate a first pass or add guidance inline.</p>" +
          actionButton({
            style: "ghost",
            color: "blue",
            label: "Generate with AI",
            attrs: 'data-refine-brief="' + section.id + '"',
          }) +
          "</div>"
        : "") +
    (!collapsed && isComposerInSection && composer.mode === "add-entry" ? renderBriefEntryEditor(composer) : "") +
    (!collapsed
      ? '<div class="strategy-section__footer">' +
        '<div class="strategy-section__footer-left">' +
        actionButton({
          style: "ghost",
          color: "blue",
          label: "+ Add field",
          attrs: 'data-open-add-entry="' + section.id + '"',
        }) +
        '</div><div class="strategy-section__footer-right">' +
        actionButton({
          style: "ghost",
          color: "blue",
          label: isRefining ? "Refining..." : "Refine with AI",
          attrs: 'data-refine-brief="' + section.id + '"',
          disabled: isRefining,
        }) +
        (lockedCount ? '<span class="strategy-section__footer-note">' + lockedCount + " locked</span>" : "") +
        "</div></div>"
      : "") +
    "</div></section>"
  );
}

export function renderStrategyBriefView(session, ui) {
  const { sectionCount, entryCount, populatedEntryCount } = strategyBriefMeta(session);
  const brief = session.strategyBrief;
  const isAddingSection = ui.briefComposer?.mode === "add-section";

  return (
    '<section class="tab-panel"><section class="step-layout"><div class="step-hero"><div class="step-hero__top"><div class="step-hero__copy"><div class="step-hero__eyebrow">Session step</div><div class="step-hero__title">Strategy Brief</div><div class="step-hero__description">Your content strategy at a glance. Define your goals, audience, and brand voice to guide every post.</div></div><div class="step-hero__meta"><span>' +
    sectionCount +
    " sections</span> · <span>" +
    populatedEntryCount +
    "/" +
    entryCount +
    ' fields filled</span></div></div></div><div class="strategy-brief-layout">' +
    (brief.sections.length
      ? brief.sections.map((section) => renderBriefSection(session, ui, section)).join("")
      : '<div class="empty-state"><div class="icon">' +
        icons.fileText +
        '</div><h3 style="margin-top: 18px; color: var(--ref-color-grey-150)">No strategy brief yet</h3><p>Start with the default structure, then refine each section with AI or inline edits.</p>' +
        actionButton({
          style: "secondary",
          color: "blue",
          label: "Generate with AI",
          attrs: 'data-refine-brief="all"',
        }) +
        "</div>") +
    (isAddingSection
      ? '<div class="step-card strategy-section-add" data-brief-editor="section"><input class="brief-inline-input" type="text" placeholder="Section title" value="' +
        escapeHtml(ui.briefComposer.title) +
        '" data-brief-field="title" /></div>'
      : "") +
    '<div class="strategy-brief__actions">' +
    actionButton({
      style: "ghost",
      color: "blue",
      label: "+ Add section",
      attrs: 'data-open-add-section="true"',
    }) +
    '</div><div class="strategy-brief__footer"><div class="strategy-brief__footer-left">' +
    actionButton({
      style: "secondary",
      color: "blue",
      label: ui.pendingBriefRefine ? "Refining..." : "Refine with AI",
      attrs: 'data-refine-brief="all"',
      loading: ui.pendingBriefRefine,
      disabled: ui.pendingBriefRefine,
    }) +
    '<p class="strategy-brief__hint">AI enriches open fields and preserves locked user edits.</p>' +
    '</div><div class="strategy-brief__footer-right">' +
    actionButton({
      style: "ghost",
      color: "red",
      label: "Clear brief",
      attrs: 'data-clear-brief="true"',
      disabled: !sectionCount,
    }) +
    "</div></div></div></section></section>"
  );
}

export function contextDocumentMeta(document) {
  const sections = document?.sections || [];
  return {
    sectionCount: sections.length,
    entryCount: sections.reduce((total, section) => total + (section.entries?.length || 0), 0),
  };
}

export function renderReadOnlySection(section) {
  return (
    '<section class="strategy-section"><div class="strategy-section__header"><div class="strategy-section__heading">' +
    briefSectionIcon(section.icon) +
    '<h3 class="strategy-section__title">' +
    escapeHtml(section.title) +
    '</h3></div></div><div class="step-card strategy-section__card">' +
    (section.entries?.length
      ? '<div class="strategy-entry-list">' +
        section.entries
          .map(
            (entry) =>
              '<div class="strategy-entry"><div class="strategy-entry__trigger" role="group"><div class="strategy-entry__title-row"><span class="strategy-entry__label">' +
              escapeHtml(entry.label || "Entry") +
              '</span></div><div class="strategy-entry__preview">' +
              renderBriefEntryPreview(entry) +
              "</div></div></div>",
          )
          .join("") +
        "</div>"
      : '<div class="inline-empty-state strategy-section__empty"><div class="icon">' +
        briefSectionIcon(section.icon) +
        "</div><p>No entries yet for this section.</p></div>") +
    "</div></section>"
  );
}

export function renderContextDocumentView({ title, description, document, nextAction, metaLabel }) {
  const { sectionCount, entryCount } = contextDocumentMeta(document);

  return (
    '<section class="tab-panel"><section class="step-layout"><div class="step-hero"><div class="step-hero__top"><div class="step-hero__copy"><div class="step-hero__eyebrow">Session step</div><div class="step-hero__title">' +
    escapeHtml(title) +
    '</div><div class="step-hero__description">' +
    escapeHtml(description) +
    '</div></div><div class="step-hero__meta"><span>' +
    sectionCount +
    " sections</span> · <span>" +
    entryCount +
    ' entries</span></div></div><div class="step-card"><h4>Next move</h4><p>' +
    escapeHtml(nextAction) +
    '</p></div></div><div class="strategy-brief-layout">' +
    (document.sections.length
      ? document.sections.map((section) => renderReadOnlySection(section)).join("")
      : '<div class="empty-state"><div class="icon">' +
        icons.fileText +
        '</div><h3 style="margin-top: 18px; color: var(--ref-color-grey-150)">No sections yet</h3><p>Add a few working notes so this step has clear direction.</p></div>') +
    '<div class="strategy-brief__footer"><div class="strategy-brief__footer-left"><p style="margin: 0; color: var(--ref-color-grey-80)">' +
    escapeHtml(metaLabel) +
    "</p></div></div></div></section></section>"
  );
}
