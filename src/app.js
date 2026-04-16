import {
  countIdeas,
  countPinnedIdeas,
  getActiveSession,
  getIdeaById,
  getSessionUi,
  sortSessions,
  store,
  validatePostDraft,
} from "./store.js?v=15";

import { openScheduleModal } from "./schedule-modal.js?v=16";
import { openGenerateImageModal } from "./generate-image-modal.js?v=16";

const workspaceContent = document.getElementById("workspaceContent");
const sessionSwitcher = document.getElementById("sessionSwitcher");
const workflowTabs = document.getElementById("workflowTabs");
const assistantPanel = document.getElementById("assistantPanel");
const assistantThread = document.getElementById("assistantThread");
const assistantPromptDeck = document.getElementById("assistantPromptDeck");
const assistantInput = document.getElementById("assistantInput");
const assistantModeLabel = document.getElementById("assistantModeLabel");
const sourceTypeTabs = document.getElementById("sourceTypeTabs");
const assistantSend = document.getElementById("assistantSend");
const assistantAttach = document.getElementById("assistantAttach");
const sessionModalBackdrop = document.getElementById("sessionModalBackdrop");
const sessionModal = document.getElementById("sessionModal");
const sessionModalTitle = document.getElementById("sessionModalTitle");
const sessionNameInput = document.getElementById("sessionNameInput");
const closeSessionModal = document.getElementById("closeSessionModal");
const cancelSessionModal = document.getElementById("cancelSessionModal");
const saveSessionModal = document.getElementById("saveSessionModal");
const openFeedbackBtn = document.getElementById("openFeedbackBtn");
const feedbackBackdrop = document.getElementById("feedbackBackdrop");
const feedbackModal = document.getElementById("feedbackModal");
const closeFeedbackBtn = document.getElementById("closeFeedbackBtn");
const cancelFeedbackBtn = document.getElementById("cancelFeedbackBtn");
const submitFeedbackBtn = document.getElementById("submitFeedbackBtn");
const feedbackFeatureArea = document.getElementById("feedbackFeatureArea");
const feedbackText = document.getElementById("feedbackText");
const openBugReportBtn = document.getElementById("openBugReportBtn");
const bugReportBackdrop = document.getElementById("bugReportBackdrop");
const bugReportModal = document.getElementById("bugReportModal");
const closeBugReportBtn = document.getElementById("closeBugReportBtn");
const cancelBugReportBtn = document.getElementById("cancelBugReportBtn");
const submitBugReportBtn = document.getElementById("submitBugReportBtn");
const bugCategories = document.getElementById("bugCategories");
const bugActionInput = document.getElementById("bugActionInput");
const bugProblemInput = document.getElementById("bugProblemInput");
const bugAutoBadge = document.getElementById("bugAutoBadge");
const bugCapturingBadge = document.getElementById("bugCapturingBadge");
const bugScreenshotPreview = document.getElementById("bugScreenshotPreview");
const bugDropzoneFallback = document.getElementById("bugDropzoneFallback");
const bugDropzone = document.getElementById("bugDropzone");
const bugFileInput = document.getElementById("bugFileInput");
const bugPreviewImg = document.getElementById("bugPreviewImg");
const bugFileName = document.getElementById("bugFileName");
const bugRemoveFileBtn = document.getElementById("bugRemoveFileBtn");
const bugContextBar = document.getElementById("bugContextBar");
const drawer = document.getElementById("ideaDrawer");
const drawerBackdrop = document.getElementById("drawerBackdrop");
const drawerPriority = document.getElementById("drawerPriority");
const drawerTitle = document.getElementById("drawerTitle");
const drawerDescription = document.getElementById("drawerDescription");
const drawerSummary = document.getElementById("drawerSummary");
const drawerMeta = document.getElementById("drawerMeta");
const drawerConfidence = document.getElementById("drawerConfidence");
const drawerSourceStatus = document.getElementById("drawerSourceStatus");
const drawerPinnedState = document.getElementById("drawerPinnedState");
const drawerWhyItWorks = document.getElementById("drawerWhyItWorks");
const drawerSessionNote = document.getElementById("drawerSessionNote");
const drawerGeneratePost = document.getElementById("drawerGeneratePost");
const drawerAskQuestion = document.getElementById("drawerAskQuestion");
const drawerMoveToBrief = document.getElementById("drawerMoveToBrief");
const closeDrawer = document.getElementById("closeDrawer");

let lastModalSignature = "";
let briefAutoSaveTimer = 0;

document.body.append(sessionModalBackdrop, sessionModal, bugReportBackdrop, bugReportModal);

const icons = {
  // sprite-based icons — paths live in #ap-icons-sprite in index.html
  sparkles:      '<i class="ap-icon-sparkles"></i>',
  search:        '<i class="ap-icon-search"></i>',
  filePdf:       '<i class="ap-icon-file--pdf"></i>',
  link:          '<i class="ap-icon-link"></i>',
  pin:           '<i class="ap-icon-pin"></i>',
  chevronDown:   '<i class="ap-icon-chevron-down"></i>',
  chevronUp:     '<i class="ap-icon-chevron-down"></i>',
  more:          '<i class="ap-icon-more"></i>',
  library:       '<i class="ap-icon-folder"></i>',
  upload:        '<i class="ap-icon-upload"></i>',
  plus:          '<i class="ap-icon-plus"></i>',
  trash:         '<i class="ap-icon-trash"></i>',
  pencil:        '<i class="ap-icon-pen"></i>',
  close:         '<i class="ap-icon-close"></i>',
  error:         '<i class="ap-icon-error"></i>',
  fileText:      '<i class="ap-icon-file--text"></i>',
  headset:       '<i class="ap-icon-headset"></i>',
  info:          '<i class="ap-icon-info"></i>',
  question:      '<i class="ap-icon-question"></i>',
  note:          '<i class="ap-icon-note"></i>',
  cog:           '<i class="ap-icon-cog"></i>',
  megaphone:     '<i class="ap-icon-megaphone"></i>',
  multipleUsers: '<i class="ap-icon-multiple-users"></i>',
  calendar:      '<i class="ap-icon-calendar"></i>',
  copy:          '<i class="ap-icon-copy"></i>',
  socialLike:    '<span class="social-action-icon" aria-hidden="true"><i class="ap-icon-thumb-up"></i></span>',
  socialComment: '<span class="social-action-icon" aria-hidden="true"><i class="ap-icon-single-chat-bubble"></i></span>',
  socialShare:   '<span class="social-action-icon" aria-hidden="true"><i class="ap-icon-repost"></i></span>',
  socialSend:    '<span class="social-action-icon" aria-hidden="true"><i class="ap-icon-paper-plane"></i></span>',
  // keep inline — gradient fill cannot be driven by CSS color token
  sparklesMermaid:
    '<span class="agp-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><defs><linearGradient id="sparklesMermaidGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#578fff"/><stop offset="100%" stop-color="#df52ff"/></linearGradient></defs><path fill="url(#sparklesMermaidGradient)" d="M11.984 7.2H12a.806.806 0 0 0 .8-.76c.072-1.36.68-1.64 1.584-1.64h.016c.44 0 .8-.352.8-.792a.796.796 0 0 0-.784-.808c-1.168-.024-1.616-.472-1.616-1.6 0-.44-.36-.8-.8-.8s-.8.36-.8.8c0 1.136-.456 1.584-1.608 1.6a.81.81 0 0 0-.792.808c0 .44.36.792.8.792 1.16 0 1.592.44 1.6 1.608a.803.803 0 0 0 .784.792"/><path fill="url(#sparklesMermaidGradient)" fill-rule="evenodd" d="M6.384 15.2H6.4a.806.806 0 0 0 .8-.76c.144-2.792 1.368-4.04 3.968-4.04h.032c.416.032.8-.352.8-.792a.8.8 0 0 0-.784-.808c-2.784-.064-4.024-1.296-4.016-4 0-.44-.36-.8-.8-.8s-.8.36-.8.8c-.008 2.728-1.24 3.96-4.008 4a.81.81 0 0 0-.792.808c0 .44.36.792.8.792h.008c2.736 0 3.96 1.24 3.992 4.008a.803.803 0 0 0 .784.792m.056-4.064a4.2 4.2 0 0 0-1.512-1.552l.008-.008A4.25 4.25 0 0 0 6.4 8.12c.376.616.88 1.112 1.52 1.48a4.4 4.4 0 0 0-1.48 1.536" clip-rule="evenodd"/></svg></span>',
};

