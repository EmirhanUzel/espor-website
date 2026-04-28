import { useState } from "react";
import { getInterviews, getGuests, formatDate, getFlag } from "../services/api";
import styles from "./NewsPage.module.css";

const TYPE_LABELS = {
  Interview: "Interview", Article: "Article", Preview: "Preview", Review: "Review",
};

const LANG_LABELS = {
  en: "English", tr: "Turkish", de: "German", fr: "French", ko: "Korean",
};

function InterviewCard({ item, featured = false }) {
  return (
    <a href={item.link} target="_blank" rel="noreferrer"
      className={`${styles.card} ${featured ? styles.cardFeatured : ""}`}
    >
      <div className={styles.cardTop}>
        <div className={styles.cardBadges}>
          <span className={`${styles.typeBadge} ${item.type === "Interview" ? styles.typeInterview : styles.typeArticle}`}>
            {TYPE_LABELS[item.type] || item.type}
          </span>
          <span className={styles.publisherBadge}>{item.publisher}</span>
        </div>
        <span className={styles.langBadge}>
          {getFlag(item.language === "en" ? "united kingdom" : item.language === "tr" ? "turkey" : item.language === "de" ? "germany" : "france")}{" "}
          {LANG_LABELS[item.language] || item.language.toUpperCase()}
        </span>
      </div>

      <h2 className={styles.cardTitle}>"{item.title}"</h2>

      <div className={styles.cardFoot}>
        <span className={styles.cardSubject}>{item.pagename}</span>
        <span className={styles.cardDate}>{formatDate(item.date)}</span>
        <span className={styles.cardLink}>Read ↗</span>
      </div>
    </a>
  );
}

function GuestCard({ guest }) {
  return (
    <div className={styles.guestCard}>
      <div className={styles.guestAvatar}>{guest.name[0]}</div>
      <div className={styles.guestInfo}>
        <span className={styles.guestName}>{guest.name}</span>
        <span className={styles.guestMeta}>
          <span className={styles.guestPosBadge}>{guest.position}</span>
          <span>{guest.language}</span>
          <span>{getFlag(guest.flag)}</span>
        </span>
      </div>
      <span className={styles.guestDate}>{formatDate(guest.date)}</span>
    </div>
  );
}

export default function NewsPage({ wiki }) {
  const interviews = getInterviews(wiki);
  const guests = getGuests(wiki);
  const [filter, setFilter] = useState("All");

  const types = ["All", ...new Set(interviews.map(i => i.type))];
  const filtered = filter === "All" ? interviews : interviews.filter(i => i.type === filter);
  const publishers = [...new Set(interviews.map(i => i.publisher))];

  return (
    <main>
      <div className={styles.pageHero}>
        <div className="wrap">
          <h1 className={styles.pageTitle}>News & Interviews</h1>
          <p className={styles.pageSubtitle}>Latest from players, teams and tournaments</p>
          <div className={styles.pageMeta}>
            <span>{interviews.length} articles</span>
            <span>·</span>
            <span>{publishers.join(", ")}</span>
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className={styles.filterBar}>
          {types.map(t => (
            <button
              key={t}
              className={`${styles.filterBtn} ${filter === t ? styles.filterBtnActive : ""}`}
              onClick={() => setFilter(t)}
            >
              {t}
              {t !== "All" && (
                <span className={styles.filterCount}>
                  {interviews.filter(i => i.type === t).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className={styles.statsRow}>
          {publishers.map(p => {
            const count = interviews.filter(i => i.publisher === p).length;
            return (
              <div key={p} className={styles.statPill}>
                <span className={styles.statPillVal}>{count}</span>
                <span className={styles.statPillLabel}>{p}</span>
              </div>
            );
          })}
        </div>

        {filtered.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Featured</h2>
            <InterviewCard item={filtered[0]} featured />
          </section>
        )}

        {filtered.length > 1 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>All Articles</h2>
            <div className={styles.grid}>
              {filtered.slice(1).map(item => (
                <InterviewCard key={item.pagename + item.date} item={item} />
              ))}
            </div>
          </section>
        )}

        {filtered.length === 0 && (
          <div className={styles.empty}>No articles found for this filter.</div>
        )}

        {guests.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Event Guests & Casters</h2>
            <div className={styles.guestGrid}>
              {guests.map(g => <GuestCard key={g.id} guest={g} />)}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
