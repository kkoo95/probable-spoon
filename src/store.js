import { createStore } from "../vendor/zustand-vanilla.js";

import {
  buildMockPostDraft,
  mockGenerateAssistantReply,
  mockGeneratePost,
  mockRefineStrategyBrief,
} from "./mock-generators.js";

const STORAGE_KEY = "bigbet-library-prototype-v2";

function createSeedPost({
  sessionId,
  sourceId,
  ideaId,
  platform,
  variant,
  createdAt,
  workflowState = "draft",
  aiSuggested = false,
  scheduledForLabel = "",
  sessionName,
  sourceName,
  ideaTitle,
  ideaSummary,
  overrides = {},
}) {
  const draft = buildMockPostDraft({
    session: { id: sessionId, name: sessionName },
    source: { id: sourceId, name: sourceName },
    idea: { id: ideaId, title: ideaTitle, summary: ideaSummary },
    platform,
    variant,
    workflowState,
    aiSuggested,
  });
  return {
    id: createId("post"),
    ideaId,
    sourceId,
    status: "ready",
    createdAt: Date.parse(createdAt),
    updatedAt: Date.parse(createdAt),
    scheduledForLabel,
    ...draft,
    ...overrides,
    content: { ...draft.content, ...(overrides.content || {}) },
  };
}

function seedPostsForGrowthSession() {
  return [
    createSeedPost({
      sessionId: "session-q2-growth",
      sourceId: "source-growth-guide",
      ideaId: "idea-01",
      platform: "linkedin",
      variant: "proof-led",
      createdAt: "2026-04-03T08:20:00",
      aiSuggested: true,
      sessionName: "Q2 B2B Social Growth",
      sourceName: "B2B Social Growth Playbook Q2.pdf",
      ideaTitle: "Turn long-form reports into weekly audience proof points",
      ideaSummary:
        "The PDF repeatedly emphasizes how audience trust rises when brands publish one concrete learning per week instead of one massive campaign wrap-up at the end of the quarter.",
    }),
    createSeedPost({
      sessionId: "session-q2-growth",
      sourceId: "source-growth-guide",
      ideaId: "idea-01",
      platform: "linkedin",
      variant: "operator-note",
      createdAt: "2026-04-03T07:50:00",
      workflowState: "prepared",
      sessionName: "Q2 B2B Social Growth",
      sourceName: "B2B Social Growth Playbook Q2.pdf",
      ideaTitle: "Turn long-form reports into weekly audience proof points",
      ideaSummary:
        "The PDF repeatedly emphasizes how audience trust rises when brands publish one concrete learning per week instead of one massive campaign wrap-up at the end of the quarter.",
    }),
    createSeedPost({
      sessionId: "session-q2-growth",
      sourceId: "source-growth-guide",
      ideaId: "idea-01",
      platform: "linkedin",
      variant: "series-angle",
      createdAt: "2026-04-02T16:15:00",
      sessionName: "Q2 B2B Social Growth",
      sourceName: "B2B Social Growth Playbook Q2.pdf",
      ideaTitle: "Turn long-form reports into weekly audience proof points",
      ideaSummary:
        "The PDF repeatedly emphasizes how audience trust rises when brands publish one concrete learning per week instead of one massive campaign wrap-up at the end of the quarter.",
      overrides: { content: { cta: "" } },
    }),
    createSeedPost({
      sessionId: "session-q2-growth",
      sourceId: "source-growth-guide",
      ideaId: "idea-02",
      platform: "linkedin",
      variant: "contrarian-hook",
      createdAt: "2026-04-02T12:10:00",
      aiSuggested: true,
      sessionName: "Q2 B2B Social Growth",
      sourceName: "B2B Social Growth Playbook Q2.pdf",
      ideaTitle: "Build a recurring 'what changed this month' content series",
      ideaSummary:
        "A strong pattern in the document is change tracking. The extracted idea is to create a lightweight monthly format that summarizes shifts in customer behavior, platform trends, or performance baselines.",
    }),
    createSeedPost({
      sessionId: "session-q2-growth",
      sourceId: "source-growth-guide",
      ideaId: "idea-02",
      platform: "linkedin",
      variant: "series-angle",
      createdAt: "2026-04-02T11:25:00",
      workflowState: "scheduled",
      scheduledForLabel: "Tomorrow, 9:00 AM",
      sessionName: "Q2 B2B Social Growth",
      sourceName: "B2B Social Growth Playbook Q2.pdf",
      ideaTitle: "Build a recurring 'what changed this month' content series",
      ideaSummary:
        "A strong pattern in the document is change tracking. The extracted idea is to create a lightweight monthly format that summarizes shifts in customer behavior, platform trends, or performance baselines.",
    }),
  ];
}

const seedSessions = [
  {
    id: "session-q2-growth",
    name: "Q2 B2B Social Growth",
    archived: false,
    updatedAtTs: Date.parse("2026-04-03T09:14:00"),
    updatedAtLabel: "Updated Apr 3, 2026",
    messages: [],
    posts: seedPostsForGrowthSession(),
    sources: [
      {
        id: "source-growth-guide",
        name: "B2B Social Growth Playbook Q2.pdf",
        type: "pdf",
        importedAt: "Apr 1, 2026",
        status: "processed",
        strength: "strong",
        ideas: [
          {
            id: "idea-01",
            title: "Turn long-form reports into weekly audience proof points",
            summary:
              "The PDF repeatedly emphasizes how audience trust rises when brands publish one concrete learning per week instead of one massive campaign wrap-up at the end of the quarter.",
            priority: "high",
            confidence: 94,
            pinned: true,
          },
          {
            id: "idea-02",
            title: "Build a recurring 'what changed this month' content series",
            summary:
              "A strong pattern in the document is change tracking. The extracted idea is to create a lightweight monthly format that summarizes shifts in customer behavior, platform trends, or performance baselines.",
            priority: "high",
            confidence: 91,
            pinned: false,
          },
          {
            id: "idea-03",
            title: "Package customer interviews into opinion-led educational posts",
            summary:
              "Several sections advocate using customer language as the basis for educational content. This idea could support post generation, short carousels, and FAQ-style thought leadership.",
            priority: "medium",
            confidence: 83,
            pinned: false,
          },
          {
            id: "idea-04",
            title: "Create a benchmark post from underused performance tables",
            summary:
              "The extraction surfaced hidden benchmark material in appendix tables. Those tables can become punchy social content if reframed around one surprising comparison and one takeaway.",
            priority: "medium",
            confidence: 78,
            pinned: false,
          },
          {
            id: "idea-05",
            title: "Convert the framework chapter into a 5-part campaign arc",
            summary:
              "Rather than publishing one condensed summary, the system identified a sequential narrative structure that could map directly to a multi-post campaign with escalating depth.",
            priority: "low",
            confidence: 72,
            pinned: false,
          },
          {
            id: "idea-06",
            title: "Use the glossary as a fast evergreen content bank",
            summary:
              "The glossary section contains repeated niche terms with clear explanations, which makes it a good source for evergreen educational snippets or onboarding-oriented posts.",
            priority: "low",
            confidence: 68,
            pinned: false,
          },
        ],
      },
      {
        id: "source-ai-trends",
        name: "AI Buyer Signals Digest.pdf",
        type: "pdf",
        importedAt: "Mar 28, 2026",
        status: "processing",
        strength: "moderate",
        ideas: [
          {
            id: "idea-07",
            title: "Publish a myth-vs-reality thread on AI buying readiness",
            summary:
              "Early extraction batches keep highlighting a gap between self-reported adoption and operational readiness, which can become a high-performing myth-busting format.",
            priority: "high",
            confidence: 86,
            pinned: false,
          },
        ],
      },
    ],
  },
  {
    id: "session-ceo-thoughts",
    name: "CEO Thought Leadership Sprint",
    archived: false,
    updatedAtTs: Date.parse("2026-04-02T16:20:00"),
    updatedAtLabel: "Updated Apr 2, 2026",
    messages: [],
    posts: [],
    sources: [
      {
        id: "source-newsletter",
        name: "Founder Newsletter Archive",
        type: "url",
        importedAt: "Mar 22, 2026",
        status: "processed",
        strength: "moderate",
        ideas: [],
      },
    ],
  },
  {
    id: "session-launch",
    name: "Product Launch Campaign",
    archived: false,
    updatedAtTs: Date.parse("2026-03-30T10:00:00"),
    updatedAtLabel: "Updated Mar 30, 2026",
    messages: [],
    posts: [],
    sources: [],
  },
  {
    id: "session-archive-partner",
    name: "Partner Case Study Sprint",
    archived: true,
    updatedAtTs: Date.parse("2026-03-19T11:00:00"),
    updatedAtLabel: "Archived Mar 19, 2026",
    messages: [],
    posts: [],
    sources: [
      {
        id: "source-failed",
        name: "Partner Case Study Bundle.pdf",
        type: "pdf",
        importedAt: "Mar 19, 2026",
        status: "failed",
        strength: "weak",
        ideas: [],
      },
    ],
  },
];

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function formatDate(ts) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(ts);
}

function createId(prefix) {
  return prefix + "-" + Math.random().toString(36).slice(2, 10);
}