function escapeHtml(value = "") {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatText(value = "") {
  return escapeHtml(value).replaceAll("\n", "<br />");
}

function hydrateStaticIcons() {
  document.querySelectorAll("[data-agp-icon]").forEach((node) => {
    const iconName = node.getAttribute("data-agp-icon");
    if (iconName && icons[iconName]) {
      node.outerHTML = icons[iconName];
    }
  });
}

function actionButton({ style, color, label, attrs = "", loading = false, disabled = false, icon = "" }) {
  const classes = ["ap-button", style, color, loading ? "is-loading" : ""].filter(Boolean).join(" ");
  return (
    '<button type="button" class="' +
    classes +
    '" ' +
    attrs +
    (disabled ? " disabled" : "") +
    ">" +
    icon +
    escapeHtml(label) +
    "</button>"
  );
}

function iconButton({ label, icon, attrs = "", stroked = false, color = "", disabled = false }) {
  return (
    '<button type="button" class="ap-icon-button ' +
    color +
    " " +
    (stroked ? "stroked" : "") +
    '" aria-label="' +
    escapeHtml(label) +
    '" title="' +
    escapeHtml(label) +
    '" ' +
    attrs +
    (disabled ? " disabled" : "") +
    ">" +
    icon +
    "</button>"
  );
}

function overflowMenu({ label, items, triggerClass = "ap-icon-button" }) {
  return (
    '<details class="action-menu"><summary aria-label="' +
    escapeHtml(label) +
    '" title="' +
    escapeHtml(label) +
    '"><span class="' +
    triggerClass +
    '" aria-hidden="true">' +
    icons.more +
    "</span></summary><div class=\"action-menu-panel\" role=\"menu\" aria-label=\"" +
    escapeHtml(label) +
    '">' +
    items.join("") +
    "</div></details>"
  );
}

function statusPill(status) {
  if (status === "processing") return '<span class="ap-status blue"><span class="dot"></span>Processing</span>';
  if (status === "failed") return '<span class="ap-status red"><span class="dot"></span>Failed</span>';
  return '<span class="ap-status green"><span class="dot"></span>Processed</span>';
}

function priorityPill(priority) {
  if (priority === "high") return '<span class="ap-status orange"><span class="dot"></span>High relevance</span>';
  if (priority === "medium") return '<span class="ap-status blue"><span class="dot"></span>Medium relevance</span>';
  return '<span class="ap-status grey"><span class="dot"></span>Low relevance</span>';
}

function strengthPill(strength) {
  if (strength === "strong") return '<span class="source-signal strong">Strong signal</span>';
  if (strength === "moderate") return '<span class="source-signal moderate">Moderate signal</span>';
  return '<span class="source-signal weak">Weak signal</span>';
}

function iconForType(type) {
  return type === "url" ? icons.link : icons.filePdf;
}

function assistantModeCopy(mode) {
  return (
    {
      pdf: { label: "PDF mode", dropTitle: "Drop a PDF into this sprint" },
      url: { label: "URL mode", dropTitle: "Paste an article or page URL" },
      video: { label: "Video mode", dropTitle: "Add a video link or transcript" },
      audio: { label: "Audio mode", dropTitle: "Upload audio or paste a transcript" },
    }[mode] || { label: "Source mode", dropTitle: "Add a source" }
  );
}

function generationPlatformCopy(platform) {
  return (
    {
      linkedin: {
        label: "LinkedIn",
        shortLabel: "LinkedIn",
        secondaryLabel: "LinkedIn-style preview",
      },
      twitter: {
        label: "Twitter/X",
        shortLabel: "X",
        secondaryLabel: "Twitter/X preview",
      },
    }[platform] || {
      label: "LinkedIn",
      shortLabel: "LinkedIn",
      secondaryLabel: "LinkedIn-style preview",
    }
  );
}

function strategyBriefMeta(session) {
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

function briefSectionIcon(iconName) {
  return icons[iconName] || icons.note;
}

function escapeUrl(value = "") {
  return escapeHtml(value).replaceAll('"', "&quot;");
}

function briefEntryHasContent(entry) {
  if (entry.type === "cta") return (entry.items || []).some((item) => item.label || item.url);
  if (entry.type === "list" || entry.type === "chips") return (entry.items || []).length > 0;
  return Boolean((entry.value || "").trim());
}

function briefEntryDraftInstructions(type) {
  if (type === "cta") return "Use one line per CTA: Label | URL";
  if (type === "list") return "Use one line per item.";
  if (type === "chips") return "Use commas or one line per chip.";
  if (type === "textarea") return "Use short, concrete sentences.";
  return "";
}

function briefEntrySourcePill(entry) {
  if (entry.locked) return '<span class="brief-meta-pill is-locked">Locked</span>';
  if (entry.source === "ai") return '<span class="brief-meta-pill is-ai">Auto</span>';
  return "";
}

function briefSectionSummary(section) {
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

function renderBriefEntryPreview(entry) {
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

function renderBriefEntryEditor(composer) {
  const multiline = composer.type === "textarea" || composer.type === "list" || composer.type === "chips" || composer.type === "cta";
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

function renderBriefSection(session, ui, section) {
  const composer = ui.briefComposer;
  const isComposerInSection =
    composer &&
    (composer.mode === "add-entry" || composer.mode === "edit-entry") &&
    composer.sectionId === section.id;
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
    (collapsed ? ' is-collapsed' : "") +
    '">' +
    (!collapsed && section.entries.length
      ? '<div class="strategy-entry-list">' +
        section.entries
          .map((entry) => {
            const isEditing =
              isComposerInSection &&
              composer.mode === "edit-entry" &&
              composer.entryId === entry.id;

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
                attrs:
                  'data-delete-entry="' +
                  entry.id +
                  '" data-section-id="' +
                  section.id +
                  '"',
              }) +
              "</div></div>"
            );
          })
          .join("") +
        "</div>"
      : !collapsed
        ? '<div class="inline-empty-state strategy-section__empty"><div class="icon">' +
        briefSectionIcon(section.icon) +
        '</div><p>No content yet. Generate a first pass or add guidance inline.</p>' +
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
    (lockedCount
      ? '<span class="strategy-section__footer-note">' + lockedCount + " locked</span>"
      : "") +
    "</div></div>"
      : "") +
    "</div></section>"
  );
}

function renderStrategyBriefView(session, ui) {
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

function contextDocumentMeta(document) {
  const sections = document?.sections || [];
  return {
    sectionCount: sections.length,
    entryCount: sections.reduce((total, section) => total + (section.entries?.length || 0), 0),
  };
}

function renderReadOnlySection(section) {
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
              "</span></div><div class=\"strategy-entry__preview\">" +
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

function renderContextDocumentView({ title, description, document, nextAction, metaLabel }) {
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
    " entries</span></div></div><div class=\"step-card\"><h4>Next move</h4><p>" +
    escapeHtml(nextAction) +
    "</p></div></div><div class=\"strategy-brief-layout\">" +
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

function truncateWithSeeMore(text, maxLength) {
  if (!text || text.length <= maxLength) {
    return {
      text,
      truncated: false,
    };
  }

  const trimmed = text.slice(0, maxLength).trimEnd();
  const safe = trimmed.slice(0, Math.max(0, trimmed.lastIndexOf(" ")));
  return {
    text: (safe || trimmed) + "...",
    truncated: true,
  };
}

function renderPostTextWithHashtags(text, hashtags, maxLength) {
  const truncated = truncateWithSeeMore(text || "", maxLength);
  const hashtagMarkup = hashtags.length
    ? '<div class="social-preview__hashtags">' +
      hashtags.map((hashtag) => '<span class="social-preview__hashtag">' + escapeHtml(hashtag) + "</span>").join(" ") +
      "</div>"
    : "";

  return (
    '<div class="social-preview__text">' +
    formatText(truncated.text) +
    (truncated.truncated ? ' <span class="social-preview__see-more">see more</span>' : "") +
    "</div>" +
    hashtagMarkup
  );
}

function LinkedInPostPreview(post) {
  const engagement = post.metadata?.engagement || {};
  return (
    '<article class="social-preview social-preview--linkedin ' +
    (post.status === "generating" ? "is-generating" : "") +
    '"><div class="social-preview__frame">' +
    '<div class="linkedin-preview__header">' +
    '<div class="linkedin-preview__avatar-wrap">' +
    '<img class="social-preview__avatar" src="' + escapeHtml(post.author?.avatarUrl || "") + '" alt="' + escapeHtml(post.author?.name || "Author") + ' avatar" />' +
    '</div>' +
    '<div class="linkedin-preview__author">' +
    '<div class="linkedin-preview__author-row">' +
    '<span class="linkedin-preview__name">' + escapeHtml(post.author?.name || "Generating draft") + '</span>' +
    '<span class="linkedin-preview__connection">• 1st</span>' +
    '</div>' +
    '<div class="linkedin-preview__title">' + escapeHtml(post.author?.title || "Preparing author profile") + '</div>' +
    '<div class="linkedin-preview__timestamp">' + escapeHtml(post.metadata?.timestamp || "now") + ' • Public</div>' +
    '</div>' +
    '</div>' +
    '<div class="linkedin-preview__body">' +
    renderPostTextWithHashtags(post.content?.text || "", post.content?.hashtags || [], 420) +
    (post.content?.cta ? '<div class="linkedin-preview__cta">' + formatText(post.content.cta) + "</div>" : "") +
    '</div>' +
    // Image attachment zone — shows generated image or "Generate an image" CTA
    '<div class="linkedin-preview__image-zone">' +
    (post.imageUrl
      ? '<img class="linkedin-preview__attachment" src="' + escapeHtml(post.imageUrl) + '" alt="Generated image" />'
      : '<button type="button" class="linkedin-preview__image-cta" data-open-generate-image="' + post.id + '">' +
        '<i class="ap-icon-sparkles"></i>' +
        'Generate an image' +
        '</button>') +
    '</div>' +
    '<div class="linkedin-preview__stats">' +
    '<span class="linkedin-preview__reactions"><span class="linkedin-preview__reaction-emojis">👍 💡</span>' + (engagement.likes ?? 0) + '</span>' +
    '<span class="linkedin-preview__stats-right">' + (engagement.comments ?? 0) + ' comments · ' + (engagement.shares ?? 0) + ' reposts</span>' +
    '</div>' +
    '<div class="linkedin-preview__actions">' +
    '<button type="button">' + icons.socialLike + '<span>Like</span></button>' +
    '<button type="button">' + icons.socialComment + '<span>Comment</span></button>' +
    '<button type="button">' + icons.socialShare + '<span>Repost</span></button>' +
    '<button type="button">' + icons.socialSend + '<span>Send</span></button>' +
    '</div>' +
    '</div></article>'
  );
}

const xIcons = {
  reply:    '<i class="ap-icon-reply"></i>',
  repost:   '<i class="ap-icon-repost"></i>',
  like:     '<i class="ap-icon-heart"></i>',
  views:    '<i class="ap-icon-bar-graph"></i>',
  bookmark: '<i class="ap-icon-bookmark"></i>',
};

function TwitterPostPreview(post) {
  const engagement = post.metadata?.engagement || {};
  return (
    '<article class="social-preview social-preview--twitter ' +
    (post.status === "generating" ? "is-generating" : "") +
    '"><div class="social-preview__frame">' +
    '<div class="twitter-preview__header">' +
    '<img class="social-preview__avatar social-preview__avatar--sm" src="' + escapeHtml(post.author?.avatarUrl || "") + '" alt="' + escapeHtml(post.author?.name || "Author") + ' avatar" />' +
    '<div class="twitter-preview__content">' +
    '<div class="twitter-preview__author-line">' +
    '<span class="twitter-preview__name">' + escapeHtml(post.author?.name || "Generating draft") + '</span>' +
    '<span class="twitter-preview__handle">@' + escapeHtml(post.author?.handle || "publishing") + '</span>' +
    '<span class="twitter-preview__dot">·</span>' +
    '<span class="twitter-preview__timestamp">' + escapeHtml(post.metadata?.timestamp || "now") + '</span>' +
    '</div>' +
    '<div class="twitter-preview__body">' +
    renderPostTextWithHashtags(post.content?.text || "", post.content?.hashtags || [], 260) +
    (post.content?.cta ? '<div class="twitter-preview__cta">' + formatText(post.content.cta) + "</div>" : "") +
    '</div>' +
    '<div class="twitter-preview__actions">' +
    '<button type="button">' + xIcons.reply + '<span>' + (engagement.comments ?? 0) + '</span></button>' +
    '<button type="button">' + xIcons.repost + '<span>' + (engagement.reposts ?? engagement.shares ?? 0) + '</span></button>' +
    '<button type="button">' + xIcons.like + '<span>' + (engagement.likes ?? 0) + '</span></button>' +
    '<button type="button">' + xIcons.views + '<span>' + (engagement.views ?? 0) + '</span></button>' +
    '<button type="button" class="twitter-preview__bookmark">' + xIcons.bookmark + '</button>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div></article>'
  );
}

function renderPlatformSelector(ui) {
  return (
    '<div class="platform-switch" aria-label="Post platform">' +
    '<button type="button" class="' +
    (ui.generationPlatform === "linkedin" ? "active" : "") +
    '" data-generation-platform="linkedin">LinkedIn</button>' +
    '<button type="button" class="' +
    (ui.generationPlatform === "twitter" ? "active" : "") +
    '" data-generation-platform="twitter">Twitter/X</button>' +
    "</div>"
  );
}

function filterSessionsBySearch(list, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return list;
  return list.filter(
    (session) =>
      session.name.toLowerCase().includes(normalized) ||
      session.updatedAtLabel.toLowerCase().includes(normalized) ||
      String(session.sources.length).includes(normalized),
  );
}

function sessionActionItem(label, action, sessionId, destructive = false) {
  return (
    '<button type="button" class="action-menu-item' +
    (destructive ? " destructive" : "") +
    '" data-session-action="' +
    action +
    '" data-session-id="' +
    sessionId +
    '">' +
    escapeHtml(label) +
    "</button>"
  );
}

function sessionOverflowMenu(session) {
  return overflowMenu({
    label: "Session actions",
    items: [
      sessionActionItem("Rename", "rename", session.id),
      sessionActionItem("Duplicate", "duplicate", session.id),
      session.archived
        ? sessionActionItem("Restore", "restore", session.id)
        : sessionActionItem("Archive", "archive", session.id),
      '<div class="action-menu-separator"></div>',
      sessionActionItem("Delete", "delete", session.id, true),
    ],
  });
}

function renderSessionBar(state, session) {
  const allSessions = sortSessions(state.sessions, true);
  const recentSessions = allSessions.filter((item) => item.id !== session?.id);
  const activeSessions = session ? [session] : [];
  const visibleActive = filterSessionsBySearch(activeSessions, state.sessionSearch);
  const visibleRecent = filterSessionsBySearch(recentSessions, state.sessionSearch);

  sessionSwitcher.innerHTML =
    '<div class="session-switcher-shell"><div class="session-switcher-row"><details class="session-switcher" ' +
    (state.sessionSwitcherOpen ? "open" : "") +
    '><summary class="session-switcher__stack"><div class="session-switcher__control"><div class="session-switcher__leading"><div class="session-switcher__copy"><div class="session-switcher__eyebrow">Current session</div><div class="session-switcher__title">' +
    escapeHtml(session ? session.name : "Choose a work session") +
    '</div></div></div><span class="session-switcher__chevron" aria-hidden="true">' +
    icons.chevronDown +
    '</span></div></summary><div class="session-switcher__panel"><div class="session-panel__search"><div class="session-panel__search-field">' +
    icons.search +
    '<input id="sessionSearchInput" type="text" placeholder="Search sessions" value="' +
    escapeHtml(state.sessionSearch) +
    '" /></div></div>' +
    (visibleActive.length
      ? '<div class="session-panel__section"><div class="session-panel__label">Active</div><div class="session-list">' +
        visibleActive
          .map(
            (item) =>
              '<div class="session-item active"><button type="button" class="session-item__button" data-switch-session="' +
              item.id +
              '"><div class="session-item__title">' +
              escapeHtml(item.name) +
              '</div><div class="session-item__meta">' +
              escapeHtml(item.updatedAtLabel) +
              " · " +
              item.sources.length +
              " sources · " +
              countIdeas(item) +
              ' ideas</div></button><div class="session-item__actions">' +
              sessionOverflowMenu(item) +
              "</div></div>",
          )
          .join("") +
        "</div></div>"
      : "") +
    (visibleRecent.length
      ? '<div class="session-panel__section"><div class="session-panel__label">Recent</div><div class="session-list">' +
        visibleRecent
          .map(
            (item) =>
              '<div class="session-item"><button type="button" class="session-item__button" data-switch-session="' +
              item.id +
              '"><div class="session-item__title">' +
              escapeHtml(item.name) +
              '</div><div class="session-item__meta">' +
              escapeHtml(item.updatedAtLabel) +
              (item.archived
                ? " · Archived"
                : " · " + item.sources.length + " sources · " + countIdeas(item) + " ideas") +
              '</div></button><div class="session-item__actions">' +
              sessionOverflowMenu(item) +
              "</div></div>",
          )
          .join("") +
        "</div></div>"
      : "") +
    (!visibleActive.length && !visibleRecent.length
      ? '<div class="session-panel__section"><div class="session-panel__label">No matching sessions</div><div class="session-item"><div class="session-item__button"><div class="session-item__meta">Try another keyword or create a new session.</div></div></div></div>'
      : "") +
    "</div></details>" +
    actionButton({
      style: "stroked",
      color: "grey",
      label: "New session",
      attrs: 'data-open-create-session="true"',
    }) +
    '</div><div class="session-switcher__meta">' +
    (session
      ? escapeHtml(session.updatedAtLabel) + " · " + session.sources.length + " sources"
      : "Switch sessions or create a new one to start the conversation") +
    "</div></div>";
}

function renderWorkflowTabs(currentTab) {
  [...workflowTabs.querySelectorAll("[data-tab]")].forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === currentTab);
  });
}

function messageActionButtons(message) {
  if (!message.ideaId || message.status === "loading") return "";
  return (
    '<div class="assistant-turn__actions">' +
    actionButton({
      style: "stroked",
      color: "grey",
      label: "Pin",
      attrs: 'data-assistant-pin="' + message.ideaId + '"',
    }) +
    actionButton({
      style: "stroked",
      color: "grey",
      label: "Compare",
      attrs: 'data-assistant-compare="' + message.ideaId + '"',
    }) +
    actionButton({
      style: "stroked",
      color: "grey",
      label: "Draft post",
      attrs: 'data-assistant-draft="' + message.ideaId + '"',
    }) +
    "</div>"
  );
}

function messageMarkup(message) {
  if (message.role === "system") {
    return (
      '<div class="ai-notice">' +
      '<button class="ai-notice__toggle" type="button" aria-expanded="false">' +
      '<span class="ai-notice__label">' + escapeHtml(message.meta) + '</span>' +
      '<span class="ai-notice__chevron"><i class="ap-icon-chevron-down"></i></span>' +
      '</button>' +
      '<div class="ai-notice__detail">' +
      '<span class="ai-notice__text">' + escapeHtml(message.text) + '</span>' +
      '</div>' +
      '</div>'
    );
  }

  if (message.role === "user") {
    return (
      '<article class="assistant-turn"><div class="assistant-turn__prompt"><div class="assistant-turn__meta"><span class="assistant-turn__role assistant-turn__role--user">' +
      icons.question +
      '<span class="assistant-turn__role-label">You</span></span></div><div class="assistant-turn__content">' +
      formatText(message.text) +
      "</div></div></article>"
    );
  }

  const badge =
    message.status === "loading"
      ? '<span class="ap-status grey"><span class="dot"></span>Thinking</span>'
      : message.status === "error"
        ? '<span class="ap-status red"><span class="dot"></span>Error</span>'
        : "";

  return (
    '<article class="assistant-turn"><div class="assistant-turn__response"><div class="assistant-turn__meta"><span class="assistant-turn__role assistant-turn__role--assistant">' +
    icons.sparklesMermaid +
    '<span class="assistant-turn__role-label">AI Copilot</span></span>' +
    badge +
    '</div><div class="assistant-turn__content ' +
    (message.status === "loading" ? "is-loading" : "") +
    '">' +
    formatText(message.text) +
    "</div>" +
    messageActionButtons(message) +
    "</div></article>"
  );
}

function assistantPromptList(ui) {
  const prompts = [
    {
      title: "Find strongest signal",
      value: "Find the strongest post angle in this session",
    },
    {
      title: "Compare top ideas",
      value: "Compare the top two ideas and tell me which one is more actionable",
    },
    {
      title: "Generate LinkedIn post",
      value: "Turn the leading idea into a short LinkedIn draft",
    },
    {
      title: "What source next?",
      value: "What source should I add next to strengthen this sprint?",
    },
  ];

  if (ui.assistantMode === "url") {
    prompts[0] = {
      title: "Map this URL",
      value: "Summarise the page and map it to existing ideas",
    };
  }

  return prompts.map(
    (prompt) =>
      '<button type="button" class="assistant-prompt" data-assistant-prompt="' +
      escapeHtml(prompt.value) +
      '"><span class="assistant-prompt__title">' +
      escapeHtml(prompt.title) +
      "</span></button>",
  );
}

function renderSidebar(state, session, ui) {
  assistantPanel.classList.toggle("is-disabled", !session);
  assistantModeLabel.textContent = assistantModeCopy(ui?.assistantMode || "pdf").label;
  assistantInput.value = ui?.assistantDraft || "";
  assistantInput.placeholder = session
    ? "Message the AI to compare ideas, find a signal, or draft the next move..."
    : "Create a session to start working with the AI copilot";
  assistantSend.disabled = !session || !!ui?.pendingChat;
  assistantSend.textContent = ui?.pendingChat ? "Thinking..." : "Send";

  [...sourceTypeTabs.querySelectorAll("[data-source-kind]")].forEach((button) => {
    button.classList.toggle("active", !!ui && button.dataset.sourceKind === ui.assistantMode);
  });

  if (!session) {
    assistantThread.innerHTML =
      '<div class="assistant-empty"><div class="assistant-turn__meta"><span class="assistant-turn__role">' +
      icons.sparkles +
      "<span>AI copilot</span></span></div><div class=\"assistant-turn__content\">Create a work session to unlock persistent chat, session-specific ideas, and post drafts.</div></div>";
    assistantPromptDeck.innerHTML = "";
    return;
  }

  const messages = session.messages.length
    ? session.messages
    : [
        {
          id: "starter",
          role: "assistant",
          meta: "AI copilot",
          text:
            "I can pressure-test ideas, compare angles, and draft the next post for " +
            session.name +
            ".",
          status: "ready",
          ideaId: session.sources.flatMap((source) => source.ideas).find((idea) => idea.pinned)?.id || null,
        },
      ];

  assistantThread.innerHTML = messages.map(messageMarkup).join("");
  assistantPromptDeck.innerHTML = assistantPromptList(ui).join("");
}

function renderEmptyIdeas(sessionName) {
  return (
    '<div class="inline-empty-state"><div class="icon">' +
    icons.filePdf +
    "</div><h4 style=\"margin-top: 14px; color: var(--ref-color-grey-150)\">No ideas extracted yet</h4><p>" +
    escapeHtml(sessionName) +
    " has this source attached, but there are no extracted ideas yet. Run another extraction pass or ask a focused question to deepen the output.</p></div>"
  );
}

function renderSourceCard(source, ui, sessionName) {
  const open = ui.openSourceIds.includes(source.id);
  const platformCopy = generationPlatformCopy(ui.generationPlatform);
  const ideasHtml =
    source.ideas.length === 0
      ? renderEmptyIdeas(sessionName)
      : source.ideas
          .map((idea) => {
            const selected = ui.selectedIdeaIds.includes(idea.id);
            const pendingAction = ui.pendingIdeaActions[idea.id] || "";
            return (
              '<article class="idea-item ' +
              (selected ? "selected" : "") +
              '"><div class="idea-top"><input class="checkbox" type="checkbox" data-idea-select="' +
              idea.id +
              '" ' +
              (selected ? "checked" : "") +
              ' /><div class="idea-main"><div class="idea-header"><div class="idea-meta-row">' +
              priorityPill(idea.priority) +
              '<span class="idea-confidence">' +
              icons.sparkles +
              " " +
              idea.confidence +
              "% confidence</span>" +
              (idea.pinned ? '<span class="pin-chip">' + icons.pin + "Pinned</span>" : "") +
              '</div><div class="idea-actions">' +
              actionButton({
                style: "secondary",
                color: "blue",
                label: pendingAction === "generate" ? "Generating..." : "Generate " + platformCopy.shortLabel,
                attrs: 'data-generate-post="' + idea.id + '"',
                loading: pendingAction === "generate",
                disabled: pendingAction === "generate",
              }) +
              overflowMenu({
                label: "Idea actions",
                items: [
                  '<button type="button" class="action-menu-item" data-open-idea="' + idea.id + '">Open details</button>',
                  '<button type="button" class="action-menu-item" data-ask-idea="' + idea.id + '">Ask about this idea</button>',
                  '<button type="button" class="action-menu-item" data-draft-idea="' + idea.id + '">Draft post</button>',
                  '<button type="button" class="action-menu-item" data-compare-idea="' + idea.id + '">' +
                    (pendingAction === "compare" ? "Comparing..." : "Compare") +
                    "</button>",
                  '<button type="button" class="action-menu-item" data-pin-idea="' + idea.id + '">' +
                    (idea.pinned ? "Unpin idea" : "Pin idea") +
                    "</button>",
                ],
              }) +
              '</div></div><button type="button" class="idea-content-button" data-open-idea="' +
              idea.id +
              '"><h4>' +
              escapeHtml(idea.title) +
              '</h4><p class="idea-summary">' +
              escapeHtml(idea.summary) +
              "</p></button></div></div></article>"
            );
          })
          .join("");

  const bodyHtml = open
    ? '<div class="source-body">' +
      (source.status === "processing"
        ? '<div class="state-banner processing"><div class="state-copy"><h4>Extraction still running</h4><p>New ideas will stream into this source as processing completes.</p></div>' +
          actionButton({ style: "stroked", color: "grey", label: "Refresh status" }) +
          "</div>"
        : "") +
      (source.status === "failed"
        ? '<div class="state-banner failed"><div class="state-copy"><h4>Extraction failed for this source</h4><p>Retry the extraction or remove the source without losing the rest of the session context.</p></div>' +
          actionButton({ style: "secondary", color: "orange", label: "Reprocess source" }) +
          "</div>"
        : "") +
      '<div class="idea-intro"><div><h4>Extracted ideas</h4><p>Select the strongest ideas, compare them, or draft a post without losing source context.</p></div><div class="idea-review-meta">' +
      icons.sparkles +
      " " +
      source.ideas.length +
      " ready to review</div></div><div class=\"idea-list\">" +
      ideasHtml +
      "</div></div>"
    : "";

  return (
    '<section class="source-card ' +
    (open ? "" : "collapsed") +
    '"><div class="source-header"><div class="source-left"><div class="source-icon">' +
    iconForType(source.type) +
    '</div><div class="source-copy"><div class="source-kicker">' +
    escapeHtml(source.type === "url" ? "URL source" : "PDF source") +
    '</div><div class="source-title-row"><div class="source-title">' +
    escapeHtml(source.name) +
    "</div>" +
    statusPill(source.status) +
    '</div><div class="source-meta-row"><span>Imported ' +
    escapeHtml(source.importedAt) +
    '</span><span class="source-meta-divider">·</span><span>' +
    source.ideas.length +
    ' extracted ideas</span><span class="source-meta-divider">·</span>' +
    strengthPill(source.strength) +
    '</div></div></div><div class="source-actions">' +
    actionButton({ style: "stroked", color: "blue", label: "Ask a question" }) +
    actionButton({ style: "primary", color: "orange", label: "Extract more" }) +
    iconButton({
      label: open ? "Collapse source" : "Expand source",
      icon: open ? icons.chevronUp : icons.chevronDown,
      attrs: 'data-toggle-source="' + source.id + '"',
      stroked: true,
    }) +
    "</div></div>" +
    bodyHtml +
    "</section>"
  );
}

function renderSelectionBar(ui) {
  if (!ui.selectedIdeaIds.length) return "";
  const platformCopy = generationPlatformCopy(ui.generationPlatform);
  return (
    '<div class="selection-bar visible"><div><h4>' +
    ui.selectedIdeaIds.length +
    ' ideas selected</h4><p class="lead" style="margin-top: 6px; max-width: none; font-size: 14px">Selection stays global for the session, so you can compare, chat, and generate drafts without losing your place.</p></div><div class="button-row">' +
    actionButton({
      style: "primary",
      color: "orange",
      label: "Generate " + platformCopy.shortLabel + " drafts",
      attrs: 'data-generate-selected="true"',
    }) +
    actionButton({
      style: "ghost",
      color: "grey",
      label: "Clear selection",
      attrs: 'data-clear-selection="true"',
    }) +
    "</div></div>"
  );
}

function renderLibraryView(session, ui) {
  const normalizedQuery = ui.query.trim().toLowerCase();
  const filteredSources = normalizedQuery
    ? session.sources
        .map((source) => {
          const sourceMatch = source.name.toLowerCase().includes(normalizedQuery);
          const ideas = source.ideas.filter(
            (idea) =>
              idea.title.toLowerCase().includes(normalizedQuery) ||
              idea.summary.toLowerCase().includes(normalizedQuery),
          );
          return sourceMatch ? source : { ...source, ideas };
        })
        .filter((source) => source.name.toLowerCase().includes(normalizedQuery) || source.ideas.length > 0)
    : session.sources;

  return (
    '<section class="tab-panel"><section class="library-overview"><div class="session-overview"><div class="session-overview__copy"><div class="library-overview__eyebrow">Session library</div><div class="library-overview__title">Library</div><div class="library-overview__description">Sources and extracted ideas for <strong>' +
    escapeHtml(session.name) +
    "</strong>. Switch sessions from the sidebar to swap the whole working context.</div></div><div class=\"library-overview__meta\"><span>" +
    session.sources.length +
    " sources</span> · <span>" +
    countIdeas(session) +
    " ideas</span> · <span>" +
    countPinnedIdeas(session) +
    " pinned</span></div></div></section>" +
    (session.sources.length
      ? '<div class="toolbar"><div class="toolbar-left"><label class="search"><span class="search-icon">' +
        icons.search +
        '</span><input type="text" id="searchInput" placeholder="Search sources, ideas, or extracted themes..." value="' +
        escapeHtml(ui.query) +
        '" /></label>' +
        renderPlatformSelector(ui) +
        "</div></div>"
      : "") +
    renderSelectionBar(ui) +
    '<section class="library-content">' +
    (session.sources.length === 0
      ? '<div class="session-empty"><div class="session-empty__hero"><div class="session-empty__icon">' +
        icons.upload +
        '</div><h3 style="color: var(--ref-color-grey-150)">No sources in ' +
        escapeHtml(session.name) +
        '</h3><p style="max-width: 620px; color: var(--ref-color-grey-80)">Upload a PDF, paste a URL, or drop in supporting material to start building the session library. Everything extracted here stays scoped to this session.</p>' +
        actionButton({ style: "primary", color: "orange", label: "Upload first source" }) +
        "</div></div>"
      : filteredSources.length === 0
        ? '<div class="empty-state"><div class="icon">' +
          icons.search +
          '</div><h3 style="margin-top: 18px; color: var(--ref-color-grey-150)">No matching sources or ideas</h3><p>Try another keyword or clear the search to view the full library for this session.</p></div>'
        : '<div class="sources">' + filteredSources.map((source) => renderSourceCard(source, ui, session.name)).join("") + "</div>") +
    "</section></section>"
  );
}

function getPostById(session, postId) {
  return session.posts.find((post) => post.id === postId) || null;
}

function postStatusPill(post) {
  if (post.status === "generating") {
    return '<span class="ap-status blue"><span class="dot"></span>Generating</span>';
  }
  if (post.status === "error") {
    return '<span class="ap-status red"><span class="dot"></span>Error</span>';
  }
  return '<span class="ap-status green"><span class="dot"></span>Draft ready</span>';
}

function postWorkflowPill(post) {
  if (post.workflowState === "scheduled") {
    return '<span class="ap-status orange"><span class="dot"></span>Scheduled</span>';
  }
  if (post.workflowState === "prepared") {
    return '<span class="ap-status blue"><span class="dot"></span>Prepared</span>';
  }
  return "";
}

function variantLabel(post) {
  return (
    {
      "proof-led": "Proof-led",
      "operator-note": "Operator note",
      "series-angle": "Series angle",
      "contrarian-hook": "Contrarian hook",
    }[post.variant] || "Variant"
  );
}

function compactPostText(text, maxLength = 220) {
  return truncateWithSeeMore((text || "").replace(/\s+/g, " ").trim(), maxLength).text;
}

function selectedPostsSummary(session, ui) {
  const selectedIds = ui.selectedPostIds || [];
  const selectedPosts = session.posts.filter((post) => selectedIds.includes(post.id));
  const invalidPosts = selectedPosts.filter((post) => validatePostDraft(post).length > 0);

  return {
    selectedPosts,
    invalidPosts,
    hasSelection: selectedPosts.length > 0,
    hasInvalidSelection: invalidPosts.length > 0,
  };
}

function formatPostUpdatedLabel(post) {
  const stamp = post.updatedAt || post.createdAt;
  if (!stamp) return "Just updated";
  const formatter = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  });
  return "Updated " + formatter.format(new Date(stamp));
}

