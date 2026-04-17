import { store, getActiveSession, getSessionUi, validatePostDraft, getIdeaById } from "../store.js?v=15";
import { escapeHtml, icons, actionButton, iconButton, overflowMenu, generationPlatformCopy, formatText } from "../utils.js?v=17";

export function truncateWithSeeMore(text, maxLength) {
  if (!text || text.length <= maxLength) {
    return {
      text,
      truncated: false,
    };
  }

  const trimmed = text.slice(0, maxLength).trimEnd();
  const safe = trimmed.slice(0, Math.max(0, trimmed.lastIndexOf(" ")));
  return {
    text: (safe || trimmed) + "...",
    truncated: true,
  };
}

export function renderPostTextWithHashtags(text, hashtags, maxLength) {
  const truncated = truncateWithSeeMore(text || "", maxLength);
  const hashtagMarkup = hashtags.length
    ? '<div class="social-preview__hashtags">' +
      hashtags.map((hashtag) => '<span class="social-preview__hashtag">' + escapeHtml(hashtag) + "</span>").join(" ") +
      "</div>"
    : "";

  return (
    '<div class="social-preview__text">' +
    formatText(truncated.text) +
    (truncated.truncated ? ' <span class="social-preview__see-more">see more</span>' : "") +
    "</div>" +
    hashtagMarkup
  );
}

export function LinkedInPostPreview(post) {
  const engagement = post.metadata?.engagement || {};
  return (
    '<article class="social-preview social-preview--linkedin ' +
    (post.status === "generating" ? "is-generating" : "") +
    '"><div class="social-preview__frame">' +
    '<div class="linkedin-preview__header">' +
    '<div class="linkedin-preview__avatar-wrap">' +
    '<img class="social-preview__avatar" src="' + escapeHtml(post.author?.avatarUrl || "") + '" alt="' + escapeHtml(post.author?.name || "Author") + ' avatar" />' +
    '</div>' +
    '<div class="linkedin-preview__author">' +
    '<div class="linkedin-preview__author-row">' +
    '<span class="linkedin-preview__name">' + escapeHtml(post.author?.name || "Generating draft") + '</span>' +
    '<span class="linkedin-preview__connection">• 1st</span>' +
    '</div>' +
    '<div class="linkedin-preview__title">' + escapeHtml(post.author?.title || "Preparing author profile") + '</div>' +
    '<div class="linkedin-preview__timestamp">' + escapeHtml(post.metadata?.timestamp || "now") + ' • Public</div>' +
    '</div>' +
    '</div>' +
    '<div class="linkedin-preview__body">' +
    renderPostTextWithHashtags(post.content?.text || "", post.content?.hashtags || [], 420) +
    (post.content?.cta ? '<div class="linkedin-preview__cta">' + formatText(post.content.cta) + "</div>" : "") +
    '</div>' +
    // Image attachment zone — shows generated image or "Generate an image" CTA
    '<div class="linkedin-preview__image-zone">' +
    (post.imageUrl
      ? '<img class="linkedin-preview__attachment" src="' + escapeHtml(post.imageUrl) + '" alt="Generated image" />'
      : '<button type="button" class="linkedin-preview__image-cta" data-open-generate-image="' + post.id + '">' +
        '<i class="ap-icon-sparkles"></i>' +
        'Generate an image' +
        '</button>') +
    '</div>' +
    '<div class="linkedin-preview__stats">' +
    '<span class="linkedin-preview__reactions"><span class="linkedin-preview__reaction-emojis">👍 💡</span>' + (engagement.likes ?? 0) + '</span>' +
    '<span class="linkedin-preview__stats-right">' + (engagement.comments ?? 0) + ' comments · ' + (engagement.shares ?? 0) + ' reposts</span>' +
    '</div>' +
    '<div class="linkedin-preview__actions">' +
    '<button type="button">' + icons.socialLike + '<span>Like</span></button>' +
    '<button type="button">' + icons.socialComment + '<span>Comment</span></button>' +
    '<button type="button">' + icons.socialShare + '<span>Repost</span></button>' +
    '<button type="button">' + icons.socialSend + '<span>Send</span></button>' +
    '</div>' +
    '</div></article>'
  );
}