function touchSession(session, prefix = "Updated") {
  session.updatedAtTs = Date.now();
  session.updatedAtLabel = prefix + " " + formatDate(session.updatedAtTs);
}

function structuredBriefEntry({
  key,
  label,
  type = "text",
  value = "",
  items = [],
  placeholder = "",
  source = "seed",
  locked = false,
  editable = true,
}) {
  return {
    id: createId("brief-entry"),
    key: key || label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    label,
    type,
    value,
    items,
    placeholder,
    editable,
    source,
    locked,
    lastUpdated: Date.now(),
  };
}

function createStrategySection({
  key,
  title,
  icon,
  collapsed = true,
  entries = [],
}) {
  return {
    id: createId("brief-section"),
    key,
    title,
    icon,
    collapsed,
    entries,
  };
}

function strategySectionTemplates(mode = "default") {
  const isEmpty = mode === "empty";

  return [
    createStrategySection({
      key: "goals",
      title: "Goals",
      icon: "megaphone",
      collapsed: false,
      entries: [
        structuredBriefEntry({
          key: "primary-objective",
          label: "Primary objective",
          type: "textarea",
          value: isEmpty
            ? ""
            : "Turn one flagship PDF into a month of proof-led LinkedIn posts for B2B growth operators.",
          placeholder: "State the main result this content should drive.",
        }),
        structuredBriefEntry({
          key: "secondary-objectives",
          label: "Secondary objectives",
          type: "list",
          items: isEmpty
            ? []
            : [
                "Clarify the weekly content narrative.",
                "Give AI enough signal to generate sharper drafts.",
                "Keep the strategy reusable across future campaigns.",
              ],
          placeholder: "One objective per line.",
        }),
        structuredBriefEntry({
          key: "target-actions",
          label: "Target actions",
          type: "chips",
          items: isEmpty ? [] : ["Visit website", "Book demo", "Follow for insights"],
          placeholder: "Add one action per line or separated by commas.",
        }),
      ],
    }),
    createStrategySection({
      key: "audience",
      title: "Audience",
      icon: "multipleUsers",
      collapsed: false,
      entries: [
        structuredBriefEntry({
          key: "target-segments",
          label: "Target segments",
          type: "list",
          items: isEmpty
            ? []
            : [
                "Heads of marketing at B2B SaaS teams.",
                "Social leads building a repeatable publishing cadence.",
                "Content operators turning research into practical posts.",
              ],
          placeholder: "List the audiences this brief should serve.",
        }),
        structuredBriefEntry({
          key: "core-pain-points",
          label: "Core pain points",
          type: "list",
          items: isEmpty
            ? []
            : [
                "Too much source material, not enough publishable angles.",
                "Inconsistent brand voice across drafts.",
                "Weak connection between content and pipeline goals.",
              ],
          placeholder: "Capture the recurring frictions the audience feels.",
        }),
        structuredBriefEntry({
          key: "desired-outcomes",
          label: "Desired outcomes",
          type: "list",
          items: isEmpty
            ? []
            : [
                "Faster content production.",
                "More useful and credible posts.",
                "A strategy that compounds trust over time.",
              ],
          placeholder: "Describe what success looks like for the audience.",
        }),
      ],
    }),
    createStrategySection({
      key: "content-strategy",
      title: "Content Strategy",
      icon: "library",
      collapsed: true,
      entries: [
        structuredBriefEntry({
          key: "content-pillars",
          label: "Content pillars",
          type: "list",
          items: isEmpty
            ? []
            : [
                "Proof-led education -> Turn research into one useful takeaway per post.",
                "Operator insight -> Share practical notes that feel field-tested.",
                "Performance signals -> Reuse benchmarks, trends, and patterns that sharpen decisions.",
              ],
          placeholder: "Use 'pillar -> description' when useful.",
        }),
        structuredBriefEntry({
          key: "key-topics",
          label: "Key topics / angles",
          type: "chips",
          items: isEmpty ? [] : ["content repurposing", "buyer signals", "weekly proof points", "AI workflow"],
          placeholder: "Add one topic per line or separated by commas.",
        }),
        structuredBriefEntry({
          key: "content-types",
          label: "Content types",
          type: "chips",
          items: isEmpty ? [] : ["educational", "product-led", "thought leadership"],
          placeholder: "Examples: educational, product-led, thought leadership.",
        }),
      ],
    }),
    createStrategySection({
      key: "brand-voice",
      title: "Brand Voice",
      icon: "sparkles",
      collapsed: true,
      entries: [
        structuredBriefEntry({
          key: "tone",
          label: "Tone",
          type: "text",
          value: isEmpty ? "" : "Operator-led, sharp, practical, and confident without sounding inflated.",
          placeholder: "Describe the core tone in one line.",
        }),
        structuredBriefEntry({
          key: "style",
          label: "Style",
          type: "chips",
          items: isEmpty ? [] : ["data-aware", "actionable", "concise", "specific"],
          placeholder: "Add style markers separated by commas or new lines.",
        }),
        structuredBriefEntry({
          key: "dos",
          label: "Do",
          type: "list",
          items: isEmpty
            ? []
            : [
                "Lead with one concrete insight.",
                "Use examples that feel current and believable.",
                "Keep every line easy to skim.",
              ],
          placeholder: "List writing moves to repeat.",
        }),
        structuredBriefEntry({
          key: "donts",
          label: "Don't",
          type: "list",
          items: isEmpty
            ? []
            : [
                "Hide the takeaway behind jargon.",
                "Sound generic or over-polished.",
                "Stack multiple ideas in the same post.",
              ],
          placeholder: "List the things the brand should avoid.",
        }),
      ],
    }),
    createStrategySection({
      key: "cta-conversion",
      title: "CTA & Conversion",
      icon: "link",
      collapsed: true,
      entries: [
        structuredBriefEntry({
          key: "primary-ctas",
          label: "Primary CTAs",
          type: "cta",
          items: isEmpty
            ? []
            : [
                { label: "Book demo", url: "https://example.com/demo" },
                { label: "Start trial", url: "https://example.com/trial" },
              ],
          placeholder: "Use one line per CTA: Label | URL",
        }),
        structuredBriefEntry({
          key: "secondary-ctas",
          label: "Secondary CTAs",
          type: "cta",
          items: isEmpty
            ? []
            : [
                { label: "Read the guide", url: "https://example.com/guide" },
                { label: "Explore templates", url: "https://example.com/templates" },
              ],
          placeholder: "Use one line per CTA: Label | URL",
        }),
      ],
    }),
    createStrategySection({
      key: "constraints",
      title: "Constraints & Preferences",
      icon: "calendar",
      collapsed: true,
      entries: [
        structuredBriefEntry({
          key: "platforms",
          label: "Platforms",
          type: "chips",
          items: isEmpty ? [] : ["LinkedIn", "X", "Instagram"],
          placeholder: "List the priority channels.",
        }),
        structuredBriefEntry({
          key: "posting-frequency",
          label: "Posting frequency",
          type: "text",
          value: isEmpty ? "" : "3 to 5 posts per week",
          placeholder: "Define the expected publishing cadence.",
        }),
        structuredBriefEntry({
          key: "content-length",
          label: "Content length preferences",
          type: "text",
          value: isEmpty ? "" : "Short-form first. One clear idea per post. Strong first line.",
          placeholder: "Describe the preferred content density or format.",
        }),
        structuredBriefEntry({
          key: "specific-requirements",
          label: "Specific requirements",
          type: "list",
          items: isEmpty
            ? []
            : [
                "Avoid filler and soft intros.",
                "Include stats when they are credible.",
                "Keep the copy easy to edit downstream.",
              ],
          placeholder: "Add non-negotiables and formatting preferences.",
        }),
      ],
    }),
    createStrategySection({
      key: "context-signals",
      title: "Context Signals",
      icon: "sparklesMermaid",
      collapsed: true,
      entries: [
        structuredBriefEntry({
          key: "observed-topics",
          label: "Observed topics",
          type: "chips",
          value: "",
          items: isEmpty ? [] : ["strategy brief", "AI reuse", "content systems"],
          placeholder: "Auto-generated from repeated themes and recent activity.",
          source: "ai",
        }),
        structuredBriefEntry({
          key: "best-performing-patterns",
          label: "Best performing patterns",
          type: "list",
          items: isEmpty ? [] : ["Proof-first hooks", "One insight per post", "Specific CTA language"],
          placeholder: "Auto-generated from performance or repeated wins.",
          source: "ai",
        }),
        structuredBriefEntry({
          key: "recurrent-themes",
          label: "Recurrent themes",
          type: "chips",
          items: isEmpty ? [] : ["clarity", "reusability", "execution"],
          placeholder: "Auto-generated from recurring prompts and edits.",
          source: "ai",
        }),
        structuredBriefEntry({
          key: "ai-confidence",
          label: "AI confidence level",
          type: "text",
          value: isEmpty ? "" : "Medium",
          placeholder: "Low, Medium, or High.",
          source: "ai",
        }),
      ],
    }),
  ];
}

function createEmptyStrategyBrief() {
  return {
    id: createId("strategy-brief"),
    sections: strategySectionTemplates("empty"),
  };
}

