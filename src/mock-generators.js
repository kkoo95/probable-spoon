function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function hashSeed(value) {
  return Array.from(value).reduce((accumulator, character) => {
    return (accumulator * 31 + character.charCodeAt(0)) % 1000003;
  }, 7);
}

function pickFrom(list, seed) {
  return list[seed % list.length];
}

function avatarDataUrl(name, seed) {
  const backgrounds = ["#FFE1D4", "#DBEAFE", "#EAF7ED", "#F5F3FF", "#ECFEFF"];
  const foregrounds = ["#C83E07", "#1D4ED8", "#1A7A46", "#5B21B6", "#0E7490"];
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">' +
    '<rect width="80" height="80" rx="40" fill="' +
    backgrounds[seed % backgrounds.length] +
    '"/>' +
    '<text x="40" y="46" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="' +
    foregrounds[seed % foregrounds.length] +
    '">' +
    initials +
    "</text></svg>";

  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

function authorProfile(seed) {
  const profiles = [
    { name: "Maya Chen", title: "Head of Marketing", handle: "maya_chen" },
    { name: "Jordan Alvarez", title: "Growth Director", handle: "jordanalvarez" },
    { name: "Priya Raman", title: "VP Demand Gen", handle: "priyaraman" },
  ];

  const author = pickFrom(profiles, seed);
  return {
    ...author,
    avatarUrl: avatarDataUrl(author.name, seed),
  };
}

function sentence(value) {
  return value.endsWith(".") ? value : value + ".";
}

function deriveHashtags(idea, platform) {
  const base = idea.title
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, platform === "twitter" ? 2 : 3)
    .map((part) => "#" + part.replace(/^[a-z]/, (letter) => letter.toUpperCase()));

  const extras = platform === "twitter" ? ["#Marketing", "#B2B"] : ["#B2BMarketing", "#DemandGen", "#ContentStrategy"];
  return Array.from(new Set([...base, ...extras])).slice(0, platform === "twitter" ? 3 : 4);
}

function timestampLabel(seed, platform) {
  const candidates = platform === "twitter" ? ["9m", "24m", "52m", "1h"] : ["38m", "1h", "2h", "3h"];
  return pickFrom(candidates, seed);
}

function engagement(seed, platform) {
  const likes = 24 + (seed % (platform === "twitter" ? 160 : 320));
  const comments = 4 + (seed % 24);
  const shares = 2 + (seed % (platform === "twitter" ? 18 : 40));
  const views = 1200 + (seed % 8500);

  return platform === "twitter"
    ? {
        likes,
        comments,
        shares,
        reposts: shares + 3,
        views,
      }
    : {
        likes,
        comments,
        shares,
      };
}

function buildLinkedInText(session, idea, source) {
  return [
    "One thing most B2B teams underestimate: consistency beats grand campaign reveals.",
    sentence(idea.summary),
    "The stronger move for " +
      session.name +
      " is to turn that signal into one useful post with a proof point from " +
      source.name.replace(".pdf", "") +
      ", then repeat the format until the audience expects it.",
  ].join("\n\n");
}

function buildTwitterText(idea) {
  return [
    "Most teams wait too long to publish the useful thing they already know.",
    sentence(idea.summary),
    "One proof point. One takeaway. Ship it.",
  ].join("\n\n");
}

function buildLinkedInVariantText(session, idea, source, variant = "proof-led") {
  const variants = {
    "proof-led": [
      "Most content calendars fail for the same reason: they save the proof until the quarterly recap.",
      sentence(idea.summary),
      "A better move for " +
        session.name +
        " is to turn that signal into one practical LinkedIn post this week, anchored in " +
        source.name.replace(".pdf", "") +
        " and written so the takeaway is obvious in the first three lines.",
    ],
    "operator-note": [
      "A quick operator note for B2B teams: weekly proof points build more trust than polished campaign reveals.",
      sentence(idea.summary),
      "If " +
        session.name +
        " wants more repeatable reach, publish the useful lesson now, support it with one real signal from " +
        source.name.replace(".pdf", "") +
        ", and let consistency do the hard work.",
    ],
    "series-angle": [
      "This is the kind of insight that deserves a repeatable series, not a one-off post.",
      sentence(idea.summary),
      "The opportunity for " +
        session.name +
        " is to make this a weekly format: one observation, one proof point from " +
        source.name.replace(".pdf", "") +
        ", and one next step the audience can steal immediately.",
    ],
    "contrarian-hook": [
      "Hot take: the most valuable B2B content is often hiding in the sections teams skip past.",
      sentence(idea.summary),
      "Instead of waiting for a perfect campaign asset, " +
        session.name +
        " can publish the sharpest angle now, frame the evidence from " +
        source.name.replace(".pdf", "") +
        ", and keep momentum moving every week.",
    ],
  };

  return (variants[variant] || buildLinkedInText(session, idea, source)).join("\n\n");
}