function formatPostMeta(post) {
  const platform = generationPlatformCopy(post.platform || "linkedin").label;
  const meta = [platform, variantLabel(post), formatPostUpdatedLabel(post)];
  if (post.workflowState === "scheduled" && post.scheduledForLabel) {
    meta.push(post.scheduledForLabel);
  }
  return meta;
}

function firstInvalidPostId(session) {
  return session.posts.find((post) => validatePostDraft(post).length > 0)?.id || null;
}

function invalidPostsCount(session) {
  return session.posts.filter((post) => validatePostDraft(post).length > 0).length;
}

function matchesPostsSearch(post, group, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  const haystack = [
    post.content?.text || "",
    post.content?.cta || "",
    post.author?.name || "",
    group.idea?.title || "",
    group.idea?.summary || "",
    group.source?.name || "",
    variantLabel(post),
    generationPlatformCopy(post.platform || "linkedin").label,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(normalized);
}

function matchesPostsStatus(post, filter) {
  if (filter === "all") return true;
  if (filter === "needs_fixes") return validatePostDraft(post).length > 0;
  if (filter === "ready") return post.status === "ready" && post.workflowState === "draft" && validatePostDraft(post).length === 0;
  if (filter === "prepared") return post.workflowState === "prepared";
  if (filter === "scheduled") return post.workflowState === "scheduled";
  if (filter === "best") return !!post.aiSuggested;
  return true;
}

function sortPosts(posts, sortValue) {
  return [...posts].sort((left, right) => {
    if (sortValue === "oldest") {
      return (left.updatedAt || left.createdAt || 0) - (right.updatedAt || right.createdAt || 0);
    }
    if (sortValue === "best") {
      if (!!right.aiSuggested !== !!left.aiSuggested) return Number(right.aiSuggested) - Number(left.aiSuggested);
      return (right.updatedAt || right.createdAt || 0) - (left.updatedAt || left.createdAt || 0);
    }
    if (sortValue === "platform") {
      return String(left.platform || "").localeCompare(String(right.platform || ""));
    }
    if (sortValue === "needs_fixes") {
      const leftIssues = validatePostDraft(left).length;
      const rightIssues = validatePostDraft(right).length;
      if (!!rightIssues !== !!leftIssues) return Number(Boolean(rightIssues)) - Number(Boolean(leftIssues));
      return (right.updatedAt || right.createdAt || 0) - (left.updatedAt || left.createdAt || 0);
    }
    return (right.updatedAt || right.createdAt || 0) - (left.updatedAt || left.createdAt || 0);
  });
}

function groupPostsByIdea(session, ui) {
  const order = [];
  const groups = new Map();

  session.posts.forEach((post) => {
    const match = post.ideaId ? getIdeaById(post.ideaId) : null;
    const groupId = post.ideaId || "ungrouped";

    if (!groups.has(groupId)) {
      order.push(groupId);
      groups.set(groupId, {
        id: groupId,
        idea: match?.idea || null,
        source: match?.source || null,
        posts: [],
      });
    }

    groups.get(groupId).posts.push(post);
  });

  return order.map((groupId) => {
    const group = groups.get(groupId);
    group.posts = group.posts.filter((post) => {
      const statusMatch = matchesPostsStatus(post, ui.postsStatusFilter);
      const searchMatch = matchesPostsSearch(post, group, ui.postsSearch || "");
      const networkMatch = !ui.postsNetworkFilter || ui.postsNetworkFilter === "all" || post.platform === ui.postsNetworkFilter;
      return statusMatch && searchMatch && networkMatch;
    });
    group.posts = sortPosts(group.posts, ui.postsSort || "needs_fixes");
    return group;
  }).filter((group) => group.posts.length > 0);
}

function buildPostsRailItems(session) {
  const posts = session.posts;
  return {
    views: [
      { id: "all-posts",       label: "All posts",   icon: "megaphone", count: posts.length, kind: "all" },
      { id: "needs-fixes",     label: "Needs fixes", icon: "error",     count: posts.filter((post) => validatePostDraft(post).length > 0).length, kind: "status", value: "needs_fixes" },
      { id: "scheduled-posts", label: "Scheduled",   icon: "calendar",  count: posts.filter((post) => post.workflowState === "scheduled").length, kind: "status", value: "scheduled" },
    ],
    networks: [
      { id: "network-all", label: "All", count: posts.length, kind: "network", value: "all" },
      { id: "network-linkedin", label: "LinkedIn", count: posts.filter((post) => post.platform === "linkedin").length, kind: "network", value: "linkedin" },
      { id: "network-twitter", label: "X", count: posts.filter((post) => post.platform === "twitter").length, kind: "network", value: "twitter" },
    ],
  };
}

function filterChips(ui) {
  const chips = [];
  if (ui.postsNetworkFilter !== "all") chips.push(generationPlatformCopy(ui.postsNetworkFilter).label);
  if (ui.postsStatusFilter !== "all") {
    chips.push(
      {
        needs_fixes: "Needs fixes",
        ready: "Ready",
        prepared: "Prepared",
        scheduled: "Scheduled",
      }[ui.postsStatusFilter] || ui.postsStatusFilter,
    );
  }
  if (ui.postsShowSelectedOnly) chips.push("Selected only");
  if ((ui.postsSearch || "").trim()) chips.push('Search: "' + ui.postsSearch.trim() + '"');
  return chips;
}

function postsWorkspaceViewLabel(ui) {
  const parts = [ui.postsNetworkFilter === "all" ? "All networks" : generationPlatformCopy(ui.postsNetworkFilter).shortLabel];
  if (ui.postsStatusFilter !== "all") {
    parts.push(
      {
        needs_fixes: "Needs fixes",
        ready: "Ready",
        prepared: "Prepared",
        scheduled: "Scheduled",
      }[ui.postsStatusFilter] || ui.postsStatusFilter,
    );
  }
  if (ui.postsShowSelectedOnly) parts.push("Selected only");
  return parts.join(" · ");
}

function renderDraftCard(post, ui, isBestDraft) {
  const preview = post.platform === "twitter" ? TwitterPostPreview(post) : LinkedInPostPreview(post);
  const selected = (ui.selectedPostIds || []).includes(post.id);
  const issues = validatePostDraft(post);
  const hasIssues = issues.length > 0;
  const canSchedule = !hasIssues && post.status === "ready";
  const statusLabel = hasIssues ? "Needs fixes" : post.workflowState === "scheduled" ? "Scheduled" : "Ready";
  const meta = formatPostMeta(post);
  const issuesBanner = issues.length
    ? '<div class="ap-infobox error has-title">' +
      icons.error +
      '<div class="ap-infobox-content"><div class="ap-infobox-texts">' +
      '<span class="ap-infobox-title">Needs fixes before scheduling</span>' +
      '<span class="ap-infobox-message">' +
      issues.map((issue) => escapeHtml(issue)).join(" · ") +
      "</span></div></div></div>"
    : "";

  return (
    '<article class="post-review-item ' +
    (selected ? "selected " : "") +
    (post.status === "generating" ? "is-generating " : "") +
    (hasIssues ? "has-errors " : "") +
    '" id="post-review-' +
    post.id +
    '">' +
    '<label class="post-review-item__check"><input type="checkbox" class="checkbox" data-post-select="' +
    post.id +
    '" ' +
    (selected ? "checked" : "") +
    ' /><span class="sr-only">Select post</span></label>' +
    '<div class="post-review-card"><div class="post-review-card__body"><div class="post-review-card__preview-stack">' +
    issuesBanner +
    '<div class="post-review-card__preview">' +
    preview +
    "</div></div><div class=\"post-review-card__floating-actions\">" +
    iconButton({
      label: "Edit post",
      icon: icons.pencil,
      attrs: 'data-edit-post="' + post.id + '"',
      stroked: true,
    }) +
    iconButton({
      label: "Generate image",
      icon: icons.sparkles,
      attrs: 'data-generate-image-btn="' + post.id + '"',
      stroked: true,
    }) +
    iconButton({
      label: canSchedule ? "Schedule post" : "Post needs fixes before scheduling",
      icon: icons.calendar,
      attrs: 'data-schedule-post="' + post.id + '"',
      stroked: true,
      disabled: !canSchedule,
    }) +
    iconButton({
      label: "Duplicate post",
      icon: icons.copy,
      attrs: 'data-duplicate-post="' + post.id + '"',
      stroked: true,
    }) +
    iconButton({
      label: "Delete post",
      icon: icons.trash,
      attrs: 'data-delete-post="' + post.id + '"',
      stroked: true,
      color: "red",
    }) +
    "</div></div>" +
    "</div></article>"
  );
}

function renderIdeaPostGroup(group, ui) {
  const bestDraftId = group.posts.find((post) => post.aiSuggested)?.id || group.posts[0]?.id || null;
  const invalidCount = group.posts.filter((post) => validatePostDraft(post).length > 0).length;
  const isCollapsed = (ui.postsCollapsedGroupIds || []).includes(group.id);

  return (
    '<section class="idea-post-group" id="posts-group-' +
    group.id +
    '"><div class="idea-post-group__header"><div class="idea-post-group__copy"><h3>' +
    escapeHtml(group.idea?.title || "Generated drafts") +
    '</h3>' +
    (group.source?.name ? '<div class="idea-post-group__source">' + escapeHtml(group.source.name) + '</div>' : '') +
    '</div><div class="idea-post-group__meta"><span>' +
    group.posts.length +
    " posts</span>" +
    (invalidCount ? '<span class="idea-post-group__meta-divider">•</span><span>' + invalidCount + " need fixes</span>" : "") +
    "</div>" +
    iconButton({
      label: isCollapsed ? "Expand group" : "Collapse group",
      icon: isCollapsed ? icons.chevronDown : icons.chevronUp,
      attrs: 'data-toggle-posts-group="' + group.id + '"',
    }) +
    "</div>" +
    (isCollapsed ? "" :
    '<div class="idea-post-group__rows">' +
    group.posts.map((post) => renderDraftCard(post, ui, post.id === bestDraftId)).join("") +
    "</div>") +
    "</section>"
  );
}

function renderPostsRail(session, ui) {
  const railItems = buildPostsRailItems(session);
  const activeView = ui.postsActiveRailView;

  const renderItem = (item) =>
    '<button type="button" class="posts-rail__item' +
    (activeView === item.id ? " active" : "") +
    '" data-posts-rail-item="' + item.id +
    '" data-posts-rail-kind="' + item.kind +
    '" data-posts-rail-value="' + (item.value || "") + '">' +
    (item.icon ? '<i class="ap-icon-' + item.icon + ' posts-rail__item-icon" aria-hidden="true"></i>' : '') +
    '<span class="posts-rail__item-label">' + escapeHtml(item.label) + "</span>" +
    '<span class="posts-rail__item-count">' + item.count + "</span>" +
    "</button>";

  return (
    '<nav class="posts-rail">' +
    '<div class="posts-rail__group">' +
    railItems.views.map(renderItem).join("") +
    "</div>" +
    '<div class="posts-rail__divider"></div>' +
    '<div class="posts-rail__section-label">Network</div>' +
    '<div class="posts-rail__group">' +
    railItems.networks.map(renderItem).join("") +
    "</div>" +
    "</nav>"
  );
}

function renderPostsErrorSummary(session) {
  const count = invalidPostsCount(session);
  const firstInvalidId = firstInvalidPostId(session);
  if (!count || !firstInvalidId) return "";

  return (
    '<div class="ap-infobox error has-title posts-error-summary">' +
    "<i aria-hidden=\"true\">" + icons.error + "</i>" +
    '<div class="ap-infobox-content">' +
    '<div class="ap-infobox-texts">' +
    '<span class="ap-infobox-title">' +
    count + " post" + (count > 1 ? "s" : "") + " need fixes" +
    '</span>' +
    '<span class="ap-infobox-message">Fix validation issues before scheduling.</span>' +
    '</div>' +
    actionButton({
      style: "stroked",
      color: "grey",
      label: "Jump to errors",
      attrs: 'data-jump-to-errors="' + firstInvalidId + '"',
    }) +
    "</div></div>"
  );
}

function renderPostsSelectionBar(session, ui) {
  const summary = selectedPostsSummary(session, ui);
  const count = summary.selectedPosts.length;
  if (!summary.hasSelection) return "";

  const allSelected = count === session.posts.length;
  const indeterminate = count > 0 && !allSelected;
  const disableSchedule = summary.hasInvalidSelection;

  return (
    '<div class="posts-toolbar">' +
    // Left — select-all checkbox + count
    '<label class="posts-toolbar__select-all">' +
    '<input type="checkbox" class="posts-toolbar__checkbox" data-select-all-posts' +
    (allSelected ? ' checked' : '') +
    (indeterminate ? ' data-indeterminate' : '') +
    ' aria-label="Select all posts" />' +
    '</label>' +
    '<span class="posts-toolbar__count">' + count + ' post' + (count > 1 ? 's' : '') + ' selected</span>' +
    '<div class="posts-toolbar__spacer"></div>' +
    // Right — actions
    actionButton({
      style: "primary",
      color: "orange",
      label: "Schedule",
      attrs: 'data-schedule-selected-posts="true"',
      disabled: disableSchedule,
    }) +
    '<button type="button" class="ap-icon-button red" data-delete-selected-posts="true" aria-label="Delete selected posts" title="Delete selected">' +
    '<i class="ap-icon-trash"></i>' +
    '</button>' +
    '<button type="button" class="ap-icon-button" data-clear-post-selection="true" aria-label="Clear selection" title="Clear selection">' +
    '<i class="ap-icon-close"></i>' +
    '</button>' +
    '</div>'
  );
}

function renderPostsView(session, ui) {
  if (!session.posts.length) {
    return (
      '<section class="tab-panel"><section class="step-layout"><div class="posts-review-header"><div class="posts-review-header__copy"><h1>Review posts before scheduling</h1><p>Fix issues and schedule your posts</p></div></div><div class="empty-state"><div class="icon">' +
      icons.megaphone +
      '</div><h3 style="margin-top: 18px; color: var(--ref-color-grey-150)">No posts to review yet</h3><p>Generate posts from Library, then come back here to fix issues and schedule them fast.</p>' +
      actionButton({
        style: "primary",
        color: "orange",
        label: "Open Library",
        attrs: 'data-open-library-posts-empty="true"',
      }) +
      "</div></section></section>"
    );
  }

  const ideaGroups = groupPostsByIdea(session, ui);
  return (
    '<section class="tab-panel">' +
    '<div class="posts-layout">' +
    renderPostsRail(session, ui) +
    '<div class="posts-content"><section class="step-layout">' +
    '<div class="posts-review-header"><div class="posts-review-header__copy"><h1>Review posts before scheduling</h1><p>Fix issues and schedule your posts</p></div><div class="posts-review-header__meta"><span>' +
    session.posts.length +
    " posts</span></div></div>" +
    renderPostsErrorSummary(session) +
    '<div class="posts-main">' +
    renderPostsSelectionBar(session, ui) +
    '<div class="posts-workflow">' +
    ideaGroups.map((group) => renderIdeaPostGroup(group, ui)).join("") +
    (ideaGroups.length === 0
      ? '<div class="empty-state"><div class="icon">' +
        icons.megaphone +
        '</div><h3 style="margin-top: 18px; color: var(--ref-color-grey-150)">No posts available in this view</h3><p>Clear any active filters or generate a fresh draft from Library.</p></div>'
      : "") +
    "</div></div></section></div>" +
    "</div>" +
    "</section>"
  );
}

function renderStepPlaceholder(tab, session, ui) {
  if (tab === "posts") return renderPostsView(session, ui);
  if (tab === "voice") {
    return renderContextDocumentView({
      title: "Voice",
      description: "Set tone, author perspective, and writing constraints for this session.",
      document: session.voiceProfile,
      nextAction: "Use these rules as the default style guide for new drafts.",
      metaLabel: "Mocked examples are preloaded here so the session starts with a voice direction.",
    });
  }
  if (tab === "brand") {
    return renderContextDocumentView({
      title: "Brand Theme",
      description: "Anchor the session with brand messages, proof points, and visual direction.",
      document: session.brandTheme,
      nextAction: "Use these anchors to keep generated posts aligned with the campaign angle.",
      metaLabel: "Mocked examples are preloaded here so the session starts with brand guidance.",
    });
  }

  const copy =
    {
      voice: {
        title: "Voice",
        description: "Set tone, author perspective, and writing constraints for this session.",
        nextAction: "Define session voice",
      },
      brand: {
        title: "Brand Theme",
        description: "Anchor the session with brand messages, proof points, and visual direction.",
        nextAction: "Set brand anchors",
      },
    }[tab] || {
      title: "Workflow",
      description: "This panel is scoped to the active session.",
      nextAction: "Continue session workflow",
    };

  return (
    '<section class="tab-panel"><section class="step-layout"><div class="step-hero"><div class="step-hero__top"><div class="step-hero__copy"><div class="step-hero__eyebrow">Session step</div><div class="step-hero__title">' +
    escapeHtml(copy.title) +
    '</div><div class="step-hero__description">' +
    escapeHtml(copy.description) +
    " Everything here belongs to <strong>" +
    escapeHtml(session.name) +
    '</strong>.</div></div><div class="step-hero__meta"><span>' +
    session.sources.length +
    " sources available</span> · <span>" +
    countIdeas(session) +
    ' reusable ideas</span></div></div><div class="step-card"><h4>Next move</h4><p>' +
    escapeHtml(copy.nextAction) +
    "</p></div></div></section></section>"
  );
}

function renderWorkspace(state, session, ui) {
  if (!session) {
    workspaceContent.innerHTML =
      '<section class="session-empty"><div class="session-empty__hero"><div class="session-empty__icon">' +
      icons.library +
      '</div><h2 style="color: var(--ref-color-grey-150)">Create a work session to start a content sprint</h2><p style="max-width: 700px; color: var(--ref-color-grey-80)">A work session is the root context for your Library, chat, and Posts. Create a fresh one to begin.</p>' +
      actionButton({
        style: "primary",
        color: "orange",
        label: "Create a new session",
        attrs: 'data-open-create-session="true"',
      }) +
      "</div></section>";
    return;
  }

  workspaceContent.innerHTML =
    state.currentTab === "library"
      ? renderLibraryView(session, ui)
      : state.currentTab === "brief"
        ? renderStrategyBriefView(session, ui)
        : renderStepPlaceholder(state.currentTab, session, ui);

  // Apply indeterminate state on select-all checkbox (can't be set via HTML attribute)
  const selectAllCb = workspaceContent.querySelector("[data-select-all-posts][data-indeterminate]");
  if (selectAllCb) selectAllCb.indeterminate = true;
}

function renderDrawer(state, session) {
  const match = state.activeIdeaId ? getIdeaById(state.activeIdeaId, state) : null;
  const ui = session ? getSessionUi(session.id, state) : null;
  const open = !!match;

  drawer.classList.toggle("open", open);
  drawerBackdrop.classList.toggle("open", open);
  drawer.setAttribute("aria-hidden", open ? "false" : "true");

  if (!match || !session || !ui) return;

  const pendingAction = ui.pendingIdeaActions[match.idea.id];
  drawerPriority.className =
    match.idea.priority === "high"
      ? "ap-status orange"
      : match.idea.priority === "medium"
        ? "ap-status blue"
        : "ap-status grey";
  drawerPriority.innerHTML =
    match.idea.priority === "high"
      ? '<span class="dot"></span>High relevance'
      : match.idea.priority === "medium"
        ? '<span class="dot"></span>Medium relevance'
        : '<span class="dot"></span>Low relevance';
  drawerTitle.textContent = match.idea.title;
  drawerDescription.textContent =
    match.idea.priority === "high"
      ? "Ready to shape the next draft or brief direction."
      : match.idea.priority === "medium"
        ? "Worth refining before it drives the next content step."
        : "Better used as supporting context unless the angle is sharpened.";
  drawerSummary.textContent = match.idea.summary;
  drawerMeta.innerHTML =
    "<span>" +
    escapeHtml(match.source.name) +
    '</span><span class="source-meta-divider">·</span><span>' +
    escapeHtml(session.name) +
    "</span>";
  drawerConfidence.textContent = match.idea.confidence + "%";
  drawerSourceStatus.textContent =
    match.source.status === "processing"
      ? "Processing"
      : match.source.status === "failed"
        ? "Failed"
        : "Processed";
  drawerPinnedState.textContent = match.idea.pinned ? "Pinned" : "Not pinned";
  drawerWhyItWorks.textContent =
    match.idea.priority === "high"
      ? "This signal is specific enough to support a concrete angle and move quickly into drafting."
      : match.idea.priority === "medium"
        ? "There is a useful direction here, but it still needs a sharper hook or stronger proof before it leads the narrative."
        : "This idea is stronger as supporting context unless it is reframed into a sharper, more defensible angle.";
  drawerSessionNote.textContent =
    "This idea stays inside " +
    session.name +
    ", so downstream brief, voice, and post decisions keep the same working context.";

  drawerGeneratePost.dataset.ideaId = match.idea.id;
  drawerAskQuestion.dataset.ideaId = match.idea.id;
  drawerMoveToBrief.dataset.ideaId = match.idea.id;
  drawerGeneratePost.textContent =
    pendingAction === "generate" ? "Generating..." : "Generate " + generationPlatformCopy(ui.generationPlatform).shortLabel;
  drawerGeneratePost.disabled = pendingAction === "generate";
}

let bugSelectedCategory = null;
let bugScreenshotDataUrl = null;

const bugCategoryLabels = {
  visual: "Visual glitch",
  behavior: "Wrong behavior",
  broken: "Feature not working",
  performance: "Performance",
  other: "Other",
};

function resetBugReportForm() {
  bugReportModal.classList.remove("success");
  bugSelectedCategory = null;
  bugCategories.querySelectorAll(".bug-category-chip").forEach((c) => c.classList.remove("selected"));
  bugActionInput.value = "";
  bugProblemInput.value = "";
  bugProblemInput.classList.remove("invalid");
  bugScreenshotDataUrl = null;
  bugPreviewImg.src = "";
  bugFileName.textContent = "";
  bugScreenshotPreview.style.display = "none";
  bugDropzoneFallback.style.display = "";
  bugAutoBadge.style.display = "none";
  bugCapturingBadge.style.display = "none";
  bugFileInput.value = "";
  bugContextBar.innerHTML = "";
  submitBugReportBtn.disabled = false;
  submitBugReportBtn.textContent = "Submit Bug Report";
}

function renderBugReportModal(state) {
  const open = state.bugReportModal.open;
  bugReportBackdrop.classList.toggle("open", open);
  bugReportModal.classList.toggle("open", open);
  bugReportModal.setAttribute("aria-hidden", open ? "false" : "true");
  if (!open) resetBugReportForm();
}

function resetFeedbackForm() {
  feedbackModal.classList.remove("success");
  feedbackText.value = "";
  feedbackText.classList.remove("invalid");
  feedbackFeatureArea.value = "content-studio";
  submitFeedbackBtn.disabled = false;
  submitFeedbackBtn.textContent = "Send feedback";
}

function renderFeedbackModal(state) {
  const open = state.feedbackModal.open;
  feedbackBackdrop.classList.toggle("open", open);
  feedbackModal.classList.toggle("open", open);
  feedbackModal.setAttribute("aria-hidden", open ? "false" : "true");
  if (!open) resetFeedbackForm();
}

function focusWithoutScroll(element) {
  if (!element) return;
  try {
    element.focus({ preventScroll: true });
  } catch {
    element.focus();
  }
}

function setBugScreenshot(dataUrl) {
  bugScreenshotDataUrl = dataUrl;
  bugPreviewImg.src = dataUrl;
  bugFileName.textContent = "Page screenshot";
  bugScreenshotPreview.style.display = "";
  bugDropzoneFallback.style.display = "none";
  bugCapturingBadge.style.display = "none";
  bugAutoBadge.style.display = "";
}

function clearBugScreenshot() {
  bugScreenshotDataUrl = null;
  bugPreviewImg.src = "";
  bugFileName.textContent = "";
  bugScreenshotPreview.style.display = "none";
  bugDropzoneFallback.style.display = "";
  bugAutoBadge.style.display = "none";
  bugCapturingBadge.style.display = "none";
  bugFileInput.value = "";
}

async function loadHtml2Canvas() {
  if (window.html2canvas) return window.html2canvas;
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    s.onload = () => resolve(window.html2canvas);
    s.onerror = () => reject(new Error("html2canvas unavailable"));
    document.head.appendChild(s);
  });
}