function createDefaultStrategyBrief() {
  return {
    id: createId("strategy-brief"),
    sections: strategySectionTemplates("default"),
  };
}

function normalizeBriefItems(type, value) {
  if (type === "cta") {
    return Array.isArray(value)
      ? value
          .map((item) => ({
            label: typeof item?.label === "string" ? item.label.trim() : "",
            url: typeof item?.url === "string" ? item.url.trim() : "",
          }))
          .filter((item) => item.label || item.url)
      : [];
  }

  if (type === "list" || type === "chips") {
    return Array.isArray(value)
      ? value.map((item) => String(item).trim()).filter(Boolean)
      : [];
  }

  return [];
}

function normalizeBriefEntry(entry) {
  const type = entry?.type || (Array.isArray(entry?.items) ? "list" : "textarea");
  return {
    id: createId("brief-entry"),
    key: "",
    label: "",
    type,
    value: "",
    items: [],
    placeholder: "",
    editable: true,
    source: "seed",
    locked: false,
    lastUpdated: Date.now(),
    ...entry,
    value: typeof entry?.value === "string" ? entry.value : "",
    items: normalizeBriefItems(type, entry?.items),
  };
}

function normalizeBriefSection(section) {
  return {
    id: createId("brief-section"),
    key: "",
    title: "Untitled section",
    icon: "note",
    collapsed: true,
    entries: [],
    ...section,
    entries: (section.entries || []).map(normalizeBriefEntry),
  };
}

function serializeBriefEntry(entry) {
  const type = entry?.type || "text";

  if (type === "cta") {
    return (entry.items || [])
      .map((item) => [item.label, item.url].filter(Boolean).join(" | "))
      .join("\n");
  }

  if (type === "list" || type === "chips") {
    return (entry.items || []).join("\n");
  }

  return entry.value || "";
}

function parseBriefComposerValue(type, rawValue) {
  const source = (rawValue || "").trim();

  if (type === "cta") {
    return {
      value: "",
      items: source
        ? source
            .split(/\n+/)
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
              const [label, ...urlParts] = line.split("|").map((part) => part.trim());
              return { label: label || "", url: urlParts.join("|").trim() };
            })
            .filter((item) => item.label || item.url)
        : [],
    };
  }

  if (type === "list" || type === "chips") {
    const items = source
      ? source
          .split(/\n|,/)
          .map((item) => item.trim())
          .filter(Boolean)
      : [];
    return { value: "", items };
  }

  return { value: source, items: [] };
}

function defaultVoiceSections() {
  return [
    {
      id: createId("voice-section"),
      title: "Tone Markers",
      icon: "headset",
      entries: [
        {
          id: createId("voice-entry"),
          label: "Core tone",
          value: "Sound like an experienced operator sharing what actually worked, not a brand reciting a manifesto.",
        },
        {
          id: createId("voice-entry"),
          label: "Energy level",
          value: "Clear and assertive. Strong opinions are welcome when they are backed by examples or evidence.",
        },
      ],
    },
    {
      id: createId("voice-section"),
      title: "Writing Rules",
      icon: "note",
      entries: [
        {
          id: createId("voice-entry"),
          label: "Sentence style",
          value: "Use short, readable sentences with one idea per paragraph and a concrete takeaway early.",
        },
        {
          id: createId("voice-entry"),
          label: "Avoid",
          value: "Buzzwords, filler intros, empty superlatives, and claims that are not anchored in source material.",
        },
      ],
    },
    {
      id: createId("voice-section"),
      title: "Audience Calibration",
      icon: "multipleUsers",
      entries: [
        {
          id: createId("voice-entry"),
          label: "Assumed sophistication",
          value: "Write for experienced B2B marketers who understand the problem space but want sharper framing and usable examples.",
        },
      ],
    },
  ];
}

function defaultBrandThemeSections() {
  return [
    {
      id: createId("brand-section"),
      title: "Core Message",
      icon: "sparkles",
      entries: [
        {
          id: createId("brand-entry"),
          label: "Positioning",
          value: "Make complex source material feel actionable fast by turning research into clear operating signals.",
        },
        {
          id: createId("brand-entry"),
          label: "Why it matters",
          value: "The brand should feel useful and credible, helping teams move from information overload to confident execution.",
        },
      ],
    },
    {
      id: createId("brand-section"),
      title: "Proof Points",
      icon: "fileText",
      entries: [
        {
          id: createId("brand-entry"),
          label: "Evidence style",
          value: "Lead with benchmarks, observed patterns, customer language, and practical before-and-after framing.",
        },
      ],
    },
    {
      id: createId("brand-section"),
      title: "Visual Direction",
      icon: "library",
      entries: [
        {
          id: createId("brand-entry"),
          label: "Look and feel",
          value: "Editorial, clean, and modern. Favor highlighted proof, sharp contrast, and one memorable idea per asset.",
        },
      ],
    },
  ];
}

function normalizeContextEntry(entry, prefix) {
  return {
    id: createId(prefix + "-entry"),
    label: "",
    value: "",
    ...entry,
  };
}

function normalizeContextSection(section, prefix, fallbackTitle, fallbackIcon) {
  return {
    id: createId(prefix + "-section"),
    title: fallbackTitle,
    icon: fallbackIcon,
    entries: [],
    ...section,
    entries: (section.entries || []).map((entry) => normalizeContextEntry(entry, prefix)),
  };
}

function normalizeContextDocument(value, prefix, fallbackSections) {
  if (!value || !Array.isArray(value.sections)) {
    return {
      id: createId(prefix),
      sections: fallbackSections(),
    };
  }

  return {
    id: value.id || createId(prefix),
    sections: value.sections.map((section) =>
      normalizeContextSection(
        section,
        prefix,
        prefix === "voice-profile" ? "Voice section" : "Brand section",
        prefix === "voice-profile" ? "headset" : "sparkles",
      ),
    ),
  };
}

function normalizeVoiceProfile(voiceProfile) {
  return normalizeContextDocument(voiceProfile, "voice-profile", defaultVoiceSections);
}

function normalizeBrandTheme(brandTheme) {
  return normalizeContextDocument(brandTheme, "brand-theme", defaultBrandThemeSections);
}

function normalizeStrategyBrief(strategyBrief, fallback = "default") {
  if (!strategyBrief || !Array.isArray(strategyBrief.sections)) {
    return fallback === "empty" ? createEmptyStrategyBrief() : createDefaultStrategyBrief();
  }

  const normalizedSections = strategyBrief.sections.map(normalizeBriefSection);
  const hasEntries = normalizedSections.some((section) =>
    section.entries.some((entry) => {
      if (entry.type === "cta") {
        return entry.items.some((item) => item.label || item.url);
      }
      if (entry.type === "list" || entry.type === "chips") {
        return entry.items.length > 0;
      }
      return Boolean((entry.value || "").trim());
    }),
  );
  const looksLikeDefaultScaffold =
    normalizedSections.length >= 4 &&
    normalizedSections.every((section) =>
      [
        "Goals",
        "Audience",
        "Content Strategy",
        "Brand Voice",
        "CTA & Conversion",
        "Constraints & Preferences",
        "Context Signals",
      ].includes(section.title),
    );

  if (!hasEntries && looksLikeDefaultScaffold) {
    return {
      id: strategyBrief.id || createId("strategy-brief"),
      sections:
        fallback === "empty"
          ? createEmptyStrategyBrief().sections.map(normalizeBriefSection)
          : createDefaultStrategyBrief().sections.map(normalizeBriefSection),
    };
  }

  return {
    id: strategyBrief.id || createId("strategy-brief"),
    sections: normalizedSections,
  };
}

function createBriefComposer(mode, values = {}) {
  return {
    mode,
    sectionId: null,
    entryId: null,
    title: "",
    label: "",
    type: "text",
    rawValue: "",
    placeholder: "",
    ...values,
  };
}

function buildUiForSession(session) {
  return {
    query: "",
    selectedIdeaIds: [],
    selectedPostIds: [],
    postsSearch: "",
    postsShowSelectedOnly: false,
    postsNetworkFilter: "all",
    postsStatusFilter: "all",
    postsSort: "needs_fixes",
    postsCollapsedGroupIds: [],
    postsActiveRailView: "all-posts",
    openSourceIds: session.sources[0] ? [session.sources[0].id] : [],
    assistantMode: "pdf",
    generationPlatform: "linkedin",
    assistantDraft: "",
    pendingChat: false,
    pendingIdeaActions: {},
    briefComposer: null,
    pendingBriefRefine: false,
  };
}

function buildUiBySession(sessions) {
  return sessions.reduce((accumulator, session) => {
    accumulator[session.id] = buildUiForSession(session);
    return accumulator;
  }, {});
}

function normalizeIdea(idea) {
  return {
    pinned: false,
    ...idea,
  };
}

function normalizeSession(session) {
  return {
    messages: [],
    posts: [],
    ...session,
    strategyBrief: normalizeStrategyBrief(session.strategyBrief),
    voiceProfile: normalizeVoiceProfile(session.voiceProfile),
    brandTheme: normalizeBrandTheme(session.brandTheme),
    sources: (session.sources || []).map((source) => ({
      ideas: [],
      ...source,
      ideas: (source.ideas || []).map(normalizeIdea),
    })),
  };
}