function buildTwitterVariantText(idea, variant = "proof-led") {
  const variants = {
    "proof-led": [
      "The best B2B content usually starts with one concrete proof point.",
      sentence(idea.summary),
      "One lesson. One takeaway. Publish it before it turns into a deck.",
    ],
    "operator-note": [
      "Operator note: consistency beats the big quarterly reveal.",
      sentence(idea.summary),
      "Post the useful thing while it still feels fresh.",
    ],
    "series-angle": [
      "This insight shouldn’t be one post. It should be a repeatable series.",
      sentence(idea.summary),
      "Same structure. New proof point each week.",
    ],
    "contrarian-hook": [
      "The strongest social posts are often buried in the “boring” parts of the source material.",
      sentence(idea.summary),
      "That’s where the specific proof lives.",
    ],
  };

  return (variants[variant] || buildTwitterText(idea)).join("\n\n");
}

export function buildMockPostDraft({
  session,
  source,
  idea,
  platform = "linkedin",
  variant = "proof-led",
  workflowState = "draft",
  aiSuggested = false,
}) {
  const seed = hashSeed(session.id + ":" + source.id + ":" + idea.id + ":" + platform + ":" + variant);
  const author = authorProfile(seed);

  return {
    platform,
    author,
    content: {
      text:
        platform === "twitter"
          ? buildTwitterVariantText(idea, variant)
          : buildLinkedInVariantText(session, idea, source, variant),
      hashtags: deriveHashtags(idea, platform),
      cta:
        platform === "twitter"
          ? "Follow for more practical B2B content ideas."
          : "Follow for more practical B2B content systems and repeatable editorial angles.",
    },
    metadata: {
      timestamp: timestampLabel(seed, platform),
      engagement: engagement(seed, platform),
    },
    workflowState,
    aiSuggested,
    variant,
  };
}

export async function mockGenerateAssistantReply({ session, prompt, anchorIdea, compareIdea }) {
  await wait(900 + Math.round(Math.random() * 600));

  const ideas = session.sources.flatMap((source) => source.ideas);
  const pinned = ideas.filter((idea) => idea.pinned);
  const leadIdea = anchorIdea || pinned[0] || ideas[0] || null;

  if (!leadIdea) {
    return {
      text: "I don't have enough source material in this session yet. Add a source first and I can extract ideas, compare angles, or draft a post.",
      ideaId: null,
    };
  }

  if (compareIdea) {
    const stronger = leadIdea.confidence >= compareIdea.confidence ? leadIdea : compareIdea;
    const weaker = stronger.id === leadIdea.id ? compareIdea : leadIdea;

    return {
      text:
        'Between "' +
        leadIdea.title +
        '" and "' +
        compareIdea.title +
        '", I would move forward with "' +
        stronger.title +
        '" first. It has the clearer proof point, stronger confidence signal, and will be easier to turn into a concrete post for ' +
        session.name +
        '. Keep "' +
        weaker.title +
        '" as supporting context or a follow-up draft.',
      ideaId: stronger.id,
    };
  }

  if (/draft|generate|post|linkedin|twitter|x/i.test(prompt)) {
    return {
      text:
        'The best post candidate is "' +
        leadIdea.title +
        '". I would open with a concrete change, add one proof signal from the source, then close with a practical takeaway that feels specific to ' +
        session.name +
        ".",
      ideaId: leadIdea.id,
    };
  }

  if (/pin|priority|strongest|signal|actionable/i.test(prompt)) {
    return {
      text:
        'The strongest signal right now is "' +
        leadIdea.title +
        '" because it is already specific, believable, and close to publishable. I would pin it, compare it against one secondary angle, then draft the first post.',
      ideaId: leadIdea.id,
    };
  }

  return {
    text:
      "I can keep working inside " +
      session.name +
      ". My recommendation is to tighten the angle in Library, confirm the strongest idea, and only then generate a draft so the post stays grounded in source context.",
    ideaId: leadIdea.id,
  };
}

export async function mockGeneratePost({ session, source, idea, platform = "linkedin" }) {
  await wait(1100 + Math.round(Math.random() * 800));

  return {
    ...buildMockPostDraft({
      session,
      source,
      idea,
      platform,
      variant: "proof-led",
    }),
  };
}

function refineBriefValue(sectionTitle, label, value) {
  const source = (value || "").trim();
  const normalizedSection = (sectionTitle || "").toLowerCase();
  const normalizedLabel = (label || "").toLowerCase();
  const normalizedValue = source.toLowerCase();

  if (!source) {
    if (/goal/.test(normalizedSection) && /primary/.test(normalizedLabel)) {
      return "Turn strategy inputs into clear, publishable social directions that raise output quality across the session.";
    }

    if (/goal/.test(normalizedSection)) {
      return "Keep the brief specific enough to guide content decisions without slowing the team down.";
    }

    if (/audience/.test(normalizedSection)) {
      return "Focus on B2B social and content operators who need practical ways to turn source material into high-signal posts.";
    }

    if (/tone|voice/.test(normalizedLabel) || /brand voice/.test(normalizedSection)) {
      return "Direct, practical, and quietly confident with a bias toward useful specifics.";
    }

    if (/frequency/.test(normalizedLabel)) {
      return "3 to 5 posts per week, with room to intensify around launches or campaigns.";
    }

    if (/confidence/.test(normalizedLabel)) {
      return "Medium";
    }

    return source;
  }

  if (/broad audience|general audience|everyone/.test(normalizedValue)) {
    return "B2B SaaS marketers across LinkedIn and X who need practical, repeatable content systems.";
  }

  if (/community/.test(normalizedValue) && normalizedSection.includes("goal")) {
    return "Build a recognizable community of social media managers and demand gen leads around practical weekly insights.";
  }

  if (/brand voice|voice/.test(normalizedSection) || /tone|voice/.test(normalizedLabel)) {
    return "Clear, practical, and opinionated with a coach-like tone that turns strategy into immediate next steps.";
  }

  if (/audience/.test(normalizedSection)) {
    return (
      source +
      " with an emphasis on buyers evaluating how to turn source material into consistently publishable social content."
    );
  }

  if (/goal/.test(normalizedSection)) {
    return source + " with a focus on producing repeatable post angles that compound audience trust over time.";
  }

  return source + " while keeping the strategy specific enough to guide weekly editorial decisions.";
}

