/**
 * generate-image-modal.js
 * Self-contained "Generate Image" modal — Agorapulse DS v2
 *
 * Usage:
 *   import { openGenerateImageModal } from './generate-image-modal.js';
 *   openGenerateImageModal(postId, (imageUrl) => { store.getState().setPostImage(postId, imageUrl); });
 *
 * Trigger points (wire in app.js):
 *   1. [data-open-generate-image="postId"]  → placeholder zone inside post preview
 *   2. [data-generate-image-btn="postId"]   → icon button in floating actions
 */

// ---------------------------------------------------------------------------
// CSS — injected once
// ---------------------------------------------------------------------------

const STYLES = `
  /* ── Modal shell ── */
  .generate-image-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    width: min(calc(100% - 32px), 540px);
    transform: translate(-50%, -50%);
    display: none;
    z-index: 60;
    max-height: calc(100vh - 48px);
    border: 1px solid var(--ref-color-grey-10);
    box-shadow: 0 12px 32px rgba(33, 46, 68, 0.12);
  }

  .generate-image-modal.open { display: flex; }

  .generate-image-modal .ap-dialog-content {
    flex: 1;
    overflow-y: auto;
    gap: var(--ref-spacing-md);
  }

  /* ── Form body ── */
  .gen-image-body {
    display: flex;
    flex-direction: column;
    gap: var(--ref-spacing-md);
  }

  /* ── Section ── */
  .gen-section {
    display: flex;
    flex-direction: column;
    gap: var(--ref-spacing-xs);
  }

  .gen-section-label {
    font-size: var(--ref-font-size-xs);
    font-weight: var(--ref-font-weight-bold);
    color: var(--ref-color-grey-100);
    margin: 0;
  }

  .gen-section-label span {
    font-weight: var(--ref-font-weight-regular);
    color: var(--ref-color-grey-60);
    margin-left: 4px;
  }

  /* ── Prompt textarea ── */
  .gen-prompt-area {
    width: 100%;
    min-height: 76px;
    resize: vertical;
    border: 1px solid var(--ref-color-grey-20);
    border-radius: var(--ref-radius-md);
    padding: 8px 10px;
    font-size: var(--ref-font-size-sm);
    font-family: inherit;
    color: var(--ref-color-grey-150);
    line-height: var(--ref-font-line-height-md);
    transition: border-color 0.12s, box-shadow 0.12s;
    box-sizing: border-box;
  }

  .gen-prompt-area:focus {
    border-color: var(--ref-color-orange-100);
    outline: none;
    box-shadow: 0 0 0 3px var(--ref-color-orange-10);
  }

  .gen-prompt-area::placeholder {
    color: var(--ref-color-grey-40);
  }

  /* ── Derive button ── */
  .gen-derive-btn {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    padding: 0;
    font-size: var(--ref-font-size-xs);
    color: var(--ref-color-electric-blue-100);
    cursor: pointer;
    font-family: inherit;
  }

  .gen-derive-btn:hover:not(:disabled) {
    color: var(--ref-color-electric-blue-150);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .gen-derive-btn:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .gen-derive-btn [class^="ap-icon-"] {
    width: 12px;
    height: 12px;
    min-width: 12px;
    flex-shrink: 0;
  }

  /* ── Chips ── */
  .gen-chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ref-spacing-xs);
  }

  .gen-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    border: 1px solid var(--ref-color-grey-20);
    border-radius: 999px;
    background: var(--ref-color-white);
    font-size: var(--ref-font-size-xs);
    font-weight: var(--ref-font-weight-bold);
    color: var(--ref-color-grey-80);
    cursor: pointer;
    transition: border-color 0.12s, background 0.12s, color 0.12s;
    font-family: inherit;
    line-height: 18px;
  }

  .gen-chip:hover {
    border-color: var(--ref-color-grey-60);
    color: var(--ref-color-grey-150);
  }

  .gen-chip.selected {
    border-color: var(--ref-color-orange-100);
    background: var(--ref-color-orange-10);
    color: var(--ref-color-orange-100);
  }

  .gen-chip .gen-chip-icon {
    font-size: 13px;
    line-height: 1;
  }

  /* ── Skeleton loading ── */
  .gen-image-skeleton {
    width: 100%;
    aspect-ratio: 4 / 3;
    border-radius: var(--ref-radius-md);
    background: linear-gradient(90deg, #eceff3 25%, #f6f8fb 50%, #eceff3 75%);
    background-size: 200% 100%;
    animation: pulse 1.2s linear infinite;
    flex-shrink: 0;
  }

  .gen-image-loading-label {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--ref-spacing-xs);
    font-size: var(--ref-font-size-xs);
    color: var(--ref-color-grey-60);
  }

  .gen-image-spinner {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 1.5px solid var(--ref-color-grey-40);
    border-top-color: var(--ref-color-grey-150);
    border-radius: 50%;
    animation: gen-spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  @keyframes gen-spin { to { transform: rotate(360deg); } }

  /* ── Result ── */
  .gen-image-result {
    display: flex;
    flex-direction: column;
    gap: var(--ref-spacing-sm);
  }

  .gen-image-preview {
    width: 100%;
    border-radius: var(--ref-radius-md);
    display: block;
    border: 1px solid var(--ref-color-grey-10);
  }

  .gen-image-result-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--ref-spacing-xs);
  }

  /* ── Loading summary (brief options shown in loading/result state) ── */
  .gen-summary-bar {
    display: flex;
    align-items: center;
    gap: var(--ref-spacing-xs);
    flex-wrap: wrap;
  }

  .gen-summary-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 999px;
    background: var(--ref-color-grey-05);
    border: 1px solid var(--ref-color-grey-10);
    font-size: var(--ref-font-size-xs);
    color: var(--ref-color-grey-60);
  }


`;