async function capturePageScreenshot() {
  try {
    const h2c = await loadHtml2Canvas();
    const canvas = await h2c(document.documentElement, {
      scale: 0.55,
      useCORS: true,
      logging: false,
      ignoreElements: (el) =>
        el.id === "bugReportModal" || el.id === "bugReportBackdrop",
    });
    return canvas.toDataURL("image/jpeg", 0.8);
  } catch {
    return null;
  }
}

function populateBugContext() {
  const state = store.getState();
  const tabLabels = { library: "Library", brief: "Brief", voice: "Voice", brand: "Brand Theme", posts: "Posts" };
  const session = getActiveSession(state);
  const tab = tabLabels[state.currentTab] || state.currentTab;
  const sessionName = session?.name || "—";
  const time = new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  bugContextBar.innerHTML =
    '<span class="bug-context__label">Context</span>' +
    '<span class="bug-context__pill">' + escapeHtml(tab) + "</span>" +
    '<span class="bug-context__pill">' + escapeHtml(sessionName) + "</span>" +
    '<span class="bug-context__pill">' + escapeHtml(time) + "</span>";
}

function buildShortcutDescription(category, action, problem) {
  const state = store.getState();
  const session = getActiveSession(state);
  const tabLabels = { library: "Library", brief: "Brief", voice: "Voice", brand: "Brand Theme", posts: "Posts" };
  let desc = "";
  if (category) desc += "**Category:** " + (bugCategoryLabels[category] || category) + "\n\n";
  if (action) desc += "**What I was trying to do:** " + action + "\n\n";
  desc += "**What went wrong:** " + problem + "\n\n";
  desc += "---\n**Context**\n";
  desc += "- Tab: " + (tabLabels[state.currentTab] || state.currentTab) + "\n";
  desc += "- Session: " + (session?.name || "—") + "\n";
  desc += "- Time: " + new Date().toISOString();
  return desc;
}

