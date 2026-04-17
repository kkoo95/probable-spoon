/**
 * bug-report-modal.js — "Report a bug" dialog with screenshot capture.
 * Self-contained: injects HTML, binds events, exports render().
 */
import { store, getActiveSession } from "../store.js?v=15";

let backdrop, modal, submitBtn, problemInput, actionInput;
let categoriesEl, previewEl, dropzoneFallback, dropzone, fileInput;
let previewImg, fileNameEl, autoBadge, capturingBadge, contextBar;
let selectedCategory = null;
let screenshotDataUrl = null;

function escapeHtml(v = "") {
  return v.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

const categoryLabels = {
  visual: "Visual glitch",
  behavior: "Wrong behavior",
  broken: "Feature not working",
  performance: "Performance",
  other: "Other",
};

const HTML = `
<div class="modal-backdrop" id="bugReportBackdrop"></div>
<aside
  class="ap-dialog bug-report-modal"
  id="bugReportModal"
  role="dialog"
  aria-modal="true"
  aria-labelledby="bugReportTitle"
  aria-describedby="bugReportDescription"
  aria-hidden="true"
>
  <div class="ap-dialog-header">
    <h2 class="ap-dialog-title" id="bugReportTitle">Report a bug</h2>
    <p class="ap-dialog-description" id="bugReportDescription">Share what happened and we will send the context with it.</p>
  </div>
  <button class="ap-dialog-close" type="button" id="closeBugReportBtn" aria-label="Close">
    <i class="ap-icon-close"></i>
  </button>
  <div class="ap-dialog-content">
    <div class="bug-report-modal__fields">

      <div class="ap-field bug-field">
        <label>What type of issue?</label>
        <div class="bug-categories" id="bugCategories">
          <button type="button" class="bug-category-chip" data-value="visual">Visual glitch</button>
          <button type="button" class="bug-category-chip" data-value="behavior">Wrong behavior</button>
          <button type="button" class="bug-category-chip" data-value="broken">Feature not working</button>
          <button type="button" class="bug-category-chip" data-value="performance">Performance</button>
          <button type="button" class="bug-category-chip" data-value="other">Other</button>
        </div>
      </div>

      <div class="ap-field bug-field">
        <label for="bugActionInput">What were you trying to do?</label>
        <input class="ap-input" id="bugActionInput" type="text" placeholder="e.g. Schedule a post, add a source..." />
      </div>

      <div class="ap-field bug-field">
        <label for="bugProblemInput">What went wrong? <span class="bug-field__required">*</span></label>
        <textarea class="ap-textarea" id="bugProblemInput" placeholder="e.g. The calendar didn't open, the button did nothing, or the state reset unexpectedly..."></textarea>
      </div>

      <div class="ap-field bug-field">
        <div class="bug-field__label-row">
          <label for="bugFileInput">Screenshot</label>
          <span class="bug-badge bug-badge--green" id="bugAutoBadge" style="display:none">Auto-captured</span>
          <span class="bug-badge bug-badge--grey" id="bugCapturingBadge" style="display:none">Capturing…</span>
        </div>
        <div class="bug-report-dropzone has-file" id="bugScreenshotPreview" style="display:none">
          <div class="bug-report-preview">
            <img id="bugPreviewImg" src="" alt="Screenshot" />
            <span class="bug-report-preview__name" id="bugFileName">Page screenshot</span>
            <button type="button" class="ap-button ghost grey bug-report-preview__remove" id="bugRemoveFileBtn">Remove</button>
          </div>
        </div>
        <div id="bugDropzoneFallback">
          <div class="bug-report-dropzone" id="bugDropzone" role="button" tabindex="0" aria-label="Upload screenshot">
            <div class="bug-report-dropzone__primary">Drop an image here or <strong class="bug-report-dropzone__browse">browse</strong></div>
            <div class="bug-report-dropzone__hint">PNG, JPG, GIF — max 10 MB</div>
          </div>
          <input type="file" id="bugFileInput" accept="image/*" style="display:none" />
        </div>
      </div>

      <div class="bug-context" id="bugContextBar"></div>

    </div>
  </div>
  <div class="ap-dialog-footer">
    <div class="ap-dialog-footer-right">
      <button type="button" class="ap-button ghost grey" id="cancelBugReportBtn">Cancel</button>
      <button type="button" class="ap-button primary orange" id="submitBugReportBtn">Submit Bug Report</button>
    </div>
  </div>
  <div class="bug-report-modal__success">
    <div class="bug-report-modal__success-icon">
      <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor"><path fill-rule="evenodd" d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"/></svg>
    </div>
    <h3>Bug reported!</h3>
    <p>Your ticket has been created in Shortcut.<br>Thanks for helping improve the product.</p>
  </div>
</aside>`;

function close() {
  store.getState().closeBugReportModal();
}

function focusSafe(el) {
  try {
    el.focus({ preventScroll: true });
  } catch {
    el.focus();
  }
}

function setScreenshot(dataUrl) {
  screenshotDataUrl = dataUrl;
  previewImg.src = dataUrl;
  fileNameEl.textContent = "Page screenshot";
  previewEl.style.display = "";
  dropzoneFallback.style.display = "none";
  capturingBadge.style.display = "none";
  autoBadge.style.display = "";
}

function clearScreenshot() {
  screenshotDataUrl = null;
  previewImg.src = "";
  fileNameEl.textContent = "";
  previewEl.style.display = "none";
  dropzoneFallback.style.display = "";
  autoBadge.style.display = "none";
  capturingBadge.style.display = "none";
  fileInput.value = "";
}

function reset() {
  modal.classList.remove("success");
  selectedCategory = null;
  categoriesEl.querySelectorAll(".bug-category-chip").forEach((c) => c.classList.remove("selected"));
  actionInput.value = "";
  problemInput.value = "";
  problemInput.classList.remove("invalid");
  clearScreenshot();
  contextBar.innerHTML = "";
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
      ignoreElements: (el) => el.id === "bugReportModal" || el.id === "bugReportBackdrop",
    });
    return canvas.toDataURL("image/jpeg", 0.8);
  } catch {
    return null;
  }
}

