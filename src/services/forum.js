// Frontend-only forum store, persisted to localStorage.
// Topics are sorted by number of comments in the last 7 days, descending.

const STORAGE_KEY = "espormax.forum";
const DAY = 24 * 60 * 60 * 1000;
const WEEK = 7 * DAY;

export const CATEGORIES = ["General", "VALORANT", "CS2", "LoL"];

function buildSeed() {
  const now = Date.now();
  const at = (offsetDays) => new Date(now - offsetDays * DAY).toISOString();

  const topics = [
    {
      id: "t_transfer",
      title: "Biggest off-season transfer rumors",
      body: "What's the most surprising rumor you've heard this off-season? Drop names, sources and your honest read on whether it actually happens.",
      category: "General",
      authorId: "seed_op_1",
      authorUsername: "insider_anon",
      createdAt: at(3),
    },
    {
      id: "t_meta",
      title: "Is the new VALORANT meta finally balanced?",
      body: "After the latest patch, agent picks have shifted dramatically. Sentinels feel weaker, duelists are everywhere. What do you think?",
      category: "VALORANT",
      authorId: "seed_op_2",
      authorUsername: "valorantfan42",
      createdAt: at(12),
    },
    {
      id: "t_cs2",
      title: "CS2 Major: who is your dark horse pick?",
      body: "We're a few weeks out. Usual suspects aside, name one team you think could shock the bracket and why.",
      category: "CS2",
      authorId: "seed_op_3",
      authorUsername: "headshot_only",
      createdAt: at(9),
    },
    {
      id: "t_lol",
      title: "LoL Worlds bracket predictions thread",
      body: "Drop your full bracket here. Bonus points for upset picks with reasoning, not vibes.",
      category: "LoL",
      authorId: "seed_op_4",
      authorUsername: "rift_oracle",
      createdAt: at(20),
    },
    {
      id: "t_rookie",
      title: "Rookies of the year — who is your pick?",
      body: "Looking back at the season, which first-year pro stood out the most for you, across any title?",
      category: "General",
      authorId: "seed_op_5",
      authorUsername: "tournament_grinder",
      createdAt: at(35),
    },
  ];

  const comments = [];
  let i = 0;
  const c = (topicId, daysAgo, username, body, parentId = null, replyToUsername = null) => {
    comments.push({
      id: `c_seed_${i++}`,
      topicId,
      authorId: `seed_${username}`,
      authorUsername: username,
      body,
      createdAt: at(daysAgo),
      parentId,
      replyToUsername,
    });
  };

  // t_transfer — hottest in the last week
  c("t_transfer", 0.2, "scout_eyes",        "I heard EG is shopping their entire roster.");
  c("t_transfer", 0.4, "valorantfan42",     "Source? Sounds like a cope tweet.", "c_seed_0");
  c("t_transfer", 0.5, "valorantfan42",     "No way, EG just resigned half of them.");
  c("t_transfer", 0.8, "scout_eyes",        "Trust me bro, but seriously — contract window is closing.", "c_seed_0", "valorantfan42");
  c("t_transfer", 1.0, "rift_oracle",       "Mid-lane carousel is going to be wild this year.");
  c("t_transfer", 1.6, "headshot_only",     "CS2 side is quiet so far. Maybe FaZe makes a move.");
  c("t_transfer", 2.1, "insider_anon",      "Watch for an Asian region superteam announcement next week.");
  c("t_transfer", 2.4, "headshot_only",     "Specific region or just speculating?", "c_seed_6");
  c("t_transfer", 2.7, "tournament_grinder","Source on the EG rumor?");
  c("t_transfer", 3.4, "scout_eyes",        "Twitter mostly, but the timing fits the contract window.");
  c("t_transfer", 4.5, "lurker_99",         "Hyped for any roster shuffle in EU.");
  c("t_transfer", 5.6, "valorantfan42",     "EU has been stale, agreed.");

  // t_meta — moderate recent
  c("t_meta", 1.0, "valorantfan42",      "Phoenix is back in pro play, finally.");
  c("t_meta", 2.3, "scout_eyes",         "Sentinels are running double controller now, it's wild.");
  c("t_meta", 3.4, "rift_oracle",        "Off-topic but the LoL meta is even messier.");
  c("t_meta", 6.5, "headshot_only",      "Watch the upcoming patch hit duelists hard.");
  c("t_meta", 8.0, "tournament_grinder", "Old take, but Reyna gatekeeps low elo forever.");
  c("t_meta", 11.0, "lurker_99",         "Pre-patch comment, ignore me.");

  // t_cs2 — fewer recent
  c("t_cs2", 0.6, "headshot_only", "MOUZ is my dark horse, mark my words.");
  c("t_cs2", 1.3, "scout_eyes",    "Vitality looks scary but ZywOo is overdue for a bad event.");
  c("t_cs2", 4.2, "insider_anon",  "Watch out for the Asia qualifier teams this time.");
  c("t_cs2", 6.8, "valorantfan42", "Just within the week — I'll say FaZe.");
  c("t_cs2", 9.0, "lurker_99",     "Way before the window.");

  // t_lol — almost dormant
  c("t_lol", 5.5, "rift_oracle",   "Going T1 vs GenG final, T1 in 5.");
  c("t_lol", 14.0, "headshot_only","Bracket made before play-ins, my picks were a mess.");

  // t_rookie — dormant (no comments in last 7 days)
  c("t_rookie", 22.0, "tournament_grinder", "Old discussion, but my pick was Mary.");
  c("t_rookie", 40.0, "lurker_99",          "Even older take, calling it for Demon1.");

  // Seed a few likes so the UI doesn't render at zero everywhere.
  // Indices follow comment insertion order above.
  const likes = [];
  const like = (commentId, username) => likes.push({
    commentId,
    userId: `seed_${username}`,
    createdAt: at(0),
  });
  // Transfer thread (hot)
  like("c_seed_0",  "rift_oracle");        // scout_eyes "EG is shopping"
  like("c_seed_0",  "headshot_only");
  like("c_seed_0",  "tournament_grinder");
  like("c_seed_1",  "scout_eyes");         // reply asking for source
  like("c_seed_2",  "headshot_only");      // valorantfan42 "EG just resigned"
  like("c_seed_2",  "insider_anon");
  like("c_seed_3",  "tournament_grinder"); // scout_eyes reply re: contract window
  // VALORANT meta thread
  like("c_seed_12", "scout_eyes");         // Phoenix is back
  like("c_seed_13", "rift_oracle");        // Sentinels double controller
  like("c_seed_13", "valorantfan42");
  // CS2 thread
  like("c_seed_18", "insider_anon");       // MOUZ dark horse
  like("c_seed_18", "valorantfan42");

  return { topics, comments, likes };
}

