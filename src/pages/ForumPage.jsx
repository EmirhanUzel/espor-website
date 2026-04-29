import { useEffect, useState, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import {
  CATEGORIES,
  addTopic,
  formatRelative,
  getSnapshot,
  getStats,
  getTopics,
  subscribe,
} from "../services/forum";
import { useAuth } from "../services/auth.jsx";
import styles from "./ForumPage.module.css";

function useForumSnapshot() {
  // Re-render whenever the forum store version changes.
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function NewTopicPanel({ onCreate }) {
  const { user, openAuth } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <div className={styles.guestCta}>
        <div className={styles.guestCtaCopy}>
          <strong>Want to join the conversation?</strong>
          <span>Sign in or create an account to start a topic or post comments.</span>
        </div>
        <div className={styles.guestCtaActions}>
          <button className={styles.btnGhost} onClick={() => openAuth("signin")}>Sign in</button>
          <button className={styles.btnSolid} onClick={() => openAuth("register")}>Register</button>
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <div className={styles.composerClosed}>
        <button className={styles.btnSolid} onClick={() => setOpen(true)}>+ New topic</button>
        <span className={styles.composerHint}>Posting as <strong>{user.username}</strong></span>
      </div>
    );
  }

  const submit = (e) => {
    e.preventDefault();
    setError("");
    if (title.trim().length < 5) { setError("Title must be at least 5 characters."); return; }
    if (body.trim().length < 10) { setError("Tell us a bit more — at least 10 characters."); return; }
    const created = addTopic({ title, body, category, author: user });
    setTitle(""); setBody(""); setCategory(CATEGORIES[0]); setOpen(false);
    onCreate?.(created);
  };

  return (
    <form className={styles.composer} onSubmit={submit}>
      <div className={styles.composerHead}>
        <h3 className={styles.composerTitle}>Start a new topic</h3>
        <button type="button" className={styles.composerClose} onClick={() => setOpen(false)} aria-label="Close composer">×</button>
      </div>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>Title</span>
        <input
          className={styles.fieldInput}
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="What do you want to discuss?"
          maxLength={140}
        />
      </label>

      <div className={styles.fieldRow}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Category</span>
          <select
            className={styles.fieldInput}
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>Body</span>
        <textarea
          className={`${styles.fieldInput} ${styles.fieldTextarea}`}
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Share context, sources, your take..."
          rows={5}
        />
      </label>

      {error && <div className={styles.composerError}>{error}</div>}

      <div className={styles.composerActions}>
        <button type="button" className={styles.btnGhost} onClick={() => setOpen(false)}>Cancel</button>
        <button type="submit" className={styles.btnSolid}>Post topic</button>
      </div>
    </form>
  );
}

function TopicRow({ topic }) {
  return (
    <Link to={`/forum/${topic.id}`} className={styles.row}>
      <div className={styles.rowMain}>
        <div className={styles.rowMeta}>
          <span className={`${styles.cat} ${styles[`cat_${topic.category}`] || ""}`}>{topic.category}</span>
          <span className={styles.rowAuthor}>by <strong>{topic.authorUsername}</strong></span>
          <span className={styles.rowDot}>·</span>
          <span className={styles.rowDate}>{formatRelative(topic.createdAt)}</span>
        </div>
        <h3 className={styles.rowTitle}>{topic.title}</h3>
        <p className={styles.rowSnippet}>{topic.body}</p>
      </div>
      <div className={styles.rowStats}>
        <div className={styles.rowStatsBlock}>
          <span className={styles.rowStatsVal}>{topic.weeklyCommentCount}</span>
          <span className={styles.rowStatsLabel}>this week</span>
        </div>
        <div className={`${styles.rowStatsBlock} ${styles.rowStatsBlockMuted}`}>
          <span className={styles.rowStatsVal}>{topic.commentCount}</span>
          <span className={styles.rowStatsLabel}>total</span>
        </div>
        <span className={styles.rowArrow}>›</span>
      </div>
    </Link>
  );
}

export default function ForumPage() {
  useForumSnapshot();
  const [filter, setFilter] = useState("All");
  const stats = getStats();
  const topics = getTopics({ category: filter });

  // Re-render every minute so "x m ago" stays roughly accurate.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(n => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const filters = ["All", ...CATEGORIES];

  return (
    <main>
      <div className={styles.pageHero}>
        <div className="wrap">
          <h1 className={styles.pageTitle}>Forum</h1>
          <p className={styles.pageSubtitle}>
            Community discussions, ranked by activity over the last 7 days.
          </p>
          <div className={styles.pageMeta}>
            <span>{stats.totalTopics} topics</span>
            <span>·</span>
            <span>{stats.totalComments} comments</span>
            <span>·</span>
            <span>{stats.weeklyComments} new this week</span>
          </div>
        </div>
      </div>

      <div className="wrap">
        <NewTopicPanel />

        <div className={styles.filterBar}>
          {filters.map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
          <span className={styles.sortHint}>Sorted by replies in the last 7 days</span>
        </div>

        <section className={styles.list}>
          {topics.length === 0 ? (
            <div className={styles.empty}>No topics in this category yet.</div>
          ) : (
            topics.map(t => <TopicRow key={t.id} topic={t} />)
          )}
        </section>
      </div>
    </main>
  );
}
