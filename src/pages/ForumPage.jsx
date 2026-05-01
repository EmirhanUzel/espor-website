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
import { useLanguage } from "../contexts/LanguageContext";

function useForumSnapshot() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function NewTopicPanel({ onCreate }) {
  const { user, openAuth } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <div className={styles.guestCta}>
        <div className={styles.guestCtaCopy}>
          <strong>{t("forum.joinConversation")}</strong>
          <span>{t("forum.signInPrompt")}</span>
        </div>
        <div className={styles.guestCtaActions}>
          <button className={styles.btnGhost} onClick={() => openAuth("signin")}>{t("forum.signIn")}</button>
          <button className={styles.btnSolid} onClick={() => openAuth("register")}>{t("forum.register")}</button>
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <div className={styles.composerClosed}>
        <button className={styles.btnSolid} onClick={() => setOpen(true)}>{t("forum.newTopic")}</button>
        <span className={styles.composerHint}>{t("forum.postingAs")} <strong>{user.username}</strong></span>
      </div>
    );
  }

  const submit = (e) => {
    e.preventDefault();
    setError("");
    if (title.trim().length < 5) { setError(t("forum.titleError")); return; }
    if (body.trim().length < 10) { setError(t("forum.bodyError")); return; }
    const created = addTopic({ title, body, category, author: user });
    setTitle(""); setBody(""); setCategory(CATEGORIES[0]); setOpen(false);
    onCreate?.(created);
  };

  return (
    <form className={styles.composer} onSubmit={submit}>
      <div className={styles.composerHead}>
        <h3 className={styles.composerTitle}>{t("forum.startTopic")}</h3>
        <button type="button" className={styles.composerClose} onClick={() => setOpen(false)} aria-label="Close composer">×</button>
      </div>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>{t("forum.titleLabel")}</span>
        <input
          className={styles.fieldInput}
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={t("forum.titlePlaceholder")}
          maxLength={140}
        />
      </label>

      <div className={styles.fieldRow}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>{t("forum.categoryLabel")}</span>
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
        <span className={styles.fieldLabel}>{t("forum.bodyLabel")}</span>
        <textarea
          className={`${styles.fieldInput} ${styles.fieldTextarea}`}
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder={t("forum.bodyPlaceholder")}
          rows={5}
        />
      </label>

      {error && <div className={styles.composerError}>{error}</div>}

      <div className={styles.composerActions}>
        <button type="button" className={styles.btnGhost} onClick={() => setOpen(false)}>{t("forum.cancel")}</button>
        <button type="submit" className={styles.btnSolid}>{t("forum.post")}</button>
      </div>
    </form>
  );
}

function TopicRow({ topic }) {
  const { t } = useLanguage();
  return (
    <Link to={`/forum/${topic.id}`} className={styles.row}>
      <div className={styles.rowMain}>
        <div className={styles.rowMeta}>
          <span className={`${styles.cat} ${styles[`cat_${topic.category}`] || ""}`}>{topic.category}</span>
          <span className={styles.rowAuthor}>{t("forum.by")} <strong>{topic.authorUsername}</strong></span>
          <span className={styles.rowDot}>·</span>
          <span className={styles.rowDate}>{formatRelative(topic.createdAt)}</span>
        </div>
        <h3 className={styles.rowTitle}>{topic.title}</h3>
        <p className={styles.rowSnippet}>{topic.body}</p>
      </div>
      <div className={styles.rowStats}>
        <div className={styles.rowStatsBlock}>
          <span className={styles.rowStatsVal}>{topic.weeklyCommentCount}</span>
          <span className={styles.rowStatsLabel}>{t("forum.thisWeek")}</span>
        </div>
        <div className={`${styles.rowStatsBlock} ${styles.rowStatsBlockMuted}`}>
          <span className={styles.rowStatsVal}>{topic.commentCount}</span>
          <span className={styles.rowStatsLabel}>{t("forum.total")}</span>
        </div>
        <span className={styles.rowArrow}>›</span>
      </div>
    </Link>
  );
}

export default function ForumPage() {
  const { t } = useLanguage();
  useForumSnapshot();
  const [filter, setFilter] = useState("All");
  const stats = getStats();
  const topics = getTopics({ category: filter });

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
          <h1 className={styles.pageTitle}>{t("forum.title")}</h1>
          <p className={styles.pageSubtitle}>{t("forum.subtitle")}</p>
          <div className={styles.pageMeta}>
            <span>{stats.totalTopics} {t("forum.topicsUnit")}</span>
            <span>·</span>
            <span>{stats.totalComments} {t("forum.commentsUnit")}</span>
            <span>·</span>
            <span>{stats.weeklyComments} {t("forum.newThisWeek")}</span>
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
          <span className={styles.sortHint}>{t("forum.sortHint")}</span>
        </div>

        <section className={styles.list}>
          {topics.length === 0 ? (
            <div className={styles.empty}>{t("forum.empty")}</div>
          ) : (
            topics.map(topic => <TopicRow key={topic.id} topic={topic} />)
          )}
        </section>
      </div>
    </main>
  );
}