function mockShortcutSubmit() {
  // TODO: replace with real Shortcut API calls:
  //   1. POST /api/v3/files  — upload screenshot blob, get { id }
  //   2. POST /api/v3/stories { name, description, story_type: "bug", file_ids: [id] }
  return new Promise((resolve) => setTimeout(resolve, 1400));
}

function renderSessionModal(state) {
  const open = state.sessionModal.open;
  sessionModalBackdrop.classList.toggle("open", open);
  sessionModal.classList.toggle("open", open);
  sessionModalBackdrop.style.display = open ? "block" : "none";
  sessionModal.style.display = open ? "flex" : "none";
  sessionModal.setAttribute("aria-hidden", open ? "false" : "true");

  if (!open) {
    lastModalSignature = "";
    return;
  }

  const signature = state.sessionModal.mode + ":" + (state.sessionModal.editingSessionId || "");
  const session =
    state.sessionModal.editingSessionId
      ? state.sessions.find((item) => item.id === state.sessionModal.editingSessionId)
      : null;

  sessionModalTitle.textContent =
    state.sessionModal.mode === "rename" ? "Rename session" : "Create a new session";
  saveSessionModal.textContent =
    state.sessionModal.mode === "rename" ? "Save changes" : "Save session";

  if (signature !== lastModalSignature) {
    sessionNameInput.value = session ? session.name : "";
    window.setTimeout(() => focusWithoutScroll(sessionNameInput), 0);
    lastModalSignature = signature;
  }
}

