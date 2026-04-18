/**
 * schedule-modal.js
 * Self-contained "Schedule Posts" modal — Agorapulse DS v2
 *
 * Usage:
 *   import { openScheduleModal } from './schedule-modal.js';
 *   openScheduleModal(posts, (results) => { ... });
 *
 *   `results` is an array of { postId, date, time } for every scheduled post.
 *
 * Integration note (app.js):
 *   1. Import this module at the top of app.js.
 *   2. In the click handler for [data-schedule-post] / [data-schedule-selected-posts],
 *      instead of calling store.getState().schedulePosts(ids), collect the post objects
 *      and call openScheduleModal(posts, onConfirm).
 *   3. In onConfirm, call store.getState().schedulePosts(results.map(r => r.postId))
 *      (or a new store action that accepts per-post datetimes).
 *   4. Bump the ?vN cache suffix on both the <script> tag in index.html and the
 *      store.js import in app.js.
 */

// ---------------------------------------------------------------------------
// CSS — injected once into <head> so no build step is needed
// ---------------------------------------------------------------------------

const STYLES = `
  /* ── Positioning shell ── */
  .schedule-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    width: min(calc(100% - 32px), 600px);
    transform: translate(-50%, -50%);
    display: none;
    z-index: 60;
    max-height: calc(100vh - 48px);
    border: 1px solid var(--ref-color-grey-10);
    box-shadow: 0 12px 32px rgba(33, 46, 68, 0.12);
  }

  .schedule-modal.open {
    display: flex;
  }

  /* Scrollable body when > 3 posts */
  .schedule-modal .ap-dialog-content {
    flex: 1;
    overflow-y: auto;
    gap: 0;
    padding: 0;
  }

  /* ── Per-post row ── */
  .schedule-row {
    display: flex;
    flex-direction: column;
    gap: var(--ref-spacing-xs);
    padding: var(--ref-spacing-md) var(--ref-spacing-lg);
    border-bottom: 1px solid var(--ref-color-grey-10);
  }

  .schedule-row:last-child {
    border-bottom: none;
  }

  /* Identity line: platform badge + account name + best time button */
  .schedule-row__identity {
    display: flex;
    align-items: center;
    gap: var(--ref-spacing-xs);
  }

  .schedule-row__account {
    flex: 1;
    font-size: var(--ref-font-size-sm);
    font-weight: var(--ref-font-weight-bold);
    color: var(--ref-color-grey-150);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Platform badge pill */
  .schedule-platform-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 24px;
    padding: 0 var(--ref-spacing-xxs);
    border-radius: var(--ref-radius-sm);
    font-size: var(--ref-font-size-xs);
    font-weight: var(--ref-font-weight-bold);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .schedule-platform-badge[data-platform="linkedin"] {
    background: var(--ref-color-electric-blue-10);
    color: var(--ref-color-electric-blue-100);
  }

  .schedule-platform-badge[data-platform="twitter"] {
    background: var(--ref-color-grey-10);
    color: var(--ref-color-grey-150);
  }

  .schedule-platform-badge[data-platform="facebook"] {
    background: var(--ref-color-electric-blue-10);
    color: var(--ref-color-electric-blue-100);
  }

  .schedule-platform-badge[data-platform="instagram"] {
    background: var(--ref-color-orange-10);
    color: var(--ref-color-orange-150);
  }

  /* Best time button — compact, right-aligned */
  .schedule-row__best-time {
    flex-shrink: 0;
    height: 28px;
    font-size: var(--ref-font-size-xs);
    padding: 0 var(--ref-spacing-xs);
    gap: 4px;
  }

  .schedule-row__best-time [class^="ap-icon-"] {
    width: 12px;
    height: 12px;
    min-width: 12px;
  }

  .schedule-row__best-time.is-loading {
    opacity: 0.6;
    cursor: wait;
  }

  /* Spinner for best-time loading state */
  .schedule-row__spinner {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 1.5px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: schedule-spin 0.6s linear infinite;
    flex-shrink: 0;
  }

  @keyframes schedule-spin {
    to { transform: rotate(360deg); }
  }

  /* Fields row: date + time + timezone label */
  .schedule-row__fields {
    display: flex;
    align-items: flex-end;
    gap: var(--ref-spacing-xs);
  }

  .schedule-row__date-field {
    flex: 1;
  }

  .schedule-row__time-field {
    width: 140px;
    flex-shrink: 0;
  }

  .schedule-row__tz {
    flex-shrink: 0;
    font-size: var(--ref-font-size-xs);
    color: var(--ref-color-grey-60);
    padding-bottom: 10px;
    white-space: nowrap;
  }

  /* ADS field label */
  .schedule-row .ap-field {
    display: grid;
    gap: 6px;
  }

  .schedule-row .ap-field label {
    font-size: var(--ref-font-size-xs);
    color: var(--ref-color-grey-80);
    font-weight: var(--ref-font-weight-regular);
  }
`;