export const xIcons = {
  reply:    '<i class="ap-icon-reply"></i>',
  repost:   '<i class="ap-icon-repost"></i>',
  like:     '<i class="ap-icon-heart"></i>',
  views:    '<i class="ap-icon-bar-graph"></i>',
  bookmark: '<i class="ap-icon-bookmark"></i>',
};

export function TwitterPostPreview(post) {
  const engagement = post.metadata?.engagement || {};
  return (
    '<article class="social-preview social-preview--twitter ' +
    (post.status === "generating" ? "is-generating" : "") +
    '"><div class="social-preview__frame">' +
    '<div class="twitter-preview__header">' +
    '<img class="social-preview__avatar social-preview__avatar--sm" src="' + escapeHtml(post.author?.avatarUrl || "") + '" alt="' + escapeHtml(post.author?.name || "Author") + ' avatar" />' +
    '<div class="twitter-preview__content">' +
    '<div class="twitter-preview__author-line">' +
    '<span class="twitter-preview__name">' + escapeHtml(post.author?.name || "Generating draft") + '</span>' +
    '<span class="twitter-preview__handle">@' + escapeHtml(post.author?.handle || "publishing") + '</span>' +
    '<span class="twitter-preview__dot">·</span>' +
    '<span class="twitter-preview__timestamp">' + escapeHtml(post.metadata?.timestamp || "now") + '</span>' +
    '</div>' +
    '<div class="twitter-preview__body">' +
    renderPostTextWithHashtags(post.content?.text || "", post.content?.hashtags || [], 260) +
    (post.content?.cta ? '<div class="twitter-preview__cta">' + formatText(post.content.cta) + "</div>" : "") +
    '</div>' +
    '<div class="twitter-preview__actions">' +
    '<button type="button">' + xIcons.reply + '<span>' + (engagement.comments ?? 0) + '</span></button>' +
    '<button type="button">' + xIcons.repost + '<span>' + (engagement.reposts ?? engagement.shares ?? 0) + '</span></button>' +
    '<button type="button">' + xIcons.like + '<span>' + (engagement.likes ?? 0) + '</span></button>' +
    '<button type="button">' + xIcons.views + '<span>' + (engagement.views ?? 0) + '</span></button>' +
    '<button type="button" class="twitter-preview__bookmark">' + xIcons.bookmark + '</button>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div></article>'
  );
}

export function renderPlatformSelector(ui) {
  return (
    '<div class="platform-switch" aria-label="Post platform">' +
    '<button type="button" class="' +
    (ui.generationPlatform === "linkedin" ? "active" : "") +
    '" data-generation-platform="linkedin">LinkedIn</button>' +
    '<button type="button" class="' +
    (ui.generationPlatform === "twitter" ? "active" : "") +
    '" data-generation-platform="twitter">Twitter/X</button>' +
    "</div>"
  );
}

export function getPostById(session, postId) {
  return session.posts.find((post) => post.id === postId) || null;
}

export function postStatusPill(post) {
  if (post.status === "generating") {
    return '<span class="ap-status blue"><span class="dot"></span>Generating</span>';
  }
  if (post.status === "error") {
    return '<span class="ap-status red"><span class="dot"></span>Error</span>';
  }
  return '<span class="ap-status green"><span class="dot"></span>Draft ready</span>';
}

export function postWorkflowPill(post) {
  if (post.workflowState === "scheduled") {
    return '<span class="ap-status orange"><span class="dot"></span>Scheduled</span>';
  }
  if (post.workflowState === "prepared") {
    return '<span class="ap-status blue"><span class="dot"></span>Prepared</span>';
  }
  return "";
}

export function variantLabel(post) {
  return (
    {
      "proof-led": "Proof-led",
      "operator-note": "Operator note",
      "series-angle": "Series angle",
      "contrarian-hook": "Contrarian hook",
    }[post.variant] || "Variant"
  );
}

export function compactPostText(text, maxLength = 220) {
  return truncateWithSeeMore((text || "").replace(/\s+/g, " ").trim(), maxLength).text;
}

