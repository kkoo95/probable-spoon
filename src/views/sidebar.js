import { store, getActiveSession, getSessionUi, sortSessions } from "../store.js?v=15";
import {
  escapeHtml,
  formatText,
  icons,
  actionButton,
  iconButton,
  overflowMenu,
  assistantModeCopy,
  generationPlatformCopy,
} from "../utils.js?v=17";

import { countIdeas } from "../store.js?v=15";

const sessionSwitcher = document.getElementById("sessionSwitcher");
const workflowTabs = document.getElementById("workflowTabs");
const assistantPanel = document.getElementById("assistantPanel");
const assistantThread = document.getElementById("assistantThread");
const assistantPromptDeck = document.getElementById("assistantPromptDeck");
const assistantInput = document.getElementById("assistantInput");
const assistantModeLabel = document.getElementById("assistantModeLabel");
const sourceTypeTabs = document.getElementById("sourceTypeTabs");
const assistantSend = document.getElementById("assistantSend");

export function filterSessionsBySearch(list, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return list;
  return list.filter(
    (session) =>
      session.name.toLowerCase().includes(normalized) ||
      session.updatedAtLabel.toLowerCase().includes(normalized) ||
      String(session.sources.length).includes(normalized),
  );
}

export function sessionActionItem(label, action, sessionId, destructive = false) {
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

export function sessionOverflowMenu(session) {
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

export function renderSessionBar(state, session) {
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

export function renderWorkflowTabs(currentTab) {
  [...workflowTabs.querySelectorAll("[data-tab]")].forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === currentTab);
  });
}

export function messageActionButtons(message) {
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

export function messageMarkup(message) {
  if (message.role === "system") {
    return (
      '<div class="ai-notice">' +
      '<button class="ai-notice__toggle" type="button" aria-expanded="false">' +
      '<span class="ai-notice__label">' +
      escapeHtml(message.meta) +
      "</span>" +
      '<span class="ai-notice__chevron"><i class="ap-icon-chevron-down"></i></span>' +
      "</button>" +
      '<div class="ai-notice__detail">' +
      '<span class="ai-notice__text">' +
      escapeHtml(message.text) +
      "</span>" +
      "</div>" +
      "</div>"
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

export function assistantPromptList(ui) {
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

export function renderSidebar(state, session, ui) {
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
      '<span>AI copilot</span></span></div><div class="assistant-turn__content">Create a work session to unlock persistent chat, session-specific ideas, and post drafts.</div></div>';
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
          text: "I can pressure-test ideas, compare angles, and draft the next post for " + session.name + ".",
          status: "ready",
          ideaId: session.sources.flatMap((source) => source.ideas).find((idea) => idea.pinned)?.id || null,
        },
      ];

  assistantThread.innerHTML = messages.map(messageMarkup).join("");
  assistantPromptDeck.innerHTML = assistantPromptList(ui).join("");
}