function injectStyles() {
  if (document.getElementById("schedule-modal-styles")) return;
  const style = document.createElement("style");
  style.id = "schedule-modal-styles";
  style.textContent = STYLES;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const PLATFORM_LABELS = {
  linkedin: "LinkedIn",
  twitter: "X / Twitter",
  facebook: "Facebook",
  instagram: "Instagram",
};

/**
 * Mock getBestTime — resolves after ~600 ms with a plausible weekday slot.
 * Real implementation: replace with an API call to the Agorapulse
 * "optimal send time" endpoint for the given account/platform.
 *
 * @param {string} postId
 * @returns {Promise<{ date: string, time: string }>} ISO date (YYYY-MM-DD) + HH:MM
 */
async function getBestTime(postId) {
  // eslint-disable-line no-unused-vars
  await new Promise((r) => setTimeout(r, 600));
  // Pick next business day
  const d = new Date();
  d.setDate(d.getDate() + 1);
  if (d.getDay() === 0) d.setDate(d.getDate() + 1); // Sunday → Monday
  if (d.getDay() === 6) d.setDate(d.getDate() + 2); // Saturday → Monday
  const SLOTS = ["09:00", "10:00", "11:00", "14:00", "15:30", "17:00"];
  const time = SLOTS[Math.floor(Math.random() * SLOTS.length)];
  return {
    date: d.toISOString().split("T")[0],
    time,
  };
}

/** Generates every 15-minute slot in a 24-hour day. */
function buildTimeOptions() {
  const opts = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      const period = h < 12 ? "AM" : "PM";
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      opts.push({ value: `${hh}:${mm}`, label: `${h12}:${mm} ${period}` });
    }
  }
  return opts;
}

const TIME_OPTIONS = buildTimeOptions();

function getTimezoneLabel() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = -new Date().getTimezoneOffset();
    const sign = offset >= 0 ? "+" : "-";
    const abs = Math.abs(offset);
    const h = String(Math.floor(abs / 60)).padStart(2, "0");
    const m = String(abs % 60).padStart(2, "0");
    const city = tz.split("/").pop().replace(/_/g, " ");
    return `${city} (UTC${sign}${h}:${m})`;
  } catch {
    return "Local time";
  }
}

