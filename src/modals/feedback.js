/**
 * feedback-modal.js — "Give feedback" dialog.
 * Self-contained: injects HTML, binds events, exports render().
 */
import { store } from "../store.js?v=15";

let backdrop, modal, textArea, featureArea, submitBtn;

const HTML = `
<div class="modal-backdrop" id="feedbackBackdrop"></div>
<aside
  class="ap-dialog feedback-modal"
  id="feedbackModal"
  role="dialog"
  aria-modal="true"
  aria-labelledby="feedbackTitle"
  aria-hidden="true"
>
  <div class="ap-dialog-header">
    <h2 class="ap-dialog-title" id="feedbackTitle">Give more feedback</h2>
  </div>
  <button class="ap-dialog-close" type="button" id="closeFeedbackBtn" aria-label="Close">
    <i class="ap-icon-close"></i>
  </button>
  <div class="ap-dialog-content">
    <p class="feedback-modal__intro">We read every piece of feedback sent through this form. If you require a response or urgent support please <a href="mailto:support@agorapulse.com">contact our support team</a> instead.</p>

    <div class="ap-field">
      <label for="feedbackFeatureArea">Feature area</label>
      <select id="feedbackFeatureArea" class="ap-native-select">
        <option value="content-studio">Content Studio</option>
        <option value="library">Library</option>
        <option value="posts">Posts</option>
        <option value="brief">Brief</option>
        <option value="voice">Voice</option>
        <option value="brand">Brand Theme</option>
        <option value="other">Other</option>
      </select>
    </div>

    <div class="ap-field">
      <label for="feedbackText">Write a feedback</label>
      <textarea class="ap-textarea" id="feedbackText" placeholder="Write your feedback here..." rows="5"></textarea>
    </div>

    <p class="feedback-modal__thank-you">Thank you so much for your feedback, we will take it into account in the continuous improvements of our product!</p>
  </div>
  <div class="ap-dialog-footer">
    <div class="ap-dialog-footer-right">
      <button type="button" class="ap-button ghost grey" id="cancelFeedbackBtn">Cancel</button>
      <button type="button" class="ap-button primary orange" id="submitFeedbackBtn">Send feedback</button>
    </div>
  </div>
  <div class="feedback-modal__success">
    <div class="feedback-modal__success-icon">
      <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor"><path fill-rule="evenodd" d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"/></svg>
    </div>
    <h3>Thanks for your feedback!</h3>
    <p>We read every message and use it to improve Content Studio.</p>
  </div>
</aside>`;

function close() {
  store.getState().closeFeedbackModal();
}

function reset() {
  modal.classList.remove("success");
  textArea.value = "";
  textArea.classList.remove("invalid");
  featureArea.value = "content-studio";
  submitBtn.disabled = false;
  submitBtn.textContent = "Send feedback";
}

export function init() {
  document.body.insertAdjacentHTML("beforeend", HTML);

  backdrop = document.getElementById("feedbackBackdrop");
  modal = document.getElementById("feedbackModal");
  textArea = document.getElementById("feedbackText");
  featureArea = document.getElementById("feedbackFeatureArea");
  submitBtn = document.getElementById("submitFeedbackBtn");

  document.getElementById("openFeedbackBtn").addEventListener("click", () => {
    store.getState().openFeedbackModal();
    window.setTimeout(() => textArea.focus(), 50);
  });

  document.getElementById("closeFeedbackBtn").addEventListener("click", close);
  document.getElementById("cancelFeedbackBtn").addEventListener("click", close);
  backdrop.addEventListener("click", close);

  submitBtn.addEventListener("click", async () => {
    const text = textArea.value.trim();
    if (!text) {
      textArea.classList.add("invalid");
      textArea.focus();
      return;
    }
    textArea.classList.remove("invalid");
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    await new Promise((r) => setTimeout(r, 1200));
    modal.classList.add("success");
    setTimeout(close, 2500);
  });

  textArea.addEventListener("input", () => {
    if (textArea.value.trim()) textArea.classList.remove("invalid");
  });
}

export function render(state) {
  const open = state.feedbackModal.open;
  backdrop.classList.toggle("open", open);
  modal.classList.toggle("open", open);
  modal.setAttribute("aria-hidden", open ? "false" : "true");
  if (!open) reset();
}