function renderApp() {
  const state = store.getState();
  const session = getActiveSession(state);
  const ui = session ? getSessionUi(session.id, state) : null;

  renderWorkflowTabs(state.currentTab);
  renderSessionBar(state, session);
  renderSidebar(state, session, ui);
  renderWorkspace(state, session, ui);
  renderDrawer(state, session);
  renderSessionModal(state);
  renderBugReportModal(state);
  renderFeedbackModal(state);
}

workflowTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-tab]");
  if (!button) return;
  store.getState().setCurrentTab(button.dataset.tab);
});

sessionSwitcher.addEventListener("click", (event) => {
  if (event.target.closest("summary")) {
    store.getState().toggleSessionSwitcher();
  }

  const switchButton = event.target.closest("[data-switch-session]");
  if (switchButton) {
    store.getState().switchSession(switchButton.dataset.switchSession);
    return;
  }

  if (event.target.closest("[data-open-create-session]")) {
    store.getState().openSessionModal("create");
    return;
  }

  const sessionAction = event.target.closest("[data-session-action]");
  if (sessionAction) {
    store.getState().handleSessionAction(
      sessionAction.dataset.sessionAction,
      sessionAction.dataset.sessionId,
    );
  }
});

sessionSwitcher.addEventListener("input", (event) => {
  if (event.target.id === "sessionSearchInput") {
    store.getState().setSessionSearch(event.target.value);
  }
});

