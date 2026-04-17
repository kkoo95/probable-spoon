import { getActiveSession, getSessionUi, store } from "./store.js?v=15";

import { hydrateStaticIcons, assistantModeCopy } from "./utils.js?v=17";
import { getPostById } from "./views/posts.js?v=17";
import { openScheduleModal } from "./modals/schedule.js?v=17";
import { openGenerateImageModal } from "./modals/generate-image.js?v=17";
import { init as initSessionModal, render as renderSessionModal } from "./modals/session.js?v=17";
import { init as initFeedbackModal, render as renderFeedbackModal } from "./modals/feedback.js?v=17";
import { init as initBugReportModal, render as renderBugReportModal } from "./modals/bug-report.js?v=17";
import { renderSidebar, renderSessionBar, renderWorkflowTabs } from "./views/sidebar.js?v=17";
import { renderWorkspace } from "./views/workspace.js?v=17";
import { initDrawer, renderDrawer } from "./views/drawer.js?v=17";

const sessionSwitcher = document.getElementById("sessionSwitcher");
const workflowTabs = document.getElementById("workflowTabs");
const assistantPanel = document.getElementById("assistantPanel");
const assistantInput = document.getElementById("assistantInput");
const workspaceContent = document.getElementById("workspaceContent");

let briefAutoSaveTimer = 0;

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
    store.getState().handleSessionAction(sessionAction.dataset.sessionAction, sessionAction.dataset.sessionId);
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
        .addSystemMessage(
          assistantModeCopy(ui.assistantMode).dropTitle + ". New source inputs stay attached to this session.",
          "Source intake",
        );
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
  const genImgBtn = event.target.closest("[data-generate-image-btn]");
  const genPostId = (genImgZone || genImgBtn)?.dataset.openGenerateImage || genImgBtn?.dataset.generateImageBtn;
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
    store.getState().openBriefEntryComposer(editEntry.dataset.sectionId, editEntry.dataset.editEntry);
    return;
  }

  const deleteEntry = event.target.closest("[data-delete-entry]");
  if (deleteEntry) {
    store.getState().deleteBriefEntry(deleteEntry.dataset.sectionId, deleteEntry.dataset.deleteEntry);
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
    const _ids = _ui?.selectedPostIds || [];
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

// Init modals + drawer (inject HTML + bind events)
initSessionModal();
initFeedbackModal();
initBugReportModal();
initDrawer();

store.subscribe(renderApp);

hydrateStaticIcons();
renderApp();