function normalizeState(candidate) {
  const fallbackSessions = deepClone(seedSessions).map(normalizeSession);
  const fallbackUi = buildUiBySession(fallbackSessions);

  if (!candidate || !Array.isArray(candidate.sessions) || candidate.sessions.length === 0) {
    return {
      sessions: fallbackSessions,
      activeSessionId: fallbackSessions[0]?.id || null,
      currentTab: "library",
      activeIdeaId: null,
      sessionModal: { open: false, mode: "create", editingSessionId: null },
      bugReportModal: { open: false },
      feedbackModal: { open: false },
      sessionSearch: "",
      sessionSwitcherOpen: false,
      uiBySession: fallbackUi,
    };
  }

  const sessions = candidate.sessions.map(normalizeSession);
  const uiBySession = { ...fallbackUi };
  sessions.forEach((session) => {
    const persistedUi = candidate.uiBySession?.[session.id];
    uiBySession[session.id] = {
      ...buildUiForSession(session),
      ...(persistedUi || {}),
      selectedIdeaIds: Array.isArray(persistedUi?.selectedIdeaIds) ? persistedUi.selectedIdeaIds : [],
      selectedPostIds: Array.isArray(persistedUi?.selectedPostIds) ? persistedUi.selectedPostIds : [],
      postsSearch: persistedUi?.postsSearch || "",
      postsShowSelectedOnly: Boolean(persistedUi?.postsShowSelectedOnly),
      postsNetworkFilter: persistedUi?.postsNetworkFilter || "all",
      postsStatusFilter: persistedUi?.postsStatusFilter || "all",
      postsSort: persistedUi?.postsSort || "needs_fixes",
      postsCollapsedGroupIds: Array.isArray(persistedUi?.postsCollapsedGroupIds)
        ? persistedUi.postsCollapsedGroupIds
        : [],
      postsActiveRailView: persistedUi?.postsActiveRailView || "all-posts",
      openSourceIds: Array.isArray(persistedUi?.openSourceIds)
        ? persistedUi.openSourceIds
        : buildUiForSession(session).openSourceIds,
      pendingChat: false,
      pendingIdeaActions: {},
      briefComposer: null,
      pendingBriefRefine: false,
    };
  });

  const activeSessionId = sessions.some((session) => session.id === candidate.activeSessionId)
    ? candidate.activeSessionId
    : sessions[0]?.id || null;

  return {
    sessions,
    activeSessionId,
    currentTab: candidate.currentTab || "library",
    activeIdeaId: candidate.activeIdeaId || null,
    sessionModal: { open: false, mode: "create", editingSessionId: null },
    bugReportModal: { open: false },
    feedbackModal: { open: false },
    sessionSearch: candidate.sessionSearch || "",
    sessionSwitcherOpen: false,
    uiBySession,
  };
}

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return normalizeState(raw ? JSON.parse(raw) : null);
  } catch {
    return normalizeState(null);
  }
}

function findSession(sessions, sessionId) {
  return sessions.find((session) => session.id === sessionId) || null;
}

function findIdeaInSession(session, ideaId) {
  for (const source of session.sources) {
    const idea = source.ideas.find((item) => item.id === ideaId);
    if (idea) return { session, source, idea };
  }
  return null;
}

function recommendedVariantLabel(index) {
  return ["proof-led", "operator-note", "series-angle", "contrarian-hook"][index % 4];
}

function rebalanceIdeaRecommendations(session, ideaId) {
  const relatedPosts = session.posts.filter((post) => post.ideaId === ideaId);
  if (!relatedPosts.length) return;

  const preferred = relatedPosts
    .filter((post) => post.status === "ready")
    .sort((left, right) => (right.updatedAt || right.createdAt || 0) - (left.updatedAt || left.createdAt || 0))[0];
  const recommendedId = preferred?.id || relatedPosts[0]?.id || null;

  session.posts = session.posts.map((post) =>
    post.ideaId === ideaId
      ? {
          ...post,
          aiSuggested: post.id === recommendedId,
        }
      : post,
  );
}

function scheduleLabelForSelection(count = 1) {
  return count > 1 ? "Next available publishing slots" : "Tomorrow, 9:00 AM";
}

function withSession(state, sessionId, updater) {
  return state.sessions.map((session) => {
    if (session.id !== sessionId) return session;
    updater(session);
    return session;
  });
}