assistantPanel.addEventListener("click", (event) => {
  const noticeToggle = event.target.closest(".ai-notice__toggle");
  if (noticeToggle) {
    const notice = noticeToggle.closest(".ai-notice");
    const isOpen = notice.classList.toggle("open");
    noticeToggle.setAttribute("aria-expanded", isOpen);
    return;
  }

  const sourceKind = event.target.closest("[data-source-kind]");
  if (sourceKind) {
    store.getState().setAssistantMode(sourceKind.dataset.sourceKind);
    return;
  }

  const promptButton = event.target.closest("[data-assistant-prompt]");
  if (promptButton) {
    store.getState().setAssistantDraft(promptButton.dataset.assistantPrompt);
    assistantInput.focus();
    return;
  }

  if (event.target.closest("#assistantAttach")) {
    const state = store.getState();
    const session = getActiveSession(state);
    const ui = session ? getSessionUi(session.id, state) : null;
    if (session && ui) {
      store
        .getState()
        .addSystemMessage(assistantModeCopy(ui.assistantMode).dropTitle + ". New source inputs stay attached to this session.", "Source intake");
    }
    return;
  }

  if (event.target.closest("#assistantSend")) {
    store.getState().sendChatMessage();
    return;
  }

  const pinAction = event.target.closest("[data-assistant-pin]");
  if (pinAction) {
    store.getState().toggleIdeaPin(pinAction.dataset.assistantPin);
    return;
  }

  const compareAction = event.target.closest("[data-assistant-compare]");
  if (compareAction) {
    store.getState().compareIdea(compareAction.dataset.assistantCompare);
    return;
  }

  const draftAction = event.target.closest("[data-assistant-draft]");
  if (draftAction) {
    store.getState().generatePostForIdea(draftAction.dataset.assistantDraft);
  }
});

assistantInput.addEventListener("input", (event) => {
  store.getState().setAssistantDraft(event.target.value);
});

assistantInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    store.getState().sendChatMessage();
  }
});

workspaceContent.addEventListener("input", (event) => {
  if (event.target.id === "searchInput") {
    store.getState().setSessionQuery(event.target.value);
    return;
  }

  if (event.target.id === "postsSearchInput") {
    store.getState().setPostsSearch(event.target.value);
    return;
  }

  if (event.target.matches("[data-brief-field]")) {
    store.getState().updateBriefComposer(event.target.dataset.briefField, event.target.value);
    window.clearTimeout(briefAutoSaveTimer);
    briefAutoSaveTimer = window.setTimeout(() => {
      store.getState().commitBriefComposer();
    }, 450);
  }
});

workspaceContent.addEventListener("keydown", (event) => {
  if (!event.target.matches("[data-brief-field]")) return;

  const isTextarea = event.target.tagName === "TEXTAREA";

  if (event.key === "Enter" && (!isTextarea || event.metaKey || event.ctrlKey)) {
    event.preventDefault();
    window.clearTimeout(briefAutoSaveTimer);
    store.getState().commitBriefComposer();
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    window.clearTimeout(briefAutoSaveTimer);
    store.getState().cancelBriefComposer();
  }
});

workspaceContent.addEventListener("focusout", (event) => {
  if (!event.target.matches("[data-brief-field]")) return;

  const editor = event.target.closest("[data-brief-editor]");
  if (!editor) return;
  if (event.relatedTarget && editor.contains(event.relatedTarget)) return;

  window.setTimeout(() => {
    if (!document.activeElement || !editor.contains(document.activeElement)) {
      window.clearTimeout(briefAutoSaveTimer);
      store.getState().commitBriefComposer();
    }
  }, 0);
});

workspaceContent.addEventListener("change", (event) => {
  if (event.target.matches("[data-brief-field]")) {
    store.getState().updateBriefComposer(event.target.dataset.briefField, event.target.value);
    window.clearTimeout(briefAutoSaveTimer);
    briefAutoSaveTimer = window.setTimeout(() => {
      store.getState().commitBriefComposer();
    }, 150);
    return;
  }

  if (event.target.id === "postsStatusFilterSelect") {
    store.getState().setPostsStatusFilter(event.target.value);
    return;
  }

  if (event.target.id === "postsSortSelect") {
    store.getState().setPostsSort(event.target.value);
    return;
  }

  const checkbox = event.target.closest("[data-idea-select]");
  if (checkbox) {
    store.getState().toggleIdeaSelection(checkbox.dataset.ideaSelect, checkbox.checked);
    return;
  }

  const postCheckbox = event.target.closest("[data-post-select]");
  if (postCheckbox) {
    store.getState().togglePostSelection(postCheckbox.dataset.postSelect, postCheckbox.checked);
  }
});