export function selectedPostsSummary(session, ui) {
  const selectedIds = ui.selectedPostIds || [];
  const selectedPosts = session.posts.filter((post) => selectedIds.includes(post.id));
  const invalidPosts = selectedPosts.filter((post) => validatePostDraft(post).length > 0);

  return {
    selectedPosts,
    invalidPosts,
    hasSelection: selectedPosts.length > 0,
    hasInvalidSelection: invalidPosts.length > 0,
  };
}

export function formatPostUpdatedLabel(post) {
  const stamp = post.updatedAt || post.createdAt;
  if (!stamp) return "Just updated";
  const formatter = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  });
  return "Updated " + formatter.format(new Date(stamp));
}

export function formatPostMeta(post) {
  const platform = generationPlatformCopy(post.platform || "linkedin").label;
  const meta = [platform, variantLabel(post), formatPostUpdatedLabel(post)];
  if (post.workflowState === "scheduled" && post.scheduledForLabel) {
    meta.push(post.scheduledForLabel);
  }
  return meta;
}

export function firstInvalidPostId(session) {
  return session.posts.find((post) => validatePostDraft(post).length > 0)?.id || null;
}

export function invalidPostsCount(session) {
  return session.posts.filter((post) => validatePostDraft(post).length > 0).length;
}

