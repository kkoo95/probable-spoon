/**
 * session-modal.js — "Create / Rename session" dialog.
 * Self-contained: injects HTML, binds events, exports render().
 */
import { store } from "../store.js?v=15";

let backdrop, modal, titleEl, nameInput, saveBtn;
let lastSignature = "";

const HTML = `
<div class="modal-backdrop" id="sessionModalBackdrop"></div>
<aside
  class="ap-dialog session-modal"
  id="sessionModal"
  role="dialog"
  aria-modal="true"
  aria-labelledby="sessionModalTitle"
  aria-describedby="sessionModalDescription"
  aria-hidden="true"
>
  <div class="ap-dialog-header">
    <h3 class="ap-dialog-title" id="sessionModalTitle">Create a new session</h3>
    <p class="ap-dialog-description" id="sessionModalDescription">Name the working context that will keep your library, brief, voice, brand theme, and posts together.</p>
  </div>
  <button class="ap-dialog-close" type="button" id="closeSessionModal" aria-label="Close session modal">
    <i class="ap-icon-close"></i>
  </button>
  <div class="ap-dialog-content">
    <label class="session-field">
      <span>Session name</span>
      <input id="sessionNameInput" type="text" placeholder="Q2 B2B Social Growth" />
    </label>
    <p class="session-modal__hint">A session groups your library, brief, voice, brand theme, and posts into one working context.</p>
  </div>
  <div class="ap-dialog-footer">
    <div class="ap-dialog-footer-right">
      <button type="button" class="ap-button ghost grey" id="cancelSessionModal">Cancel</button>
      <button type="button" class="ap-button primary orange" id="saveSessionModal">Save session</button>
    </div>
  </div>
</aside>`;

function save() {
  store.getState().saveSession(nameInput.value);
}

function close() {
  store.getState().closeSessionModal();
}

export function init() {
  document.body.insertAdjacentHTML("beforeend", HTML);

  backdrop = document.getElementById("sessionModalBackdrop");
  modal = document.getElementById("sessionModal");
  titleEl = document.getElementById("sessionModalTitle");
  nameInput = document.getElementById("sessionNameInput");
  saveBtn = document.getElementById("saveSessionModal");

  saveBtn.addEventListener("click", save);
  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") save();
  });
  document.getElementById("closeSessionModal").addEventListener("click", close);
  document.getElementById("cancelSessionModal").addEventListener("click", close);
  backdrop.addEventListener("click", close);
}

export function render(state) {
  const open = state.sessionModal.open;
  backdrop.classList.toggle("open", open);
  modal.classList.toggle("open", open);
  backdrop.style.display = open ? "block" : "none";
  modal.style.display = open ? "flex" : "none";
  modal.setAttribute("aria-hidden", open ? "false" : "true");

  if (!open) {
    lastSignature = "";
    return;
  }

  const signature = state.sessionModal.mode + ":" + (state.sessionModal.editingSessionId || "");
  const session = state.sessionModal.editingSessionId
    ? state.sessions.find((s) => s.id === state.sessionModal.editingSessionId)
    : null;

  titleEl.textContent = state.sessionModal.mode === "rename" ? "Rename session" : "Create a new session";
  saveBtn.textContent = state.sessionModal.mode === "rename" ? "Save changes" : "Save session";

  if (signature !== lastSignature) {
    nameInput.value = session ? session.name : "";
    window.setTimeout(() => {
      try {
        nameInput.focus({ preventScroll: true });
      } catch {
        nameInput.focus();
      }
    }, 0);
    lastSignature = signature;
  }
}