workspaceContent.addEventListener("click", (event) => {
  // Generate image — placeholder zone or toolbar button
  const genImgZone = event.target.closest("[data-open-generate-image]");
  const genImgBtn  = event.target.closest("[data-generate-image-btn]");
  const genPostId  = (genImgZone || genImgBtn)?.dataset.openGenerateImage
                  || (genImgBtn?.dataset.generateImageBtn);
  if (genPostId) {
    openGenerateImageModal(genPostId, (imageUrl) => {
      store.getState().setPostImage(genPostId, imageUrl);
    });
    return;
  }

  if (event.target.closest("[data-clear-post-filters]")) {
    store.getState().resetPostsWorkspaceFilters();
    return;
  }

  const platformToggle = event.target.closest("[data-generation-platform]");
  if (platformToggle) {
    store.getState().setGenerationPlatform(platformToggle.dataset.generationPlatform);
    return;
  }

  const switchSession = event.target.closest("[data-switch-session]");
  if (switchSession) {
    store.getState().switchSession(switchSession.dataset.switchSession);
    return;
  }

  if (event.target.closest("[data-open-create-session]")) {
    store.getState().openSessionModal("create");
    return;
  }

  const clearSelection = event.target.closest("[data-clear-selection]");
  if (clearSelection) {
    store.getState().clearSelectedIdeas();
    return;
  }

  if (event.target.closest("[data-clear-post-selection]")) {
    store.getState().clearSelectedPosts();
    return;
  }

  const selectAllBtn = event.target.closest("[data-select-all-posts]");
  if (selectAllBtn) {
    const { selectedPostIds } = store.getState().uiBySession[store.getState().activeSessionId] || {};
    const session = getActiveSession(store.getState());
    if (session && selectedPostIds && selectedPostIds.length === session.posts.length) {
      store.getState().clearSelectedPosts();
    } else {
      store.getState().selectAllPosts();
    }
    return;
  }

  if (event.target.closest("[data-delete-selected-posts]")) {
    store.getState().deleteSelectedPosts();
    return;
  }

  if (event.target.closest("[data-open-library-posts-empty]")) {
    store.getState().setCurrentTab("library");
    return;
  }

  const toggleSource = event.target.closest("[data-toggle-source]");
  if (toggleSource) {
    store.getState().toggleSource(toggleSource.dataset.toggleSource);
    return;
  }

  const openIdeaTrigger = event.target.closest("[data-open-idea]");
  if (openIdeaTrigger) {
    store.getState().openIdea(openIdeaTrigger.dataset.openIdea);
    return;
  }

  const openAddEntry = event.target.closest("[data-open-add-entry]");
  if (openAddEntry) {
    store.getState().openBriefEntryComposer(openAddEntry.dataset.openAddEntry);
    return;
  }

  const toggleBriefSection = event.target.closest("[data-toggle-brief-section]");
  if (toggleBriefSection) {
    store.getState().toggleBriefSection(toggleBriefSection.dataset.toggleBriefSection);
    return;
  }

  if (event.target.closest("[data-open-add-section]")) {
    store.getState().openBriefSectionComposer();
    return;
  }

  const editEntry = event.target.closest("[data-edit-entry]");
  if (editEntry) {
    store
      .getState()
      .openBriefEntryComposer(editEntry.dataset.sectionId, editEntry.dataset.editEntry);
    return;
  }

  const deleteEntry = event.target.closest("[data-delete-entry]");
  if (deleteEntry) {
    store
      .getState()
      .deleteBriefEntry(deleteEntry.dataset.sectionId, deleteEntry.dataset.deleteEntry);
    return;
  }

  const refineBrief = event.target.closest("[data-refine-brief]");
  if (refineBrief) {
    const sectionId = refineBrief.dataset.refineBrief;
    store.getState().refineStrategyBrief(sectionId === "all" ? null : sectionId);
    return;
  }

  if (event.target.closest("[data-clear-brief]")) {
    if (window.confirm("Clear the current strategy brief?")) {
      store.getState().clearStrategyBrief();
    }
    return;
  }

  const pinIdea = event.target.closest("[data-pin-idea]");
  if (pinIdea) {
    store.getState().toggleIdeaPin(pinIdea.dataset.pinIdea);
    return;
  }

  const compareIdea = event.target.closest("[data-compare-idea]");
  if (compareIdea) {
    store.getState().compareIdea(compareIdea.dataset.compareIdea);
    return;
  }

  const generatePost = event.target.closest("[data-generate-post]");
  if (generatePost) {
    store.getState().generatePostForIdea(generatePost.dataset.generatePost);
    return;
  }

  const draftIdea = event.target.closest("[data-draft-idea]");
  if (draftIdea) {
    store.getState().generatePostForIdea(draftIdea.dataset.draftIdea);
    return;
  }

  const askIdea = event.target.closest("[data-ask-idea]");
  if (askIdea) {
    store.getState().askAboutIdea(askIdea.dataset.askIdea);
    return;
  }

  if (event.target.closest("[data-generate-selected]")) {
    store.getState().generatePostsFromSelected();
    return;
  }

  if (event.target.closest("[data-prepare-selected-posts]")) {
    store.getState().prepareSelectedPosts();
    return;
  }

  if (event.target.closest("[data-schedule-selected-posts]")) {
    const _state = store.getState();
    const _session = getActiveSession(_state);
    const _ui = _session ? getSessionUi(_session.id, _state) : null;
    const _ids = (_ui?.selectedPostIds) || [];
    const _posts = _session ? _session.posts.filter((p) => _ids.includes(p.id)) : [];
    if (_posts.length) {
      openScheduleModal(_posts, () => _state.scheduleSelectedPosts());
    }
    return;
  }

  const jumpToErrors = event.target.closest("[data-jump-to-errors]");
  if (jumpToErrors) {
    document.getElementById("post-review-" + jumpToErrors.dataset.jumpToErrors)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    return;
  }

  const editPost = event.target.closest("[data-edit-post]");
  if (editPost) {
    const session = getActiveSession(store.getState());
    const post = session ? getPostById(session, editPost.dataset.editPost) : null;
    if (!post) return;
    const nextText = window.prompt("Edit post text", post.content?.text || "");
    if (nextText === null) return;
    store.getState().updatePost(editPost.dataset.editPost, {
      content: {
        ...post.content,
        text: nextText.trim() || post.content?.text || "",
      },
    });
    return;
  }

  const deletePost = event.target.closest("[data-delete-post]");
  if (deletePost) {
    store.getState().deletePost(deletePost.dataset.deletePost);
    return;
  }

  const schedulePost = event.target.closest("[data-schedule-post]");
  if (schedulePost) {
    const _postId = schedulePost.dataset.schedulePost;
    const _state = store.getState();
    const _session = getActiveSession(_state);
    const _post = _session?.posts.find((p) => p.id === _postId);
    if (_post) {
      openScheduleModal([_post], () => _state.schedulePost(_postId));
    }
    return;
  }

  const duplicatePost = event.target.closest("[data-duplicate-post]");
  if (duplicatePost) {
    store.getState().duplicatePost(duplicatePost.dataset.duplicatePost);
    return;
  }

  const togglePostsGroup = event.target.closest("[data-toggle-posts-group]");
  if (togglePostsGroup) {
    store.getState().togglePostsGroupCollapsed(togglePostsGroup.dataset.togglePostsGroup);
    return;
  }

  const railItem = event.target.closest("[data-posts-rail-item]");
  if (railItem) {
    const kind = railItem.dataset.postsRailKind;
    const value = railItem.dataset.postsRailValue;
    const itemId = railItem.dataset.postsRailItem;
    if (kind === "all") {
      store.getState().setPostsStatusFilter("all", itemId);
    } else if (kind === "status") {
      store.getState().setPostsStatusFilter(value, itemId);
    } else if (kind === "best") {
      store.getState().setPostsStatusFilter("best", itemId);
    } else if (kind === "network") {
      store.getState().setPostsNetworkFilter(value, itemId);
    }
    return;
  }
});

function saveSessionFromModal() {
  store.getState().saveSession(sessionNameInput.value);
}

saveSessionModal.addEventListener("click", saveSessionFromModal);
sessionNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") saveSessionFromModal();
});
closeSessionModal.addEventListener("click", () => store.getState().closeSessionModal());
cancelSessionModal.addEventListener("click", () => store.getState().closeSessionModal());
sessionModalBackdrop.addEventListener("click", () => store.getState().closeSessionModal());

// Feedback Modal
openFeedbackBtn.addEventListener("click", () => {
  store.getState().openFeedbackModal();
  window.setTimeout(() => feedbackText.focus(), 50);
});
closeFeedbackBtn.addEventListener("click", () => store.getState().closeFeedbackModal());
cancelFeedbackBtn.addEventListener("click", () => store.getState().closeFeedbackModal());
feedbackBackdrop.addEventListener("click", () => store.getState().closeFeedbackModal());

submitFeedbackBtn.addEventListener("click", async () => {
  const text = feedbackText.value.trim();
  if (!text) {
    feedbackText.classList.add("invalid");
    feedbackText.focus();
    return;
  }
  feedbackText.classList.remove("invalid");
  submitFeedbackBtn.disabled = true;
  submitFeedbackBtn.textContent = "Sending…";

  // Mock submit — replace with real Intercom/Canny/Shortcut call
  await new Promise((resolve) => setTimeout(resolve, 1200));

  feedbackModal.classList.add("success");
  setTimeout(() => store.getState().closeFeedbackModal(), 2500);
});

feedbackText.addEventListener("input", () => {
  if (feedbackText.value.trim()) feedbackText.classList.remove("invalid");
});

// Bug Report Modal
openBugReportBtn.addEventListener("click", async () => {
  store.getState().openBugReportModal();
  populateBugContext();
  window.setTimeout(() => focusWithoutScroll(bugProblemInput), 50);

  // Auto-capture page screenshot
  bugCapturingBadge.style.display = "";
  const dataUrl = await capturePageScreenshot();
  if (dataUrl) {
    setBugScreenshot(dataUrl);
  } else {
    bugCapturingBadge.style.display = "none";
  }
});

closeBugReportBtn.addEventListener("click", () => store.getState().closeBugReportModal());
cancelBugReportBtn.addEventListener("click", () => store.getState().closeBugReportModal());
bugReportBackdrop.addEventListener("click", () => store.getState().closeBugReportModal());

bugCategories.addEventListener("click", (e) => {
  const chip = e.target.closest(".bug-category-chip");
  if (!chip) return;
  bugCategories.querySelectorAll(".bug-category-chip").forEach((c) => c.classList.remove("selected"));
  if (chip.dataset.value !== bugSelectedCategory) {
    chip.classList.add("selected");
    bugSelectedCategory = chip.dataset.value;
  } else {
    bugSelectedCategory = null;
  }
});

bugDropzone.addEventListener("click", () => bugFileInput.click());
bugDropzone.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); bugFileInput.click(); }
});
bugDropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  bugDropzone.classList.add("drag-over");
});
bugDropzone.addEventListener("dragleave", () => bugDropzone.classList.remove("drag-over"));
bugDropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  bugDropzone.classList.remove("drag-over");
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (ev) => setBugScreenshot(ev.target.result);
    reader.readAsDataURL(file);
  }
});

bugFileInput.addEventListener("change", () => {
  const file = bugFileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => setBugScreenshot(e.target.result);
  reader.readAsDataURL(file);
});

bugRemoveFileBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  clearBugScreenshot();
});

submitBugReportBtn.addEventListener("click", async () => {
  const problem = bugProblemInput.value.trim();
  if (!problem) {
    bugProblemInput.classList.add("invalid");
    focusWithoutScroll(bugProblemInput);
    return;
  }
  bugProblemInput.classList.remove("invalid");
  submitBugReportBtn.disabled = true;
  submitBugReportBtn.textContent = "Submitting…";

  const action = bugActionInput.value.trim();
  const description = buildShortcutDescription(bugSelectedCategory, action, problem);
  const ticketName = (bugSelectedCategory ? bugCategoryLabels[bugSelectedCategory] + " — " : "") + problem;
  // eslint-disable-next-line no-unused-vars
  const _payload = { name: ticketName, description, story_type: "bug", screenshot: bugScreenshotDataUrl };

  await mockShortcutSubmit();
  bugReportModal.classList.add("success");
  setTimeout(() => store.getState().closeBugReportModal(), 2500);
});
closeDrawer.addEventListener("click", () => store.getState().closeIdea());
drawerBackdrop.addEventListener("click", () => store.getState().closeIdea());
drawerGeneratePost.addEventListener("click", () => {
  if (drawerGeneratePost.dataset.ideaId) {
    store.getState().generatePostForIdea(drawerGeneratePost.dataset.ideaId);
  }
});
drawerAskQuestion.addEventListener("click", () => {
  if (drawerAskQuestion.dataset.ideaId) {
    store.getState().askAboutIdea(drawerAskQuestion.dataset.ideaId);
  }
});
drawerMoveToBrief.addEventListener("click", () => {
  store.getState().moveIdeaToBrief();
});

store.subscribe(renderApp);

hydrateStaticIcons();
renderApp();
