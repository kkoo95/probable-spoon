import { store, getActiveSession, getSessionUi, countIdeas } from "../store.js?v=15";
import { icons, escapeHtml, actionButton } from "../utils.js?v=17";
import { renderStrategyBriefView, renderContextDocumentView } from "./brief.js?v=17";
import { renderLibraryView } from "./library.js?v=17";
import { renderPostsView } from "./posts.js?v=17";

const workspaceContent = document.getElementById("workspaceContent");

export function renderStepPlaceholder(tab, session, ui) {
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

  const copy = {
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

export function renderWorkspace(state, session, ui) {
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