let _store = null;
let _version = 0;
const subs = new Set();

function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrate older shapes that pre-date the likes feature.
      if (!Array.isArray(parsed.likes)) parsed.likes = [];
      return parsed;
    }
  } catch {}
  const seed = buildSeed();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

function persist(store) {
  _store = store;
  _version++;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch {}
  subs.forEach(fn => { try { fn(); } catch {} });
}

function getStore() {
  if (!_store) _store = loadStore();
  return _store;
}

export function subscribe(fn) {
  subs.add(fn);
  return () => subs.delete(fn);
}

// Stable snapshot: only changes when persist() is called.
export function getSnapshot() {
  return _version;
}

function decorate(topic, allComments) {
  const now = Date.now();
  const own = allComments.filter(c => c.topicId === topic.id);
  const weekly = own.filter(c => now - new Date(c.createdAt).getTime() <= WEEK).length;
  const lastTs = own.length
    ? Math.max(...own.map(c => new Date(c.createdAt).getTime()))
    : new Date(topic.createdAt).getTime();
  return {
    ...topic,
    commentCount: own.length,
    weeklyCommentCount: weekly,
    lastActivityAt: new Date(lastTs).toISOString(),
  };
}

export function getTopics({ category } = {}) {
  const store = getStore();
  let items = store.topics.map(t => decorate(t, store.comments));
  if (category && category !== "All") items = items.filter(t => t.category === category);
  items.sort((a, b) => {
    if (b.weeklyCommentCount !== a.weeklyCommentCount) {
      return b.weeklyCommentCount - a.weeklyCommentCount;
    }
    return new Date(b.lastActivityAt) - new Date(a.lastActivityAt);
  });
  return items;
}