function refineBriefItems(sectionTitle, label, items = [], type = "list") {
  if (items.length) {
    if (type === "cta") {
      return items.map((item) => ({
        ...item,
        label: item.label || "Learn more",
        url: item.url || "https://example.com",
      }));
    }

    return items.map((item) => refineBriefValue(sectionTitle, label, item));
  }

  const normalizedSection = (sectionTitle || "").toLowerCase();
  const normalizedLabel = (label || "").toLowerCase();

  if (type === "cta") {
    if (/primary/.test(normalizedLabel)) {
      return [
        { label: "Book demo", url: "https://example.com/demo" },
        { label: "Start trial", url: "https://example.com/trial" },
      ];
    }

    return [
      { label: "Read the guide", url: "https://example.com/guide" },
      { label: "Explore templates", url: "https://example.com/templates" },
    ];
  }

  if (/goal/.test(normalizedSection) && /target actions/.test(normalizedLabel)) {
    return ["Visit website", "Book demo", "Follow for updates"];
  }

  if (/goal/.test(normalizedSection) && /secondary/.test(normalizedLabel)) {
    return [
      "Sharpen the narrative for upcoming posts.",
      "Make downstream AI drafts more consistent.",
      "Create reusable guidance for future campaigns.",
    ];
  }

  if (/audience/.test(normalizedSection)) {
    return [
      "Heads of marketing at B2B SaaS teams.",
      "Social leads scaling output with lean teams.",
      "Content operators looking for reusable angles.",
    ];
  }

  if (/style/.test(normalizedLabel)) {
    return ["specific", "concise", "evidence-aware", "actionable"];
  }

  if (/do$/.test(normalizedLabel) || normalizedLabel === "do") {
    return [
      "Lead with one concrete point.",
      "Support opinions with examples or evidence.",
      "Keep lines short and skimmable.",
    ];
  }

  if (/don't|dont/.test(normalizedLabel)) {
    return ["Use vague marketing language.", "Hide the lesson behind jargon.", "Pack too many ideas into one draft."];
  }

  if (/platform/.test(normalizedLabel)) {
    return ["LinkedIn", "X", "Instagram"];
  }

  if (/content types?/.test(normalizedLabel)) {
    return ["educational", "product-led", "thought leadership"];
  }

  if (/topics|angles/.test(normalizedLabel)) {
    return ["content strategy", "AI workflows", "proof-led posts", "repurposing"];
  }

  if (/pillars/.test(normalizedLabel)) {
    return [
      "Proof-led education -> Turn research into one useful takeaway per post.",
      "Operator perspective -> Share sharp lessons from real workflows.",
      "Performance patterns -> Surface signals that influence action.",
    ];
  }

  if (/requirements/.test(normalizedLabel)) {
    return ["Avoid filler.", "Use stats when supportable.", "Keep the structure easy to edit."];
  }

  if (/observed topics/.test(normalizedLabel)) {
    return ["strategy brief", "AI reuse", "scannability"];
  }

  if (/best performing/.test(normalizedLabel)) {
    return ["Strong first-line hooks", "One idea per post", "Specific CTA wording"];
  }

  if (/recurrent themes/.test(normalizedLabel)) {
    return ["clarity", "reuse", "actionability"];
  }

  return [];
}

export async function mockRefineStrategyBrief({ strategyBrief, sectionId = null }) {
  await wait(900 + Math.round(Math.random() * 500));

  return {
    ...strategyBrief,
    sections: strategyBrief.sections.map((section) => {
      if (sectionId && section.id !== sectionId) return section;

      return {
        ...section,
        entries: section.entries.map((entry) => ({
          ...entry,
          value:
            entry.locked || entry.type === "list" || entry.type === "chips" || entry.type === "cta"
              ? entry.value
              : refineBriefValue(section.title, entry.label, entry.value),
          items:
            entry.locked || !(entry.type === "list" || entry.type === "chips" || entry.type === "cta")
              ? entry.items
              : refineBriefItems(section.title, entry.label, entry.items, entry.type),
          source: entry.locked ? entry.source : "ai",
          lastUpdated: Date.now(),
        })),
      };
    }),
  };
}