function injectStyles() {
  if (document.getElementById("generate-image-modal-styles")) return;
  const el = document.createElement("style");
  el.id = "generate-image-modal-styles";
  el.textContent = STYLES;
  document.head.appendChild(el);
}

// ---------------------------------------------------------------------------
// Mock async helpers
// ---------------------------------------------------------------------------

/**
 * Derives an image prompt from the post content.
 * Real implementation: call the AI prompt-derivation endpoint.
 */
async function derivePromptFromPost(postId) {
  await new Promise((r) => setTimeout(r, 600));
  const prompts = [
    "A professional executive presenting data insights in a modern office environment, photorealistic, warm lighting",
    "Bold graphic showing upward-trending growth chart with vibrant blue and orange colors, minimalist style",
    "Diverse team collaborating around a laptop in a bright co-working space, candid photography",
    "Abstract representation of connected ideas and knowledge networks, tech aesthetic, deep blue palette",
    "Close-up of hands typing on a keyboard with data visualizations floating above, futuristic editorial style",
  ];
  return prompts[Math.abs(postId.charCodeAt(postId.length - 1)) % prompts.length];
}

/**
 * Generates an image from a prompt + options.
 * Real implementation: call the image generation API.
 * @returns {Promise<string>} image URL
 */
async function generateImage(prompt, seed) {
  // eslint-disable-line no-unused-vars
  await new Promise((r) => setTimeout(r, 1400));
  return `https://picsum.photos/seed/${seed}/800/600`;
}

// ---------------------------------------------------------------------------
// Style + Mood options
// ---------------------------------------------------------------------------

const STYLE_OPTIONS = [
  { key: "photorealistic", label: "Photorealistic", icon: "📷" },
  { key: "illustration", label: "Illustration", icon: "🎨" },
  { key: "bold-graphic", label: "Bold graphic", icon: "⚡" },
  { key: "editorial", label: "Editorial photo", icon: "📰" },
  { key: "abstract", label: "Abstract", icon: "🌀" },
];

const MOOD_OPTIONS = [
  { key: "professional", label: "Professional" },
  { key: "energetic", label: "Energetic" },
  { key: "calm", label: "Calm" },
  { key: "inspiring", label: "Inspiring" },
  { key: "playful", label: "Playful" },
];

// ---------------------------------------------------------------------------
// Module state
// ---------------------------------------------------------------------------

let _postId = null;
let _genState = "idle"; // 'idle' | 'loading' | 'result'
let _promptText = "";
let _promptLoading = false;
let _style = null;
let _mood = null;
let _imageUrl = null;
let _lastSeed = null;
let _onUse = null;

function genSeed() {
  return (_postId || "img") + "-" + (_style || "none") + "-" + (_mood || "none") + "-" + Date.now();
}

function buildFullPrompt() {
  const parts = [_promptText.trim()];
  if (_style) {
    const s = STYLE_OPTIONS.find((o) => o.key === _style);
    if (s) parts.push(s.label + " style");
  }
  if (_mood) {
    const m = MOOD_OPTIONS.find((o) => o.key === _mood);
    if (m) parts.push(m.label.toLowerCase() + " mood");
  }
  return parts.filter(Boolean).join(", ");
}

// ---------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------

