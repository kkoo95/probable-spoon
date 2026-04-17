/**
 * Shared utility functions and icon map used across all views.
 */

export const icons = {
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
  sparklesMermaid:
    '<span class="agp-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><defs><linearGradient id="sparklesMermaidGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#578fff"/><stop offset="100%" stop-color="#df52ff"/></linearGradient></defs><path fill="url(#sparklesMermaidGradient)" d="M11.984 7.2H12a.806.806 0 0 0 .8-.76c.072-1.36.68-1.64 1.584-1.64h.016c.44 0 .8-.352.8-.792a.796.796 0 0 0-.784-.808c-1.168-.024-1.616-.472-1.616-1.6 0-.44-.36-.8-.8-.8s-.8.36-.8.8c0 1.136-.456 1.584-1.608 1.6a.81.81 0 0 0-.792.808c0 .44.36.792.8.792 1.16 0 1.592.44 1.6 1.608a.803.803 0 0 0 .784.792"/><path fill="url(#sparklesMermaidGradient)" fill-rule="evenodd" d="M6.384 15.2H6.4a.806.806 0 0 0 .8-.76c.144-2.792 1.368-4.04 3.968-4.04h.032c.416.032.8-.352.8-.792a.8.8 0 0 0-.784-.808c-2.784-.064-4.024-1.296-4.016-4 0-.44-.36-.8-.8-.8s-.8.36-.8.8c-.008 2.728-1.24 3.96-4.008 4a.81.81 0 0 0-.792.808c0 .44.36.792.8.792h.008c2.736 0 3.96 1.24 3.992 4.008a.803.803 0 0 0 .784.792m.056-4.064a4.2 4.2 0 0 0-1.512-1.552l.008-.008A4.25 4.25 0 0 0 6.4 8.12c.376.616.88 1.112 1.52 1.48a4.4 4.4 0 0 0-1.48 1.536" clip-rule="evenodd"/></svg></span>',
};

export function escapeHtml(value = "") {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function formatText(value = "") {
  return escapeHtml(value).replaceAll("\n", "<br />");
}

export function hydrateStaticIcons() {
  document.querySelectorAll("[data-agp-icon]").forEach((node) => {
    const iconName = node.getAttribute("data-agp-icon");
    if (iconName && icons[iconName]) {
      node.outerHTML = icons[iconName];
    }
  });
}

export function actionButton({ style, color, label, attrs = "", loading = false, disabled = false, icon = "" }) {
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

export function iconButton({ label, icon, attrs = "", stroked = false, color = "", disabled = false }) {
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

export function overflowMenu({ label, items, triggerClass = "ap-icon-button" }) {
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

export function statusPill(status) {
  if (status === "processing") return '<span class="ap-status blue"><span class="dot"></span>Processing</span>';
  if (status === "failed") return '<span class="ap-status red"><span class="dot"></span>Failed</span>';
  return '<span class="ap-status green"><span class="dot"></span>Processed</span>';
}

export function priorityPill(priority) {
  if (priority === "high") return '<span class="ap-status orange"><span class="dot"></span>High relevance</span>';
  if (priority === "medium") return '<span class="ap-status blue"><span class="dot"></span>Medium relevance</span>';
  return '<span class="ap-status grey"><span class="dot"></span>Low relevance</span>';
}

export function strengthPill(strength) {
  if (strength === "strong") return '<span class="source-signal strong">Strong signal</span>';
  if (strength === "moderate") return '<span class="source-signal moderate">Moderate signal</span>';
  return '<span class="source-signal weak">Weak signal</span>';
}

export function iconForType(type) {
  return type === "url" ? icons.link : icons.filePdf;
}

export function assistantModeCopy(mode) {
  return (
    {
      pdf: { label: "PDF mode", dropTitle: "Drop a PDF into this sprint" },
      url: { label: "URL mode", dropTitle: "Paste an article or page URL" },
      video: { label: "Video mode", dropTitle: "Add a video link or transcript" },
      audio: { label: "Audio mode", dropTitle: "Upload audio or paste a transcript" },
    }[mode] || { label: "Source mode", dropTitle: "Add a source" }
  );
}

export function generationPlatformCopy(platform) {
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