function escapeHtml(s = "") {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// Module state
// ---------------------------------------------------------------------------

/** @type {{ postId: string, date?: string, time?: string, loading?: boolean }[]} */
let _postStates = [];
/** @type {Array} */
let _posts = [];
/** @type {Function|null} */
let _onConfirm = null;

function getPostState(postId) {
  return _postStates.find((s) => s.postId === postId) || { postId };
}

function setPostState(postId, patch) {
  const idx = _postStates.findIndex((s) => s.postId === postId);
  if (idx === -1) {
    _postStates.push({ postId, ...patch });
  } else {
    _postStates[idx] = { ..._postStates[idx], ...patch };
  }
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function platformBadgeHtml(platform) {
  const label = PLATFORM_LABELS[platform] || platform;
  return `<span class="schedule-platform-badge" data-platform="${escapeHtml(platform)}">${escapeHtml(label)}</span>`;
}

function postRowHtml(post) {
  const s = getPostState(post.id);
  const timeOpts = TIME_OPTIONS.map(
    (o) => `<option value="${o.value}"${s.time === o.value ? " selected" : ""}>${o.label}</option>`,
  ).join("");

  const bestTimeBtn = s.loading
    ? `<button type="button" class="ap-button stroked grey schedule-row__best-time is-loading" data-best-time="${escapeHtml(post.id)}" disabled>
        <span class="schedule-row__spinner" aria-hidden="true"></span>
        Finding…
       </button>`
    : `<button type="button" class="ap-button stroked grey schedule-row__best-time" data-best-time="${escapeHtml(post.id)}">
        <i class="ap-icon-sparkles"></i>
        Best time
       </button>`;

  return `
    <div class="schedule-row" data-post-id="${escapeHtml(post.id)}">
      <div class="schedule-row__identity">
        ${platformBadgeHtml(post.platform)}
        <span class="schedule-row__account">${escapeHtml(post.authorName || post.platform)}</span>
        ${bestTimeBtn}
      </div>
      <div class="schedule-row__fields">
        <div class="ap-form-field schedule-row__date-field">
          <label for="sched-date-${escapeHtml(post.id)}">Date</label>
          <div class="ap-input-group">
            <input
              type="date"
              id="sched-date-${escapeHtml(post.id)}"
              data-sched-date="${escapeHtml(post.id)}"
              value="${escapeHtml(s.date || "")}"
            />
          </div>
        </div>
        <div class="ap-form-field schedule-row__time-field">
          <label for="sched-time-${escapeHtml(post.id)}">Time</label>
          <select
            class="ap-native-select"
            id="sched-time-${escapeHtml(post.id)}"
            data-sched-time="${escapeHtml(post.id)}"
          >
            <option value="" disabled${!s.time ? " selected" : ""}>— select —</option>
            ${timeOpts}
          </select>
        </div>
        <span class="schedule-row__tz" aria-label="Timezone">${escapeHtml(getTimezoneLabel())}</span>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------

function rerenderRow(postId) {
  const post = _posts.find((p) => p.id === postId);
  if (!post) return;
  const el = document.querySelector(`.schedule-row[data-post-id="${CSS.escape(postId)}"]`);
  if (!el) return;
  const tmp = document.createElement("div");
  tmp.innerHTML = postRowHtml(post);
  el.replaceWith(tmp.firstElementChild);
}

function refreshSubmitState() {
  const btn = document.getElementById("scheduleModalSubmit");
  if (!btn) return;
  const allSet = _posts.every((p) => {
    const s = getPostState(p.id);
    return s.date && s.time;
  });
  btn.disabled = !allSet;
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

function buildModalHtml() {
  return `
    <div class="ap-dialog-header">
      <h3 class="ap-dialog-title" id="scheduleModalTitle">Schedule</h3>
      <p class="ap-dialog-description" id="scheduleModalDesc"></p>
    </div>
    <button class="ap-dialog-close" type="button" id="scheduleModalClose" aria-label="Close">
      <i class="ap-icon-close"></i>
    </button>
    <div class="ap-dialog-content" id="scheduleModalBody"></div>
    <div class="ap-dialog-footer">
      <div class="ap-dialog-footer-right">
        <button type="button" class="ap-button ghost grey" id="scheduleModalCancel">Cancel</button>
        <button type="button" class="ap-button primary orange" id="scheduleModalSubmit" disabled>
          <i class="ap-icon-calendar"></i>
          Schedule
        </button>
      </div>
    </div>
  `;
}

let _bound = false;

function ensureModal() {
  if (document.getElementById("scheduleModal")) return;

  injectStyles();

  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.id = "scheduleModalBackdrop";

  const modal = document.createElement("aside");
  modal.className = "ap-dialog schedule-modal";
  modal.id = "scheduleModal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "scheduleModalTitle");
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = buildModalHtml();

  document.body.append(backdrop, modal);
  attachEvents();
  _bound = true;
}

function attachEvents() {
  const modal = document.getElementById("scheduleModal");
  const backdrop = document.getElementById("scheduleModalBackdrop");

  // Close triggers
  document.getElementById("scheduleModalClose").addEventListener("click", closeModal);
  document.getElementById("scheduleModalCancel").addEventListener("click", closeModal);
  backdrop.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
  });

  // Field changes
  modal.addEventListener("change", (e) => {
    const dateFor = e.target.dataset.schedDate;
    const timeFor = e.target.dataset.schedTime;
    if (dateFor) {
      setPostState(dateFor, { date: e.target.value });
      refreshSubmitState();
    }
    if (timeFor) {
      setPostState(timeFor, { time: e.target.value });
      refreshSubmitState();
    }
  });

  // Best time
  modal.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-best-time]");
    if (!btn || btn.disabled) return;
    const postId = btn.dataset.bestTime;
    setPostState(postId, { loading: true });
    rerenderRow(postId);
    try {
      const { date, time } = await getBestTime(postId);
      setPostState(postId, { date, time, loading: false });
    } catch {
      setPostState(postId, { loading: false });
    }
    rerenderRow(postId);
    refreshSubmitState();
  });

  // Confirm
  document.getElementById("scheduleModalSubmit").addEventListener("click", () => {
    const results = _posts
      .map((p) => {
        const s = getPostState(p.id);
        return { postId: p.id, date: s.date, time: s.time };
      })
      .filter((r) => r.date && r.time);

    if (typeof _onConfirm === "function") _onConfirm(results);
    closeModal();
  });
}

function openModal(posts, onConfirm) {
  _posts = posts;
  _postStates = [];
  _onConfirm = onConfirm || null;

  const body = document.getElementById("scheduleModalBody");
  const desc = document.getElementById("scheduleModalDesc");
  const modal = document.getElementById("scheduleModal");
  const backdrop = document.getElementById("scheduleModalBackdrop");

  desc.textContent = posts.length > 1 ? "Set a date and time for each post." : "";
  body.innerHTML = posts.map(postRowHtml).join("");

  refreshSubmitState();

  modal.setAttribute("aria-hidden", "false");
  modal.classList.add("open");
  backdrop.classList.add("open");

  // Focus first date input
  const firstDate = body.querySelector('input[type="date"]');
  if (firstDate) firstDate.focus();
}

function closeModal() {
  const modal = document.getElementById("scheduleModal");
  const backdrop = document.getElementById("scheduleModalBackdrop");
  if (!modal) return;
  modal.setAttribute("aria-hidden", "true");
  modal.classList.remove("open");
  backdrop.classList.remove("open");
  _onConfirm = null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Opens the Schedule Posts modal.
 *
 * @param {Array<{ id: string, platform: string, authorName?: string }>} posts
 *   The posts to schedule. Each must have at least `id` and `platform`.
 *
 * @param {(results: Array<{ postId: string, date: string, time: string }>) => void} [onConfirm]
 *   Called when the user clicks "Schedule" and all posts have a date + time.
 *   Receives an array of { postId, date (YYYY-MM-DD), time (HH:MM) }.
 *   Wire this to store.getState().schedulePosts(results.map(r => r.postId))
 *   or a new store action that accepts per-post datetimes.
 *
 * @example
 *   openScheduleModal(
 *     [{ id: 'post-1', platform: 'linkedin', authorName: 'Jordan Alvarez' }],
 *     (results) => store.getState().schedulePosts(results.map(r => r.postId))
 *   );
 */
export function openScheduleModal(posts, onConfirm) {
  ensureModal();
  openModal(posts, onConfirm);
}