function escapeHtml(s = "") {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function getModal() {
  return document.getElementById("generateImageModal");
}
function getBody() {
  return document.getElementById("genImageBody");
}
function getFooter() {
  return document.getElementById("genImageFooter");
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function chipHtml(options, selectedKey, dataAttr) {
  return options
    .map(
      (o) =>
        '<button type="button" class="gen-chip' +
        (selectedKey === o.key ? " selected" : "") +
        '" ' +
        dataAttr +
        '="' +
        o.key +
        '">' +
        (o.icon ? '<span class="gen-chip-icon">' + o.icon + "</span>" : "") +
        escapeHtml(o.label) +
        "</button>",
    )
    .join("");
}

function summaryTagsHtml() {
  const tags = [];
  if (_style) {
    const s = STYLE_OPTIONS.find((o) => o.key === _style);
    if (s) tags.push(s.icon + " " + s.label);
  }
  if (_mood) {
    const m = MOOD_OPTIONS.find((o) => o.key === _mood);
    if (m) tags.push(m.label);
  }
  if (!tags.length) return "";
  return (
    '<div class="gen-summary-bar">' +
    tags.map((t) => '<span class="gen-summary-tag">' + escapeHtml(t) + "</span>").join("") +
    "</div>"
  );
}

function renderBody() {
  const body = getBody();
  const footer = getFooter();
  if (!body || !footer) return;

  if (_genState === "idle") {
    body.innerHTML =
      '<div class="gen-image-body">' +
      // ── Prompt section ──
      '<div class="gen-section">' +
      '<p class="gen-section-label">Describe your image<span>— edit or write your own</span></p>' +
      '<textarea class="gen-prompt-area" id="genImagePrompt" rows="3" ' +
      'placeholder="e.g. A professional team celebrating a milestone in a modern office…">' +
      escapeHtml(_promptText) +
      "</textarea>" +
      '<button type="button" class="gen-derive-btn" id="genDeriveBtn"' +
      (_promptLoading ? " disabled" : "") +
      ">" +
      (_promptLoading
        ? '<span class="gen-image-spinner"></span>Deriving from post content…'
        : '<i class="ap-icon-sparkles"></i>' + "Re-derive from post content") +
      "</button>" +
      "</div>" +
      // ── Style section ──
      '<div class="gen-section">' +
      '<p class="gen-section-label">Visual style<span>— optional</span></p>' +
      '<div class="gen-chips">' +
      chipHtml(STYLE_OPTIONS, _style, "data-gen-style") +
      "</div></div>" +
      // ── Mood section ──
      '<div class="gen-section">' +
      '<p class="gen-section-label">Mood<span>— optional</span></p>' +
      '<div class="gen-chips">' +
      chipHtml(MOOD_OPTIONS, _mood, "data-gen-mood") +
      "</div></div>" +
      "</div>";

    footer.hidden = false;
    footer.innerHTML = footerIdleHtml();

    // Sync textarea → module state
    const ta = body.querySelector("#genImagePrompt");
    if (ta) {
      ta.addEventListener("input", () => {
        _promptText = ta.value;
      });
    }
  }

  if (_genState === "loading") {
    body.innerHTML =
      '<div class="gen-image-body">' +
      '<div class="gen-image-skeleton"></div>' +
      summaryTagsHtml() +
      '<p class="gen-image-loading-label"><span class="gen-image-spinner"></span>Generating image…</p>' +
      "</div>";
    footer.hidden = false;
    footer.innerHTML = footerLoadingHtml();
  }

  if (_genState === "result") {
    body.innerHTML =
      '<div class="gen-image-body">' +
      '<div class="gen-image-result">' +
      '<img class="gen-image-preview" src="' +
      escapeHtml(_imageUrl) +
      '" alt="Generated image" />' +
      summaryTagsHtml() +
      '<div class="gen-image-result-actions">' +
      '<button type="button" class="ap-button ghost grey" id="genImageRegenerate">' +
      '<i class="ap-icon-refresh"></i>' +
      "Regenerate" +
      "</button>" +
      '<button type="button" class="ap-button ghost grey" id="genImageEdit">' +
      '<i class="ap-icon-pencil"></i>' +
      "Edit options" +
      "</button>" +
      '<button type="button" class="ap-button primary orange" id="genImageUse">Use this image</button>' +
      "</div></div></div>";

    footer.hidden = true;
    footer.innerHTML = "";

    document.getElementById("genImageRegenerate")?.addEventListener("click", handleRegenerate);
    document.getElementById("genImageEdit")?.addEventListener("click", handleEditOptions);
    document.getElementById("genImageUse")?.addEventListener("click", handleUse);
  }
}

function footerIdleHtml() {
  return (
    '<div class="ap-dialog-footer-right">' +
    '<button type="button" class="ap-button ghost grey" id="genImageCancel">Cancel</button>' +
    '<button type="button" class="ap-button primary orange" id="genImageGenerate">' +
    '<i class="ap-icon-sparkles"></i>' +
    "Generate" +
    "</button>" +
    "</div>"
  );
}

function footerLoadingHtml() {
  return (
    '<div class="ap-dialog-footer-right">' +
    '<button type="button" class="ap-button ghost grey" id="genImageCancel">Cancel</button>' +
    '<button type="button" class="ap-button primary orange" disabled>' +
    '<span class="gen-image-spinner"></span>Generating…' +
    "</button>" +
    "</div>"
  );
}

// ---------------------------------------------------------------------------
// Generation flow
// ---------------------------------------------------------------------------

async function runDerive() {
  _promptLoading = true;
  renderBody();
  try {
    _promptText = await derivePromptFromPost(_postId);
  } catch {
    // silently keep whatever was there
  }
  _promptLoading = false;
  renderBody();
  // Focus textarea after derive
  const ta = getBody()?.querySelector("#genImagePrompt");
  if (ta) {
    ta.focus();
    ta.setSelectionRange(ta.value.length, ta.value.length);
  }
}

async function runGeneration() {
  _genState = "loading";
  renderBody();
  try {
    _lastSeed = genSeed();
    _imageUrl = await generateImage(buildFullPrompt(), _lastSeed);
    _genState = "result";
  } catch {
    _genState = "idle";
  }
  renderBody();
}

async function handleRegenerate() {
  _genState = "loading";
  renderBody();
  try {
    _lastSeed = genSeed();
    _imageUrl = await generateImage(buildFullPrompt(), _lastSeed);
    _genState = "result";
  } catch {
    _genState = "idle";
  }
  renderBody();
}

function handleEditOptions() {
  _genState = "idle";
  renderBody();
}

function handleUse() {
  if (typeof _onUse === "function") _onUse(_imageUrl);
  closeModal();
}

// ---------------------------------------------------------------------------
// Event delegation
// ---------------------------------------------------------------------------

function handleModalClick(e) {
  // Style chip
  const styleBtn = e.target.closest("[data-gen-style]");
  if (styleBtn && _genState === "idle") {
    const key = styleBtn.dataset.genStyle;
    _style = _style === key ? null : key; // toggle off if already selected
    renderBody();
    return;
  }

  // Mood chip
  const moodBtn = e.target.closest("[data-gen-mood]");
  if (moodBtn && _genState === "idle") {
    const key = moodBtn.dataset.genMood;
    _mood = _mood === key ? null : key;
    renderBody();
    return;
  }

  // Derive from post
  if (e.target.closest("#genDeriveBtn") && !_promptLoading) {
    runDerive();
    return;
  }

  // Generate
  if (e.target.closest("#genImageGenerate") && _genState === "idle") {
    runGeneration();
    return;
  }

  // Cancel
  if (e.target.closest("#genImageCancel")) {
    closeModal();
    return;
  }

  // Close button
  if (e.target.closest("#generateImageModalClose")) {
    closeModal();
    return;
  }
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

function ensureModal() {
  if (document.getElementById("generateImageModal")) return;
  injectStyles();

  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.id = "generateImageModalBackdrop";

  const modal = document.createElement("aside");
  modal.className = "ap-dialog generate-image-modal";
  modal.id = "generateImageModal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "generateImageModalTitle");
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="ap-dialog-header">
      <h3 class="ap-dialog-title" id="generateImageModalTitle">Generate an image</h3>
    </div>
    <button class="ap-dialog-close" type="button" id="generateImageModalClose" aria-label="Close">
      <i class="ap-icon-close"></i>
    </button>
    <div class="ap-dialog-content" id="genImageBody"></div>
    <div class="ap-dialog-footer" id="genImageFooter"></div>
  `;

  document.body.append(backdrop, modal);

  modal.addEventListener("click", handleModalClick);
  backdrop.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
  });
}

function openModal() {
  const modal = getModal();
  const backdrop = document.getElementById("generateImageModalBackdrop");
  modal.setAttribute("aria-hidden", "false");
  modal.classList.add("open");
  backdrop.classList.add("open");
  renderBody();

  // Auto-derive if prompt is empty
  if (!_promptText && !_promptLoading) {
    runDerive();
  }
}

function closeModal() {
  const modal = getModal();
  const backdrop = document.getElementById("generateImageModalBackdrop");
  if (!modal) return;
  modal.setAttribute("aria-hidden", "true");
  modal.classList.remove("open");
  backdrop.classList.remove("open");
  // Reset state on close
  _genState = "idle";
  _promptText = "";
  _promptLoading = false;
  _style = null;
  _mood = null;
  _imageUrl = null;
  _onUse = null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Opens the Generate Image modal for a specific post.
 *
 * @param {string} postId  The post to generate an image for.
 * @param {(imageUrl: string) => void} [onUse]
 *   Called when the user clicks "Use this image".
 *   Wire to store.getState().setPostImage(postId, imageUrl).
 */
export function openGenerateImageModal(postId, onUse) {
  _postId = postId;
  _onUse = onUse || null;
  ensureModal();
  openModal();
}