function decorateComment(comment, allLikes) {
  const likers = allLikes.filter(l => l.commentId === comment.id).map(l => l.userId);
  return {
    ...comment,
    parentId: comment.parentId ?? null,
    replyToUsername: comment.replyToUsername ?? null,
    likeCount: likers.length,
    likers,
  };
}

export function getTopic(id) {
  const store = getStore();
  const topic = store.topics.find(t => t.id === id);
  if (!topic) return null;
  const decorated = decorate(topic, store.comments);
  const all = store.comments
    .filter(c => c.topicId === id)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map(c => decorateComment(c, store.likes));

  const repliesByParent = new Map();
  for (const c of all) {
    if (c.parentId) {
      if (!repliesByParent.has(c.parentId)) repliesByParent.set(c.parentId, []);
      repliesByParent.get(c.parentId).push(c);
    }
  }
  // One-level tree: top-level comments carry their replies. Replies whose
  // parent has been deleted bubble up to the root list so nothing is hidden.
  const validParentIds = new Set(all.filter(c => !c.parentId).map(c => c.id));
  const comments = all
    .filter(c => !c.parentId || !validParentIds.has(c.parentId))
    .map(c => ({ ...c, replies: repliesByParent.get(c.id) || [] }));

  return { ...decorated, comments };
}

export function addTopic({ title, body, category, author }) {
  if (!author?.id) throw new Error("Author required to create a topic");
  const store = getStore();
  const topic = {
    id: `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
    title: title.trim(),
    body: body.trim(),
    category: CATEGORIES.includes(category) ? category : "General",
    authorId: author.id,
    authorUsername: author.username,
    createdAt: new Date().toISOString(),
  };
  persist({ ...store, topics: [topic, ...store.topics] });
  return topic;
}

export function addComment({ topicId, body, author, parentId = null, replyToUsername = null }) {
  if (!author?.id) throw new Error("Author required to post a comment");
  const store = getStore();
  if (!store.topics.some(t => t.id === topicId)) return null;
  // If parentId points at a reply (not a top-level comment), promote it to
  // that reply's parent so threads stay flat one level deep.
  let normalizedParentId = parentId;
  if (parentId) {
    const parent = store.comments.find(c => c.id === parentId);
    if (parent?.parentId) normalizedParentId = parent.parentId;
  }
  const comment = {
    id: `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
    topicId,
    authorId: author.id,
    authorUsername: author.username,
    body: body.trim(),
    createdAt: new Date().toISOString(),
    parentId: normalizedParentId,
    replyToUsername: replyToUsername || null,
  };
  persist({ ...store, comments: [...store.comments, comment] });
  return comment;
}

export function toggleLike({ commentId, userId }) {
  if (!userId) throw new Error("Sign in required to like a comment");
  const store = getStore();
  if (!store.comments.some(c => c.id === commentId)) return null;
  const existing = store.likes.find(l => l.commentId === commentId && l.userId === userId);
  let nextLikes;
  let liked;
  if (existing) {
    nextLikes = store.likes.filter(l => !(l.commentId === commentId && l.userId === userId));
    liked = false;
  } else {
    nextLikes = [...store.likes, { commentId, userId, createdAt: new Date().toISOString() }];
    liked = true;
  }
  persist({ ...store, likes: nextLikes });
  return { liked, count: nextLikes.filter(l => l.commentId === commentId).length };
}

export function getStats() {
  const store = getStore();
  const now = Date.now();
  const weeklyComments = store.comments.filter(
    c => now - new Date(c.createdAt).getTime() <= WEEK
  ).length;
  return {
    totalTopics: store.topics.length,
    totalComments: store.comments.length,
    weeklyComments,
  };
}

export function formatRelative(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0) return "just now";
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  const wk = Math.floor(day / 7);
  if (wk < 4) return `${wk}w ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(day / 365)}y ago`;
}