function persistState(state) {
  const payload = {
    sessions: state.sessions,
    activeSessionId: state.activeSessionId,
    currentTab: state.currentTab,
    activeIdeaId: state.activeIdeaId,
    sessionSearch: state.sessionSearch,
    uiBySession: Object.fromEntries(
      Object.entries(state.uiBySession).map(([sessionId, ui]) => [
        sessionId,
        {
          query: ui.query,
          selectedIdeaIds: ui.selectedIdeaIds,
          selectedPostIds: ui.selectedPostIds,
          postsSearch: ui.postsSearch,
          postsShowSelectedOnly: ui.postsShowSelectedOnly,
          postsNetworkFilter: ui.postsNetworkFilter,
          postsStatusFilter: ui.postsStatusFilter,
          postsSort: ui.postsSort,
          postsCollapsedGroupIds: ui.postsCollapsedGroupIds,
          postsActiveRailView: ui.postsActiveRailView,
          openSourceIds: ui.openSourceIds,
          assistantMode: ui.assistantMode,
          generationPlatform: ui.generationPlatform,
          assistantDraft: ui.assistantDraft,
          pendingBriefRefine: false,
        },
      ]),
    ),
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function validationLengthLimit(platform) {
  return platform === "twitter" ? 280 : 700;
}

export function validatePostDraft(post) {
  const issues = [];
  const text = (post.content?.text || "").trim();
  const cta = (post.content?.cta || "").trim();
  const platform = post.platform || "linkedin";
  const combinedLength = [text, (post.content?.hashtags || []).join(" "), cta].filter(Boolean).join(" ").length;

  if (!text) {
    issues.push("Draft is missing post copy.");
  }

  if (combinedLength > validationLengthLimit(platform)) {
    issues.push(
      platform === "twitter"
        ? "Post exceeds X recommended length."
        : "Post exceeds LinkedIn recommended length.",
    );
  }

  if (!cta) {
    issues.push("Draft is missing a CTA.");
  }

  if (platform === "twitter" && (post.content?.hashtags || []).length > 3) {
    issues.push("Too many hashtags for X formatting.");
  }

  return issues;
}

const initialState = loadState();

export const store = createStore((set, get) => ({
  ...initialState,

  setCurrentTab(tab) {
    set({ currentTab: tab });
  },

  setSessionSearch(value) {
    set({ sessionSearch: value, sessionSwitcherOpen: true });
  },

  toggleSessionSwitcher(force) {
    set((state) => ({
      sessionSwitcherOpen: typeof force === "boolean" ? force : !state.sessionSwitcherOpen,
    }));
  },

  switchSession(sessionId) {
    set({ activeSessionId: sessionId, sessionSwitcherOpen: false, activeIdeaId: null });
  },

  openSessionModal(mode, sessionId = null) {
    set({
      sessionSwitcherOpen: false,
      sessionModal: {
        open: true,
        mode,
        editingSessionId: sessionId,
      },
    });
  },

  closeSessionModal() {
    set({
      sessionModal: {
        open: false,
        mode: "create",
        editingSessionId: null,
      },
    });
  },

  openBugReportModal() {
    set({ bugReportModal: { open: true } });
  },

  closeBugReportModal() {
    set({ bugReportModal: { open: false } });
  },

  openFeedbackModal() {
    set({ feedbackModal: { open: true } });
  },

  closeFeedbackModal() {
    set({ feedbackModal: { open: false } });
  },

  saveSession(name) {
    const value = name.trim();
    if (!value) return;

    set((state) => {
      if (state.sessionModal.mode === "rename" && state.sessionModal.editingSessionId) {
        const sessions = deepClone(state.sessions);
        const session = findSession(sessions, state.sessionModal.editingSessionId);
        if (session) {
          session.name = value;
          touchSession(session);
        }
        return {
          sessions,
          sessionModal: { open: false, mode: "create", editingSessionId: null },
        };
      }

      const newSession = normalizeSession({
        id: createId("session"),
        name: value,
        archived: false,
        updatedAtTs: Date.now(),
        updatedAtLabel: "Updated " + formatDate(Date.now()),
        messages: [],
        posts: [],
        sources: [],
      });

      return {
        sessions: [newSession, ...state.sessions],
        activeSessionId: newSession.id,
        uiBySession: {
          ...state.uiBySession,
          [newSession.id]: buildUiForSession(newSession),
        },
        sessionModal: { open: false, mode: "create", editingSessionId: null },
      };
    });
  },

  duplicateSession(sessionId) {
    set((state) => {
      const original = findSession(deepClone(state.sessions), sessionId);
      if (!original) return state;

      const ideaMap = new Map();
      const postMap = new Map();
      const messageMap = new Map();

      original.id = createId("session");
      original.name = original.name + " Copy";
      original.archived = false;
      original.sources.forEach((source) => {
        source.id = createId("source");
        source.ideas.forEach((idea) => {
          const nextId = createId("idea");
          ideaMap.set(idea.id, nextId);
          idea.id = nextId;
        });
      });
      original.posts = original.posts.map((post) => {
        const nextId = createId("post");
        postMap.set(post.id, nextId);
        return {
          ...post,
          id: nextId,
          ideaId: post.ideaId ? ideaMap.get(post.ideaId) || null : null,
        };
      });
      original.messages = original.messages.map((message) => {
        const nextId = createId("message");
        messageMap.set(message.id, nextId);
        return {
          ...message,
          id: nextId,
          ideaId: message.ideaId ? ideaMap.get(message.ideaId) || null : null,
        };
      });
      touchSession(original);

      return {
        sessions: [original, ...state.sessions],
        activeSessionId: original.id,
        uiBySession: {
          ...state.uiBySession,
          [original.id]: buildUiForSession(original),
        },
      };
    });
  },

  handleSessionAction(action, sessionId) {
    if (action === "rename") {
      get().openSessionModal("rename", sessionId);
      return;
    }
    if (action === "duplicate") {
      get().duplicateSession(sessionId);
      return;
    }

    set((state) => {
      const sessions = deepClone(state.sessions);
      const session = findSession(sessions, sessionId);
      if (!session) return state;

      if (action === "archive") {
        session.archived = true;
        touchSession(session, "Archived");
      }

      if (action === "restore") {
        session.archived = false;
        touchSession(session);
      }

      let nextActiveSessionId = state.activeSessionId;
      let nextUiBySession = state.uiBySession;

      if (action === "delete") {
        const filteredSessions = sessions.filter((item) => item.id !== sessionId);
        nextUiBySession = { ...state.uiBySession };
        delete nextUiBySession[sessionId];
        nextActiveSessionId =
          filteredSessions.find((item) => !item.archived)?.id ||
          filteredSessions[0]?.id ||
          null;
        return {
          sessions: filteredSessions,
          activeSessionId: nextActiveSessionId,
          uiBySession: nextUiBySession,
          activeIdeaId: state.activeIdeaId,
        };
      }

      if (action === "archive" && state.activeSessionId === sessionId) {
        nextActiveSessionId =
          sessions.find((item) => !item.archived && item.id !== sessionId)?.id ||
          sessions.find((item) => item.id !== sessionId)?.id ||
          null;
      }

      if (action === "restore") {
        nextActiveSessionId = sessionId;
      }

      return {
        sessions,
        activeSessionId: nextActiveSessionId,
      };
    });
  },

  setAssistantMode(mode) {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    set((state) => ({
      uiBySession: {
        ...state.uiBySession,
        [sessionId]: {
          ...state.uiBySession[sessionId],
          assistantMode: mode,
        },
      },
    }));
  },

  setGenerationPlatform(platform) {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    set((state) => ({
      uiBySession: {
        ...state.uiBySession,
        [sessionId]: {
          ...state.uiBySession[sessionId],
          generationPlatform: platform,
        },
      },
    }));
  },

  setAssistantDraft(value) {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    set((state) => ({
      uiBySession: {
        ...state.uiBySession,
        [sessionId]: {
          ...state.uiBySession[sessionId],
          assistantDraft: value,
        },
      },
    }));
  },

  setSessionQuery(value) {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    set((state) => ({
      uiBySession: {
        ...state.uiBySession,
        [sessionId]: {
          ...state.uiBySession[sessionId],
          query: value,
        },
      },
    }));
  },

  toggleSource(sourceId) {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    set((state) => {
      const ui = state.uiBySession[sessionId];
      const openSourceIds = ui.openSourceIds.includes(sourceId)
        ? ui.openSourceIds.filter((id) => id !== sourceId)
        : [...ui.openSourceIds, sourceId];

      return {
        uiBySession: {
          ...state.uiBySession,
          [sessionId]: {
            ...ui,
            openSourceIds,
          },
        },
      };
    });
  },

  toggleIdeaSelection(ideaId, checked) {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    set((state) => {
      const ui = state.uiBySession[sessionId];
      const selectedIdeaIds = checked
        ? Array.from(new Set([...ui.selectedIdeaIds, ideaId]))
        : ui.selectedIdeaIds.filter((id) => id !== ideaId);

      return {
        uiBySession: {
          ...state.uiBySession,
          [sessionId]: {
            ...ui,
            selectedIdeaIds,
          },
        },
      };
    });
  },

  clearSelectedIdeas() {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    set((state) => ({
      uiBySession: {
        ...state.uiBySession,
        [sessionId]: {
          ...state.uiBySession[sessionId],
          selectedIdeaIds: [],
        },
      },
    }));
  },

  togglePostSelection(postId, checked) {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    set((state) => {
      const ui = state.uiBySession[sessionId];
      const selectedPostIds = checked
        ? Array.from(new Set([...(ui.selectedPostIds || []), postId]))
        : (ui.selectedPostIds || []).filter((id) => id !== postId);

      return {
        uiBySession: {
          ...state.uiBySession,
          [sessionId]: {
            ...ui,
            selectedPostIds,
            postsShowSelectedOnly: selectedPostIds.length ? ui.postsShowSelectedOnly : false,
          },
        },
      };
    });
  },

  clearSelectedPosts() {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    set((state) => ({
      uiBySession: {
        ...state.uiBySession,
        [sessionId]: {
          ...state.uiBySession[sessionId],
          selectedPostIds: [],
          postsShowSelectedOnly: false,
        },
      },
    }));
  },

  selectAllPosts() {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    const session = get().sessions.find((s) => s.id === sessionId);
    if (!session) return;
    const allIds = session.posts.map((p) => p.id);
    set((state) => ({
      uiBySession: {
        ...state.uiBySession,
        [sessionId]: {
          ...state.uiBySession[sessionId],
          selectedPostIds: allIds,
        },
      },
    }));
  },

  setPostImage(postId, imageUrl) {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id !== sessionId ? s : {
          ...s,
          posts: s.posts.map((p) =>
            p.id !== postId ? p : { ...p, imageUrl }
          ),
        }
      ),
    }));
  },

  setPostsSearch(value) {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    set((state) => ({
      uiBySession: {
        ...state.uiBySession,
        [sessionId]: {
          ...state.uiBySession[sessionId],
          postsSearch: value,
        },
      },
    }));
  },

  togglePostsShowSelectedOnly(force) {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    set((state) => {
      const current = Boolean(state.uiBySession[sessionId].postsShowSelectedOnly);
      return {
        uiBySession: {
          ...state.uiBySession,
          [sessionId]: {
            ...state.uiBySession[sessionId],
            postsShowSelectedOnly: typeof force === "boolean" ? force : !current,
          },
        },
      };
    });
  },

  setPostsNetworkFilter(value, railView = null) {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    set((state) => ({
      uiBySession: {
        ...state.uiBySession,
        [sessionId]: {
          ...state.uiBySession[sessionId],
          postsNetworkFilter: value,
          postsActiveRailView: railView || state.uiBySession[sessionId].postsActiveRailView,
        },
      },
    }));
  },

  resetPostsWorkspaceFilters() {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    set((state) => ({
      uiBySession: {
        ...state.uiBySession,
        [sessionId]: {
          ...state.uiBySession[sessionId],
          postsSearch: "",
          postsShowSelectedOnly: false,
          postsNetworkFilter: "all",
          postsStatusFilter: "all",
          postsSort: "needs_fixes",
          postsActiveRailView: "all-posts",
        },
      },
    }));
  },

  setPostsStatusFilter(value, railView = null) {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    set((state) => ({
      uiBySession: {
        ...state.uiBySession,
        [sessionId]: {
          ...state.uiBySession[sessionId],
          postsStatusFilter: value,
          postsActiveRailView: railView || state.uiBySession[sessionId].postsActiveRailView,
        },
      },
    }));
  },

  setPostsSort(value) {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    set((state) => ({
      uiBySession: {
        ...state.uiBySession,
        [sessionId]: {
          ...state.uiBySession[sessionId],
          postsSort: value,
        },
      },
    }));
  },

  setPostsActiveRailView(value) {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    set((state) => ({
      uiBySession: {
        ...state.uiBySession,
        [sessionId]: {
          ...state.uiBySession[sessionId],
          postsActiveRailView: value,
        },
      },
    }));
  },

  togglePostsGroupCollapsed(groupId) {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    set((state) => {
      const ui = state.uiBySession[sessionId];
      const collapsed = (ui.postsCollapsedGroupIds || []).includes(groupId)
        ? (ui.postsCollapsedGroupIds || []).filter((id) => id !== groupId)
        : [...(ui.postsCollapsedGroupIds || []), groupId];

      return {
        uiBySession: {
          ...state.uiBySession,
          [sessionId]: {
            ...ui,
            postsCollapsedGroupIds: collapsed,
          },
        },
      };
    });
  },

  selectVisiblePosts(postIds) {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    set((state) => ({
      uiBySession: {
        ...state.uiBySession,
        [sessionId]: {
          ...state.uiBySession[sessionId],
          selectedPostIds: Array.from(new Set([...(state.uiBySession[sessionId].selectedPostIds || []), ...postIds])),
          postsShowSelectedOnly: state.uiBySession[sessionId].postsShowSelectedOnly,
        },
      },
    }));
  },

  updatePost(postId, updates) {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    set((state) => {
      const sessions = deepClone(state.sessions);
      const session = findSession(sessions, sessionId);
      if (!session) return state;

      session.posts = session.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              ...updates,
              content: {
                ...post.content,
                ...(updates.content || {}),
              },
              metadata: {
                ...post.metadata,
                ...(updates.metadata || {}),
              },
              updatedAt: Date.now(),
            }
          : post,
      );
      touchSession(session);
      return { sessions };
    });
  },

  deletePost(postId) {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    set((state) => {
      const sessions = deepClone(state.sessions);
      const session = findSession(sessions, sessionId);
      if (!session) return state;
      session.posts = session.posts.filter((post) => post.id !== postId);
      touchSession(session);
        return {
          sessions,
          uiBySession: {
            ...state.uiBySession,
            [sessionId]: {
              ...state.uiBySession[sessionId],
              selectedPostIds: (state.uiBySession[sessionId].selectedPostIds || []).filter((id) => id !== postId),
              postsShowSelectedOnly: (state.uiBySession[sessionId].selectedPostIds || []).filter((id) => id !== postId).length
                ? state.uiBySession[sessionId].postsShowSelectedOnly
                : false,
            },
          },
        };
    });
  },

  schedulePost(postId) {
    if (!postId) return;
    get().schedulePosts([postId]);
  },

  duplicatePost(postId) {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    set((state) => {
      const sessions = deepClone(state.sessions);
      const session = findSession(sessions, sessionId);
      if (!session) return state;
      const original = session.posts.find((post) => post.id === postId);
      if (!original) return state;

      const duplicate = {
        ...deepClone(original),
        id: createId("post"),
        status: original.status === "generating" ? "ready" : original.status,
        aiSuggested: false,
        workflowState: "draft",
        scheduledForLabel: "",
        lastExportedAt: null,
        variant: original.variant || "proof-led",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      session.posts.unshift(duplicate);
      rebalanceIdeaRecommendations(session, duplicate.ideaId);
      touchSession(session);
      return { sessions };
    });
  },

  deleteSelectedPosts() {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    const selected = get().uiBySession[sessionId].selectedPostIds || [];
    if (!selected.length) return;
    set((state) => {
      const sessions = deepClone(state.sessions);
      const session = findSession(sessions, sessionId);
      if (!session) return state;
      session.posts = session.posts.filter((post) => !selected.includes(post.id));
      touchSession(session);
        return {
          sessions,
          uiBySession: {
            ...state.uiBySession,
            [sessionId]: {
              ...state.uiBySession[sessionId],
              selectedPostIds: [],
              postsShowSelectedOnly: false,
            },
          },
        };
    });
  },

  duplicateSelectedPosts() {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    const selected = get().uiBySession[sessionId].selectedPostIds || [];
    if (!selected.length) return;
    set((state) => {
      const sessions = deepClone(state.sessions);
      const session = findSession(sessions, sessionId);
      if (!session) return state;
      const duplicates = session.posts
        .filter((post) => selected.includes(post.id))
        .map((post) => ({
          ...deepClone(post),
          id: createId("post"),
          status: post.status === "generating" ? "ready" : post.status,
          aiSuggested: false,
          workflowState: "draft",
          scheduledForLabel: "",
          lastExportedAt: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }));
      session.posts = [...duplicates, ...session.posts];
      duplicates.forEach((post) => rebalanceIdeaRecommendations(session, post.ideaId));
      touchSession(session);
      return {
        sessions,
        uiBySession: {
          ...state.uiBySession,
          [sessionId]: {
            ...state.uiBySession[sessionId],
            selectedPostIds: duplicates.map((post) => post.id),
          },
        },
      };
    });
  },

  prepareSelectedPosts() {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    const selected = get().uiBySession[sessionId].selectedPostIds || [];
    if (!selected.length) return;

    set((state) => {
      const sessions = deepClone(state.sessions);
      const session = findSession(sessions, sessionId);
      if (!session) return state;
      const invalidCount = session.posts
        .filter((post) => selected.includes(post.id))
        .filter((post) => validatePostDraft(post).length > 0).length;
      if (invalidCount) {
        session.messages.push({
          id: createId("message"),
          role: "system",
          meta: "Workflow",
          text: "Fix validation issues before preparing selected drafts.",
          status: "ready",
          createdAt: Date.now(),
        });
        touchSession(session);
        return { sessions };
      }

      session.posts = session.posts.map((post) =>
        selected.includes(post.id)
          ? {
              ...post,
              workflowState: "prepared",
              updatedAt: Date.now(),
            }
          : post,
      );
      session.messages.push({
        id: createId("message"),
        role: "system",
        meta: "Workflow",
        text: "Prepared " + selected.length + " selected draft" + (selected.length > 1 ? "s" : "") + " for publishing.",
        status: "ready",
        createdAt: Date.now(),
      });
      touchSession(session);
      return { sessions };
    });
  },

  schedulePosts(postIds) {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    const selected = Array.from(new Set((postIds || []).filter(Boolean)));
    if (!selected.length) return;
    set((state) => {
      const sessions = deepClone(state.sessions);
      const session = findSession(sessions, sessionId);
      if (!session) return state;
      const invalidCount = session.posts
        .filter((post) => selected.includes(post.id))
        .filter((post) => validatePostDraft(post).length > 0).length;
      if (invalidCount) {
        session.messages.push({
          id: createId("message"),
          role: "system",
          meta: "Workflow",
          text: "Fix validation issues before scheduling selected drafts.",
          status: "ready",
          createdAt: Date.now(),
        });
        touchSession(session);
        return { sessions };
      }

      const label = scheduleLabelForSelection(selected.length);
      session.posts = session.posts.map((post) =>
        selected.includes(post.id)
          ? {
              ...post,
              workflowState: "scheduled",
              scheduledForLabel: label,
              updatedAt: Date.now(),
            }
          : post,
      );
      session.messages.push({
        id: createId("message"),
        role: "system",
        meta: "Workflow",
        text: "Scheduled " + selected.length + " selected draft" + (selected.length > 1 ? "s" : "") + " into " + label + ".",
        status: "ready",
        createdAt: Date.now(),
      });
      touchSession(session);
      return { sessions };
    });
  },

  scheduleSelectedPosts() {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    const selected = get().uiBySession[sessionId].selectedPostIds || [];
    if (!selected.length) return;
    get().schedulePosts(selected);
  },

  exportSelectedPosts() {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    const selected = get().uiBySession[sessionId].selectedPostIds || [];
    if (!selected.length) return;

    set((state) => {
      const sessions = deepClone(state.sessions);
      const session = findSession(sessions, sessionId);
      if (!session) return state;

      session.posts = session.posts.map((post) =>
        selected.includes(post.id)
          ? {
              ...post,
              lastExportedAt: Date.now(),
              updatedAt: Date.now(),
            }
          : post,
      );
      session.messages.push({
        id: createId("message"),
        role: "system",
        meta: "Workflow",
        text: "Exported " + selected.length + " selected draft" + (selected.length > 1 ? "s" : "") + " for handoff.",
        status: "ready",
        createdAt: Date.now(),
      });
      touchSession(session);
      return { sessions };
    });
  },

  openIdea(ideaId) {
    set({ activeIdeaId: ideaId });
  },

  closeIdea() {
    set({ activeIdeaId: null });
  },

  moveIdeaToBrief() {
    const sessionId = get().activeSessionId;
    const activeIdeaId = get().activeIdeaId;
    if (!sessionId || !activeIdeaId) {
      set({ currentTab: "brief" });
      return;
    }

    set((state) => {
      const sessions = deepClone(state.sessions);
      const session = findSession(sessions, sessionId);
      const match = session ? findIdeaInSession(session, activeIdeaId) : null;
      if (!session || !match) {
        return { currentTab: "brief" };
      }

      const brief = normalizeStrategyBrief(session.strategyBrief, "empty");
      let insightsSection = brief.sections.find(
        (section) => section.title.toLowerCase() === "source insights",
      );

      if (!insightsSection) {
        insightsSection = {
          id: createId("brief-section"),
          key: "source-insights",
          title: "Source Insights",
          icon: "fileText",
          collapsed: false,
          entries: [],
        };
        brief.sections.push(insightsSection);
      }

      const exists = insightsSection.entries.some((entry) => entry.label === match.idea.title);
      if (!exists) {
        insightsSection.entries.unshift({
          id: createId("brief-entry"),
          key: match.idea.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          label: match.idea.title,
          type: "textarea",
          value: match.idea.summary,
          items: [],
          placeholder: "Capture the source learning that should shape future content.",
          editable: true,
          source: "ai",
          locked: false,
          lastUpdated: Date.now(),
        });
      }

      session.strategyBrief = brief;
      touchSession(session);

      return {
        sessions,
        currentTab: "brief",
      };
    });
  },

  openBriefEntryComposer(sectionId, entryId = null) {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;

    set((state) => {
      const session = findSession(state.sessions, sessionId);
      if (!session) return state;

      const section = session.strategyBrief.sections.find((item) => item.id === sectionId);
      const entry = entryId ? section?.entries.find((item) => item.id === entryId) : null;

      return {
        uiBySession: {
          ...state.uiBySession,
          [sessionId]: {
            ...state.uiBySession[sessionId],
            briefComposer: createBriefComposer(entryId ? "edit-entry" : "add-entry", {
              sectionId,
              entryId,
              label: entry?.label || "",
              type: entry?.type || "text",
              rawValue: serializeBriefEntry(entry),
              placeholder: entry?.placeholder || "",
            }),
          },
        },
      };
    });
  },

  openBriefSectionComposer() {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;

    set((state) => ({
      uiBySession: {
        ...state.uiBySession,
        [sessionId]: {
          ...state.uiBySession[sessionId],
          briefComposer: createBriefComposer("add-section"),
        },
      },
    }));
  },

  updateBriefComposer(field, nextValue) {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;

    set((state) => {
      const composer = state.uiBySession[sessionId]?.briefComposer;
      if (!composer) return state;

      return {
        uiBySession: {
          ...state.uiBySession,
          [sessionId]: {
            ...state.uiBySession[sessionId],
            briefComposer: {
              ...composer,
              [field]: nextValue,
            },
          },
        },
      };
    });
  },

  cancelBriefComposer() {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;

    set((state) => ({
      uiBySession: {
        ...state.uiBySession,
        [sessionId]: {
          ...state.uiBySession[sessionId],
          briefComposer: null,
        },
      },
    }));
  },

  commitBriefComposer() {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;

    set((state) => {
      const ui = state.uiBySession[sessionId];
      const composer = ui?.briefComposer;
      if (!composer) return state;

      if (composer.mode === "add-section") {
        const title = composer.title.trim();
        if (!title) {
          return {
            uiBySession: {
              ...state.uiBySession,
              [sessionId]: {
                ...ui,
                briefComposer: null,
              },
            },
          };
        }

        const sessions = deepClone(state.sessions);
        const session = findSession(sessions, sessionId);
        if (!session) return state;

        const brief = normalizeStrategyBrief(session.strategyBrief, "empty");
        brief.sections.push({
          id: createId("brief-section"),
          title,
          icon: "note",
          entries: [],
        });
        session.strategyBrief = brief;
        touchSession(session);

        return {
          sessions,
          uiBySession: {
            ...state.uiBySession,
            [sessionId]: {
              ...ui,
              briefComposer: null,
            },
          },
        };
      }

      const label = composer.label.trim() || "Untitled field";
      const type = composer.type || "text";
      const parsed = parseBriefComposerValue(type, composer.rawValue);
      const hasContent =
        type === "cta"
          ? parsed.items.length > 0
          : type === "list" || type === "chips"
            ? parsed.items.length > 0
            : Boolean(parsed.value);

      if (!hasContent) {
        return {
          uiBySession: {
            ...state.uiBySession,
            [sessionId]: {
              ...ui,
              briefComposer: null,
            },
          },
        };
      }

      const sessions = deepClone(state.sessions);
      const session = findSession(sessions, sessionId);
      if (!session) return state;

      const brief = normalizeStrategyBrief(session.strategyBrief, "empty");
      const section = brief.sections.find((item) => item.id === composer.sectionId);
      if (!section) return state;

      if (composer.mode === "edit-entry" && composer.entryId) {
        const entry = section.entries.find((item) => item.id === composer.entryId);
        if (entry) {
          entry.label = label;
          entry.type = type;
          entry.value = parsed.value;
          entry.items = parsed.items;
          entry.source = "user";
          entry.locked = true;
          entry.lastUpdated = Date.now();
        }
      } else {
        section.entries.push({
          id: createId("brief-entry"),
          label,
          key: label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          type,
          value: parsed.value,
          items: parsed.items,
          placeholder: "",
          editable: true,
          source: "user",
          locked: true,
          lastUpdated: Date.now(),
        });
      }

      session.strategyBrief = brief;
      touchSession(session);

      return {
        sessions,
        uiBySession: {
          ...state.uiBySession,
          [sessionId]: {
            ...ui,
            briefComposer: null,
          },
        },
      };
    });
  },

  deleteBriefEntry(sectionId, entryId) {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;

    set((state) => {
      const sessions = deepClone(state.sessions);
      const session = findSession(sessions, sessionId);
      if (!session) return state;

      const brief = normalizeStrategyBrief(session.strategyBrief, "empty");
      const section = brief.sections.find((item) => item.id === sectionId);
      if (!section) return state;

      section.entries = section.entries.filter((entry) => entry.id !== entryId);
      session.strategyBrief = brief;
      touchSession(session);

      return { sessions };
    });
  },

  clearStrategyBrief() {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;

    set((state) => {
      const sessions = deepClone(state.sessions);
      const session = findSession(sessions, sessionId);
      if (!session) return state;

      session.strategyBrief = createEmptyStrategyBrief();
      touchSession(session);

      return {
        sessions,
        uiBySession: {
          ...state.uiBySession,
          [sessionId]: {
            ...state.uiBySession[sessionId],
            briefComposer: null,
          },
        },
      };
    });
  },

  async refineStrategyBrief(sectionId = null) {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;

    const current = get();
    if (current.uiBySession[sessionId]?.pendingBriefRefine) return;

    set((state) => ({
      uiBySession: {
        ...state.uiBySession,
        [sessionId]: {
          ...state.uiBySession[sessionId],
          pendingBriefRefine: true,
        },
      },
    }));

    try {
      const session = findSession(get().sessions, sessionId);
      if (!session) return;

      const refined = await mockRefineStrategyBrief({
        strategyBrief: normalizeStrategyBrief(session.strategyBrief, "empty"),
        sectionId,
      });

      set((state) => {
        const sessions = deepClone(state.sessions);
        const nextSession = findSession(sessions, sessionId);
        if (!nextSession) return state;

        nextSession.strategyBrief = normalizeStrategyBrief(refined, "empty");
        touchSession(nextSession);

        return {
          sessions,
          uiBySession: {
            ...state.uiBySession,
            [sessionId]: {
              ...state.uiBySession[sessionId],
              pendingBriefRefine: false,
            },
          },
        };
      });
    } catch {
      set((state) => ({
        uiBySession: {
          ...state.uiBySession,
          [sessionId]: {
            ...state.uiBySession[sessionId],
            pendingBriefRefine: false,
          },
        },
      }));
    }
  },

  toggleBriefSection(sectionId) {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;

    set((state) => {
      const sessions = deepClone(state.sessions);
      const session = findSession(sessions, sessionId);
      if (!session) return state;

      const brief = normalizeStrategyBrief(session.strategyBrief, "empty");
      const section = brief.sections.find((item) => item.id === sectionId);
      if (!section || section.collapsible === false) return state;

      section.collapsed = !section.collapsed;
      session.strategyBrief = brief;

      return { sessions };
    });
  },

  toggleIdeaPin(ideaId) {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    set((state) => {
      const sessions = deepClone(state.sessions);
      const session = findSession(sessions, sessionId);
      const match = session ? findIdeaInSession(session, ideaId) : null;
      if (!session || !match) return state;
      match.idea.pinned = !match.idea.pinned;
      touchSession(session);
      return { sessions };
    });
  },

  addSystemMessage(text, meta = "System", ideaId = null) {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;

    set((state) => {
      const sessions = deepClone(state.sessions);
      const session = findSession(sessions, sessionId);
      if (!session) return state;
      session.messages.push({
        id: createId("message"),
        role: "system",
        meta,
        text,
        ideaId,
        status: "ready",
        createdAt: Date.now(),
      });
      touchSession(session);
      return { sessions };
    });
  },

  async sendChatMessage(prompt, options = {}) {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;

    const state = get();
    const ui = state.uiBySession[sessionId];
    const messageText = (prompt ?? ui.assistantDraft).trim();
    if (!messageText || ui.pendingChat) return;

    const userMessageId = createId("message");
    const pendingAssistantId = createId("message");

    set((current) => {
      const sessions = deepClone(current.sessions);
      const session = findSession(sessions, sessionId);
      if (!session) return current;

      session.messages.push({
        id: userMessageId,
        role: "user",
        meta: "You",
        text: messageText,
        status: "ready",
        ideaId: options.ideaId || null,
        createdAt: Date.now(),
      });

      session.messages.push({
        id: pendingAssistantId,
        role: "assistant",
        meta: "AI copilot",
        text: "Thinking through the best next move...",
        status: "loading",
        ideaId: options.ideaId || null,
        createdAt: Date.now(),
      });

      touchSession(session);

      return {
        sessions,
        uiBySession: {
          ...current.uiBySession,
          [sessionId]: {
            ...current.uiBySession[sessionId],
            assistantDraft: "",
            pendingChat: true,
          },
        },
      };
    });

    try {
      const nextSession = findSession(get().sessions, sessionId);
      const match =
        nextSession && options.ideaId ? findIdeaInSession(nextSession, options.ideaId) : null;
      const compareMatch =
        nextSession && options.compareIdeaId
          ? findIdeaInSession(nextSession, options.compareIdeaId)
          : null;

      const reply = await mockGenerateAssistantReply({
        session: nextSession,
        prompt: messageText,
        anchorIdea: match?.idea || null,
        compareIdea: compareMatch?.idea || null,
      });

      set((current) => {
        const sessions = deepClone(current.sessions);
        const session = findSession(sessions, sessionId);
        if (!session) return current;
        session.messages = session.messages.map((message) =>
          message.id === pendingAssistantId
            ? {
                ...message,
                text: reply.text,
                status: "ready",
                ideaId: reply.ideaId || message.ideaId || null,
              }
            : message,
        );
        touchSession(session);
        return {
          sessions,
          uiBySession: {
            ...current.uiBySession,
            [sessionId]: {
              ...current.uiBySession[sessionId],
              pendingChat: false,
            },
          },
        };
      });
    } catch {
      set((current) => {
        const sessions = deepClone(current.sessions);
        const session = findSession(sessions, sessionId);
        if (!session) return current;
        session.messages = session.messages.map((message) =>
          message.id === pendingAssistantId
            ? {
                ...message,
                text: "The mock assistant hit an unexpected error. Try again.",
                status: "error",
              }
            : message,
        );
        return {
          sessions,
          uiBySession: {
            ...current.uiBySession,
            [sessionId]: {
              ...current.uiBySession[sessionId],
              pendingChat: false,
            },
          },
        };
      });
    }
  },

  async compareIdea(ideaId) {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;

    const session = findSession(get().sessions, sessionId);
    const ui = get().uiBySession[sessionId];
    const anchor = session ? findIdeaInSession(session, ideaId) : null;
    if (!session || !anchor) return;

    const selectedPartnerId =
      ui.selectedIdeaIds.find((selectedId) => selectedId !== ideaId) || null;
    const compareMatch = selectedPartnerId
      ? findIdeaInSession(session, selectedPartnerId)
      : session.sources
          .flatMap((source) => source.ideas)
          .find((idea) => idea.id !== ideaId) || null;

    set((state) => ({
      uiBySession: {
        ...state.uiBySession,
        [sessionId]: {
          ...state.uiBySession[sessionId],
          pendingIdeaActions: {
            ...state.uiBySession[sessionId].pendingIdeaActions,
            [ideaId]: "compare",
          },
        },
      },
    }));

    const prompt = compareMatch?.idea
      ? 'Compare "' + anchor.idea.title + '" against "' + compareMatch.idea.title + '" and tell me which is more actionable.'
      : 'Compare "' + anchor.idea.title + '" against the strongest other idea in the session.';

    await get().sendChatMessage(prompt, {
      ideaId,
      compareIdeaId: compareMatch?.idea?.id || compareMatch?.id || null,
    });

    set((state) => {
      const nextPending = { ...state.uiBySession[sessionId].pendingIdeaActions };
      delete nextPending[ideaId];
      return {
        uiBySession: {
          ...state.uiBySession,
          [sessionId]: {
            ...state.uiBySession[sessionId],
            pendingIdeaActions: nextPending,
          },
        },
      };
    });
  },

  async generatePostForIdea(ideaId, options = {}) {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;

    const session = findSession(get().sessions, sessionId);
    const match = session ? findIdeaInSession(session, ideaId) : null;
    if (!session || !match) return;

    const activeUi = get().uiBySession[sessionId];
    const platform = options.platform || activeUi.generationPlatform || "linkedin";
    const pendingAction = activeUi.pendingIdeaActions[ideaId];
    if (pendingAction === "generate") return;
    const existingIdeaDraftCount = session.posts.filter((post) => post.ideaId === ideaId).length;
    const variant = recommendedVariantLabel(existingIdeaDraftCount);

    const postId = createId("post");

    set((state) => {
      const sessions = deepClone(state.sessions);
      const nextSession = findSession(sessions, sessionId);
      if (!nextSession) return state;
      nextSession.posts.unshift({
        id: postId,
        ideaId,
        sourceId: match.source.id,
        platform,
        author: null,
        content: {
          text: "Generating a platform-ready draft...",
          hashtags: [],
          cta: "",
        },
        metadata: {
          timestamp: "now",
          engagement: null,
        },
        variant,
        workflowState: "draft",
        aiSuggested: false,
        status: "generating",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      nextSession.messages.push({
        id: createId("message"),
        role: "system",
        meta: "Drafting",
        text: 'Started generating a post from "' + match.idea.title + '".',
        status: "ready",
        ideaId,
        createdAt: Date.now(),
      });
      touchSession(nextSession);
      return {
        sessions,
        currentTab: options.switchToPosts === false ? state.currentTab : "posts",
        uiBySession: {
          ...state.uiBySession,
          [sessionId]: {
            ...state.uiBySession[sessionId],
            pendingIdeaActions: {
              ...state.uiBySession[sessionId].pendingIdeaActions,
              [ideaId]: "generate",
            },
          },
        },
      };
    });

    try {
      const freshSession = findSession(get().sessions, sessionId);
      const freshMatch = freshSession ? findIdeaInSession(freshSession, ideaId) : null;
      if (!freshSession || !freshMatch) return;

      const draft = await mockGeneratePost({
        session: freshSession,
        source: freshMatch.source,
        idea: freshMatch.idea,
        platform,
      });

      set((state) => {
        const sessions = deepClone(state.sessions);
        const nextSession = findSession(sessions, sessionId);
        if (!nextSession) return state;
        nextSession.posts = nextSession.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                ...draft,
                variant,
                workflowState: "draft",
                status: "ready",
                updatedAt: Date.now(),
              }
            : post,
        );
        rebalanceIdeaRecommendations(nextSession, ideaId);
        nextSession.messages.push({
          id: createId("message"),
          role: "assistant",
          meta: "AI copilot",
          text: 'Your draft for "' + freshMatch.idea.title + '" is ready in Posts.',
          status: "ready",
          ideaId,
          createdAt: Date.now(),
        });
        touchSession(nextSession);

        const nextPending = { ...state.uiBySession[sessionId].pendingIdeaActions };
        delete nextPending[ideaId];

        return {
          sessions,
          uiBySession: {
            ...state.uiBySession,
            [sessionId]: {
              ...state.uiBySession[sessionId],
              pendingIdeaActions: nextPending,
            },
          },
        };
      });
    } catch {
      set((state) => {
        const sessions = deepClone(state.sessions);
        const nextSession = findSession(sessions, sessionId);
        if (!nextSession) return state;
        nextSession.posts = nextSession.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                status: "error",
                workflowState: "draft",
                author: post.author || {
                  name: "AI Drafting Agent",
                  title: "Generation unavailable",
                  handle: "publishing",
                  avatarUrl: "",
                },
                content: {
                  text: "Draft generation failed. Try generating this post again.",
                  hashtags: [],
                  cta: "",
                },
                metadata: {
                  timestamp: "now",
                  engagement: {
                    likes: 0,
                    comments: 0,
                    shares: 0,
                    reposts: 0,
                    views: 0,
                  },
                },
              }
            : post,
        );

        const nextPending = { ...state.uiBySession[sessionId].pendingIdeaActions };
        delete nextPending[ideaId];

        return {
          sessions,
          uiBySession: {
            ...state.uiBySession,
            [sessionId]: {
              ...state.uiBySession[sessionId],
              pendingIdeaActions: nextPending,
            },
          },
        };
      });
    }
  },

  async generatePostsFromSelected() {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    const selectedIdeaIds = get().uiBySession[sessionId].selectedIdeaIds;
    if (!selectedIdeaIds.length) return;
    set({ currentTab: "posts" });
    await Promise.all(selectedIdeaIds.map((ideaId) => get().generatePostForIdea(ideaId, { switchToPosts: false })));
  },

  askAboutIdea(ideaId) {
    const sessionId = get().activeSessionId;
    const session = sessionId ? findSession(get().sessions, sessionId) : null;
    const match = session ? findIdeaInSession(session, ideaId) : null;
    if (!match) return;

    get().sendChatMessage(
      'Help me pressure-test "' + match.idea.title + '" before I draft a post.',
      { ideaId },
    );
  },
}));

store.subscribe((state) => {
  persistState(state);
});

export function getActiveSession(state = store.getState()) {
  return findSession(state.sessions, state.activeSessionId);
}

export function getSessionUi(sessionId, state = store.getState()) {
  return state.uiBySession[sessionId] || buildUiForSession({ sources: [] });
}

export function getIdeaById(ideaId, state = store.getState()) {
  const session = getActiveSession(state);
  return session ? findIdeaInSession(session, ideaId) : null;
}

export function countIdeas(session) {
  return session.sources.flatMap((source) => source.ideas).length;
}

export function countPinnedIdeas(session) {
  return session.sources.flatMap((source) => source.ideas).filter((idea) => idea.pinned).length;
}

export function sortSessions(sessions, includeArchived = true) {
  return [...sessions]
    .filter((session) => (includeArchived ? true : !session.archived))
    .sort((left, right) => right.updatedAtTs - left.updatedAtTs);
}
