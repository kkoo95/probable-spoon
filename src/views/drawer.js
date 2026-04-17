import { store, getActiveSession, getSessionUi, getIdeaById } from "../store.js?v=15";
import { escapeHtml, generationPlatformCopy } from "../utils.js?v=17";

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

export function initDrawer() {
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
}

export function renderDrawer(state, session) {
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