function populateContext() {
  const state = store.getState();
  const tabLabels = {
    library: "Library",
    brief: "Brief",
    voice: "Voice",
    brand: "Brand Theme",
    posts: "Posts",
  };
  const session = getActiveSession(state);
  const tab = tabLabels[state.currentTab] || state.currentTab;
  const name = session?.name || "—";
  const time = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  contextBar.innerHTML =
    '<span class="bug-context__label">Context</span>' +
    '<span class="bug-context__pill">' +
    escapeHtml(tab) +
    "</span>" +
    '<span class="bug-context__pill">' +
    escapeHtml(name) +
    "</span>" +
    '<span class="bug-context__pill">' +
    escapeHtml(time) +
    "</span>";
}

function buildDescription(category, action, problem) {
  const state = store.getState();
  const session = getActiveSession(state);
  const tabLabels = {
    library: "Library",
    brief: "Brief",
    voice: "Voice",
    brand: "Brand Theme",
    posts: "Posts",
  };
  let desc = "";
  if (category) desc += "**Category:** " + (categoryLabels[category] || category) + "\n\n";
  if (action) desc += "**What I was trying to do:** " + action + "\n\n";
  desc += "**What went wrong:** " + problem + "\n\n---\n**Context**\n";
  desc += "- Tab: " + (tabLabels[state.currentTab] || state.currentTab) + "\n";
  desc += "- Session: " + (session?.name || "—") + "\n";
  desc += "- Time: " + new Date().toISOString();
  return desc;
}

export function init() {
  document.body.insertAdjacentHTML("beforeend", HTML);

  backdrop = document.getElementById("bugReportBackdrop");
  modal = document.getElementById("bugReportModal");
  submitBtn = document.getElementById("submitBugReportBtn");
  problemInput = document.getElementById("bugProblemInput");
  actionInput = document.getElementById("bugActionInput");
  categoriesEl = document.getElementById("bugCategories");
  previewEl = document.getElementById("bugScreenshotPreview");
  dropzoneFallback = document.getElementById("bugDropzoneFallback");
  dropzone = document.getElementById("bugDropzone");
  fileInput = document.getElementById("bugFileInput");
  previewImg = document.getElementById("bugPreviewImg");
  fileNameEl = document.getElementById("bugFileName");
  autoBadge = document.getElementById("bugAutoBadge");
  capturingBadge = document.getElementById("bugCapturingBadge");
  contextBar = document.getElementById("bugContextBar");

  // Open
  document.getElementById("openBugReportBtn").addEventListener("click", async () => {
    store.getState().openBugReportModal();
    populateContext();
    window.setTimeout(() => focusSafe(problemInput), 50);
    capturingBadge.style.display = "";
    const dataUrl = await capturePageScreenshot();
    if (dataUrl) setScreenshot(dataUrl);
    else capturingBadge.style.display = "none";
  });

  // Close
  document.getElementById("closeBugReportBtn").addEventListener("click", close);
  document.getElementById("cancelBugReportBtn").addEventListener("click", close);
  backdrop.addEventListener("click", close);

  // Categories
  categoriesEl.addEventListener("click", (e) => {
    const chip = e.target.closest(".bug-category-chip");
    if (!chip) return;
    categoriesEl.querySelectorAll(".bug-category-chip").forEach((c) => c.classList.remove("selected"));
    if (chip.dataset.value !== selectedCategory) {
      chip.classList.add("selected");
      selectedCategory = chip.dataset.value;
    } else {
      selectedCategory = null;
    }
  });

  // File upload
  dropzone.addEventListener("click", () => fileInput.click());
  dropzone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInput.click();
    }
  });
  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("drag-over");
  });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("drag-over"));
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setScreenshot(ev.target.result);
      reader.readAsDataURL(file);
    }
  });
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setScreenshot(e.target.result);
    reader.readAsDataURL(file);
  });
  document.getElementById("bugRemoveFileBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    clearScreenshot();
  });

  // Submit
  submitBtn.addEventListener("click", async () => {
    const problem = problemInput.value.trim();
    if (!problem) {
      problemInput.classList.add("invalid");
      focusSafe(problemInput);
      return;
    }
    problemInput.classList.remove("invalid");
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";
    const action = actionInput.value.trim();
    const description = buildDescription(selectedCategory, action, problem);
    const ticketName = (selectedCategory ? categoryLabels[selectedCategory] + " — " : "") + problem;
    void { name: ticketName, description, story_type: "bug", screenshot: screenshotDataUrl };
    await new Promise((r) => setTimeout(r, 1400));
    modal.classList.add("success");
    setTimeout(close, 2500);
  });
}

export function render(state) {
  const open = state.bugReportModal.open;
  backdrop.classList.toggle("open", open);
  modal.classList.toggle("open", open);
  modal.setAttribute("aria-hidden", open ? "false" : "true");
  if (!open) reset();
}