export function matchesPostsSearch(post, group, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  const haystack = [
    post.content?.text || "",
    post.content?.cta || "",
    post.author?.name || "",
    group.idea?.title || "",
    group.idea?.summary || "",
    group.source?.name || "",
    variantLabel(post),
    generationPlatformCopy(post.platform || "linkedin").label,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(normalized);
}

export function matchesPostsStatus(post, filter) {
  if (filter === "all") return true;
  if (filter === "needs_fixes") return validatePostDraft(post).length > 0;
  if (filter === "ready") return post.status === "ready" && post.workflowState === "draft" && validatePostDraft(post).length === 0;
  if (filter === "prepared") return post.workflowState === "prepared";
  if (filter === "scheduled") return post.workflowState === "scheduled";
  if (filter === "best") return !!post.aiSuggested;
  return true;
}

export function sortPosts(posts, sortValue) {
  return [...posts].sort((left, right) => {
    if (sortValue === "oldest") {
      return (left.updatedAt || left.createdAt || 0) - (right.updatedAt || right.createdAt || 0);
    }
    if (sortValue === "best") {
      if (!!right.aiSuggested !== !!left.aiSuggested) return Number(right.aiSuggested) - Number(left.aiSuggested);
      return (right.updatedAt || right.createdAt || 0) - (left.updatedAt || left.createdAt || 0);
    }
    if (sortValue === "platform") {
      return String(left.platform || "").localeCompare(String(right.platform || ""));
    }
    if (sortValue === "needs_fixes") {
      const leftIssues = validatePostDraft(left).length;
      const rightIssues = validatePostDraft(right).length;
      if (!!rightIssues !== !!leftIssues) return Number(Boolean(rightIssues)) - Number(Boolean(leftIssues));
      return (right.updatedAt || right.createdAt || 0) - (left.updatedAt || left.createdAt || 0);
    }
    return (right.updatedAt || right.createdAt || 0) - (left.updatedAt || left.createdAt || 0);
  });
}

export function groupPostsByIdea(session, ui) {
  const order = [];
  const groups = new Map();

  session.posts.forEach((post) => {
    const match = post.ideaId ? getIdeaById(post.ideaId) : null;
    const groupId = post.ideaId || "ungrouped";

    if (!groups.has(groupId)) {
      order.push(groupId);
      groups.set(groupId, {
        id: groupId,
        idea: match?.idea || null,
        source: match?.source || null,
        posts: [],
      });
    }

    groups.get(groupId).posts.push(post);
  });

  return order.map((groupId) => {
    const group = groups.get(groupId);
    group.posts = group.posts.filter((post) => {
      const statusMatch = matchesPostsStatus(post, ui.postsStatusFilter);
      const searchMatch = matchesPostsSearch(post, group, ui.postsSearch || "");
      const networkMatch = !ui.postsNetworkFilter || ui.postsNetworkFilter === "all" || post.platform === ui.postsNetworkFilter;
      return statusMatch && searchMatch && networkMatch;
    });
    group.posts = sortPosts(group.posts, ui.postsSort || "needs_fixes");
    return group;
  }).filter((group) => group.posts.length > 0);
}

export function buildPostsRailItems(session) {
  const posts = session.posts;
  return {
    views: [
      { id: "all-posts",       label: "All posts",   icon: "megaphone", count: posts.length, kind: "all" },
      { id: "needs-fixes",     label: "Needs fixes", icon: "error",     count: posts.filter((post) => validatePostDraft(post).length > 0).length, kind: "status", value: "needs_fixes" },
      { id: "scheduled-posts", label: "Scheduled",   icon: "calendar",  count: posts.filter((post) => post.workflowState === "scheduled").length, kind: "status", value: "scheduled" },
    ],
    networks: [
      { id: "network-all", label: "All", count: posts.length, kind: "network", value: "all" },
      { id: "network-linkedin", label: "LinkedIn", count: posts.filter((post) => post.platform === "linkedin").length, kind: "network", value: "linkedin" },
      { id: "network-twitter", label: "X", count: posts.filter((post) => post.platform === "twitter").length, kind: "network", value: "twitter" },
    ],
  };
}

export function filterChips(ui) {
  const chips = [];
  if (ui.postsNetworkFilter !== "all") chips.push(generationPlatformCopy(ui.postsNetworkFilter).label);
  if (ui.postsStatusFilter !== "all") {
    chips.push(
      {
        needs_fixes: "Needs fixes",
        ready: "Ready",
        prepared: "Prepared",
        scheduled: "Scheduled",
      }[ui.postsStatusFilter] || ui.postsStatusFilter,
    );
  }
  if (ui.postsShowSelectedOnly) chips.push("Selected only");
  if ((ui.postsSearch || "").trim()) chips.push('Search: "' + ui.postsSearch.trim() + '"');
  return chips;
}

export function postsWorkspaceViewLabel(ui) {
  const parts = [ui.postsNetworkFilter === "all" ? "All networks" : generationPlatformCopy(ui.postsNetworkFilter).shortLabel];
  if (ui.postsStatusFilter !== "all") {
    parts.push(
      {
        needs_fixes: "Needs fixes",
        ready: "Ready",
        prepared: "Prepared",
        scheduled: "Scheduled",
      }[ui.postsStatusFilter] || ui.postsStatusFilter,
    );
  }
  if (ui.postsShowSelectedOnly) parts.push("Selected only");
  return parts.join(" · ");
}

export function renderDraftCard(post, ui, isBestDraft) {
  const preview = post.platform === "twitter" ? TwitterPostPreview(post) : LinkedInPostPreview(post);
  const selected = (ui.selectedPostIds || []).includes(post.id);
  const issues = validatePostDraft(post);
  const hasIssues = issues.length > 0;
  const canSchedule = !hasIssues && post.status === "ready";
  const statusLabel = hasIssues ? "Needs fixes" : post.workflowState === "scheduled" ? "Scheduled" : "Ready";
  const meta = formatPostMeta(post);
  const issuesBanner = issues.length
    ? '<div class="ap-infobox error has-title">' +
      icons.error +
      '<div class="ap-infobox-content"><div class="ap-infobox-texts">' +
      '<span class="ap-infobox-title">Needs fixes before scheduling</span>' +
      '<span class="ap-infobox-message">' +
      issues.map((issue) => escapeHtml(issue)).join(" · ") +
      "</span></div></div></div>"
    : "";

  return (
    '<article class="post-review-item ' +
    (selected ? "selected " : "") +
    (post.status === "generating" ? "is-generating " : "") +
    (hasIssues ? "has-errors " : "") +
    '" id="post-review-' +
    post.id +
    '">' +
    '<label class="post-review-item__check"><input type="checkbox" class="checkbox" data-post-select="' +
    post.id +
    '" ' +
    (selected ? "checked" : "") +
    ' /><span class="sr-only">Select post</span></label>' +
    '<div class="post-review-card"><div class="post-review-card__body"><div class="post-review-card__preview-stack">' +
    issuesBanner +
    '<div class="post-review-card__preview">' +
    preview +
    "</div></div><div class=\"post-review-card__floating-actions\">" +
    iconButton({
      label: "Edit post",
      icon: icons.pencil,
      attrs: 'data-edit-post="' + post.id + '"',
      stroked: true,
    }) +
    iconButton({
      label: "Generate image",
      icon: icons.sparkles,
      attrs: 'data-generate-image-btn="' + post.id + '"',
      stroked: true,
    }) +
    iconButton({
      label: canSchedule ? "Schedule post" : "Post needs fixes before scheduling",
      icon: icons.calendar,
      attrs: 'data-schedule-post="' + post.id + '"',
      stroked: true,
      disabled: !canSchedule,
    }) +
    iconButton({
      label: "Duplicate post",
      icon: icons.copy,
      attrs: 'data-duplicate-post="' + post.id + '"',
      stroked: true,
    }) +
    iconButton({
      label: "Delete post",
      icon: icons.trash,
      attrs: 'data-delete-post="' + post.id + '"',
      stroked: true,
      color: "red",
    }) +
    "</div></div>" +
    "</div></article>"
  );
}

export function renderIdeaPostGroup(group, ui) {
  const bestDraftId = group.posts.find((post) => post.aiSuggested)?.id || group.posts[0]?.id || null;
  const invalidCount = group.posts.filter((post) => validatePostDraft(post).length > 0).length;
  const isCollapsed = (ui.postsCollapsedGroupIds || []).includes(group.id);

  return (
    '<section class="idea-post-group" id="posts-group-' +
    group.id +
    '"><div class="idea-post-group__header"><div class="idea-post-group__copy"><h3>' +
    escapeHtml(group.idea?.title || "Generated drafts") +
    '</h3>' +
    (group.source?.name ? '<div class="idea-post-group__source">' + escapeHtml(group.source.name) + '</div>' : '') +
    '</div><div class="idea-post-group__meta"><span>' +
    group.posts.length +
    " posts</span>" +
    (invalidCount ? '<span class="idea-post-group__meta-divider">•</span><span>' + invalidCount + " need fixes</span>" : "") +
    "</div>" +
    iconButton({
      label: isCollapsed ? "Expand group" : "Collapse group",
      icon: isCollapsed ? icons.chevronDown : icons.chevronUp,
      attrs: 'data-toggle-posts-group="' + group.id + '"',
    }) +
    "</div>" +
    (isCollapsed ? "" :
    '<div class="idea-post-group__rows">' +
    group.posts.map((post) => renderDraftCard(post, ui, post.id === bestDraftId)).join("") +
    "</div>") +
    "</section>"
  );
}

export function renderPostsRail(session, ui) {
  const railItems = buildPostsRailItems(session);
  const activeView = ui.postsActiveRailView;

  const renderItem = (item) =>
    '<button type="button" class="posts-rail__item' +
    (activeView === item.id ? " active" : "") +
    '" data-posts-rail-item="' + item.id +
    '" data-posts-rail-kind="' + item.kind +
    '" data-posts-rail-value="' + (item.value || "") + '">' +
    (item.icon ? '<i class="ap-icon-' + item.icon + ' posts-rail__item-icon" aria-hidden="true"></i>' : '') +
    '<span class="posts-rail__item-label">' + escapeHtml(item.label) + "</span>" +
    '<span class="posts-rail__item-count">' + item.count + "</span>" +
    "</button>";

  return (
    '<nav class="posts-rail">' +
    '<div class="posts-rail__group">' +
    railItems.views.map(renderItem).join("") +
    "</div>" +
    '<div class="posts-rail__divider"></div>' +
    '<div class="posts-rail__section-label">Network</div>' +
    '<div class="posts-rail__group">' +
    railItems.networks.map(renderItem).join("") +
    "</div>" +
    "</nav>"
  );
}

export function renderPostsErrorSummary(session) {
  const count = invalidPostsCount(session);
  const firstInvalidId = firstInvalidPostId(session);
  if (!count || !firstInvalidId) return "";

  return (
    '<div class="ap-infobox error has-title posts-error-summary">' +
    "<i aria-hidden=\"true\">" + icons.error + "</i>" +
    '<div class="ap-infobox-content">' +
    '<div class="ap-infobox-texts">' +
    '<span class="ap-infobox-title">' +
    count + " post" + (count > 1 ? "s" : "") + " need fixes" +
    '</span>' +
    '<span class="ap-infobox-message">Fix validation issues before scheduling.</span>' +
    '</div>' +
    actionButton({
      style: "stroked",
      color: "grey",
      label: "Jump to errors",
      attrs: 'data-jump-to-errors="' + firstInvalidId + '"',
    }) +
    "</div></div>"
  );
}

export function renderPostsSelectionBar(session, ui) {
  const summary = selectedPostsSummary(session, ui);
  const count = summary.selectedPosts.length;
  if (!summary.hasSelection) return "";

  const allSelected = count === session.posts.length;
  const indeterminate = count > 0 && !allSelected;
  const disableSchedule = summary.hasInvalidSelection;

  return (
    '<div class="posts-toolbar">' +
    // Left — select-all checkbox + count
    '<label class="posts-toolbar__select-all">' +
    '<input type="checkbox" class="posts-toolbar__checkbox" data-select-all-posts' +
    (allSelected ? ' checked' : '') +
    (indeterminate ? ' data-indeterminate' : '') +
    ' aria-label="Select all posts" />' +
    '</label>' +
    '<span class="posts-toolbar__count">' + count + ' post' + (count > 1 ? 's' : '') + ' selected</span>' +
    '<div class="posts-toolbar__spacer"></div>' +
    // Right — actions
    actionButton({
      style: "primary",
      color: "orange",
      label: "Schedule",
      attrs: 'data-schedule-selected-posts="true"',
      disabled: disableSchedule,
    }) +
    '<button type="button" class="ap-icon-button red" data-delete-selected-posts="true" aria-label="Delete selected posts" title="Delete selected">' +
    '<i class="ap-icon-trash"></i>' +
    '</button>' +
    '<button type="button" class="ap-icon-button" data-clear-post-selection="true" aria-label="Clear selection" title="Clear selection">' +
    '<i class="ap-icon-close"></i>' +
    '</button>' +
    '</div>'
  );
}

export function renderPostsView(session, ui) {
  if (!session.posts.length) {
    return (
      '<section class="tab-panel"><section class="step-layout"><div class="posts-review-header"><div class="posts-review-header__copy"><h1>Review posts before scheduling</h1><p>Fix issues and schedule your posts</p></div></div><div class="empty-state"><div class="icon">' +
      icons.megaphone +
      '</div><h3 style="margin-top: 18px; color: var(--ref-color-grey-150)">No posts to review yet</h3><p>Generate posts from Library, then come back here to fix issues and schedule them fast.</p>' +
      actionButton({
        style: "primary",
        color: "orange",
        label: "Open Library",
        attrs: 'data-open-library-posts-empty="true"',
      }) +
      "</div></section></section>"
    );
  }

  const ideaGroups = groupPostsByIdea(session, ui);
  return (
    '<section class="tab-panel">' +
    '<div class="posts-layout">' +
    renderPostsRail(session, ui) +
    '<div class="posts-content"><section class="step-layout">' +
    '<div class="posts-review-header"><div class="posts-review-header__copy"><h1>Review posts before scheduling</h1><p>Fix issues and schedule your posts</p></div><div class="posts-review-header__meta"><span>' +
    session.posts.length +
    " posts</span></div></div>" +
    renderPostsErrorSummary(session) +
    '<div class="posts-main">' +
    renderPostsSelectionBar(session, ui) +
    '<div class="posts-workflow">' +
    ideaGroups.map((group) => renderIdeaPostGroup(group, ui)).join("") +
    (ideaGroups.length === 0
      ? '<div class="empty-state"><div class="icon">' +
        icons.megaphone +
        '</div><h3 style="margin-top: 18px; color: var(--ref-color-grey-150)">No posts available in this view</h3><p>Clear any active filters or generate a fresh draft from Library.</p></div>'
      : "") +
    "</div></div></section></div>" +
    "</div>" +
    "</section>"
  );
}
