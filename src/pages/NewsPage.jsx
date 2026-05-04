import { useState } from "react";
import { getInterviews, getGuests, formatDate, getFlag } from "../services/api";
import styles from "./NewsPage.module.css";
import { useLanguage } from "../contexts/LanguageContext";

const LANG_LABELS = {
  en: "English", tr: "Turkish", de: "German", fr: "French", ko: "Korean",
};

function InterviewCard({ item, featured = false }) {
  const { t } = useLanguage();
  return (
    <a href={item.link} target="_blank" rel="noreferrer"
      className={`${styles.card} ${featured ? styles.cardFeatured : ""}`}
    >
      <div className={styles.cardTop}>
        <div className={styles.cardBadges}>
          <span className={`${styles.typeBadge} ${item.type === "Interview" ? styles.typeInterview : styles.typeArticle}`}>
            {item.type}
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
        <span className={styles.cardLink}>{t("news.read")}</span>
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
  const { t } = useLanguage();
  const interviews = getInterviews(wiki);
  const guests = getGuests(wiki);
  const [filter, setFilter] = useState("All");

  const [publisherSearch, setPublisherSearch] = useState("");

  const types = ["All", ...new Set(interviews.map(i => i.type))];
  const publishers = [...new Set(interviews.map(i => i.publisher))];

  const byType = filter === "All" ? interviews : interviews.filter(i => i.type === filter);
  const filtered = publisherSearch.trim()
    ? byType.filter(i => i.publisher.toLowerCase().includes(publisherSearch.trim().toLowerCase()))
    : byType;

  const matchedPublishers = publisherSearch.trim()
    ? publishers.filter(p => p.toLowerCase().includes(publisherSearch.trim().toLowerCase()))
    : [];

  return (
    <main>
      <div className={styles.pageHero}>
        <div className="wrap">
          <h1 className={styles.pageTitle}>{t("news.title")}</h1>
          <p className={styles.pageSubtitle}>{t("news.subtitle")}</p>
          <div className={styles.pageMeta}>
            <span>{interviews.length} {t("news.articlesUnit")}</span>
            <span>·</span>
            <span>{publishers.join(", ")}</span>
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className={styles.filterBar}>
          {types.map(type => (
            <button
              key={type}
              className={`${styles.filterBtn} ${filter === type ? styles.filterBtnActive : ""}`}
              onClick={() => setFilter(type)}
            >
              {type === "All" ? t("news.all") : type}
              {type !== "All" && (
                <span className={styles.filterCount}>
                  {interviews.filter(i => i.type === type).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className={styles.publisherSearch}>
          <span className={styles.publisherSearchIcon}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            className={styles.publisherSearchInput}
            type="text"
            placeholder="Haber kanalı ara... (VLR.gg, HLTV.org…)"
            value={publisherSearch}
            onChange={e => setPublisherSearch(e.target.value)}
          />
          {publisherSearch && (
            <button className={styles.publisherSearchClear} onClick={() => setPublisherSearch("")}>✕</button>
          )}
          {matchedPublishers.length > 0 && (
            <div className={styles.publisherDropdown}>
              {matchedPublishers.map(p => (
                <button key={p} className={styles.publisherDropdownItem} onClick={() => setPublisherSearch(p)}>
                  <span className={styles.publisherDropdownName}>{p}</span>
                  <span className={styles.publisherDropdownCount}>{interviews.filter(i => i.publisher === p).length} haber</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {filtered.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t("news.featured")}</h2>
            <InterviewCard item={filtered[0]} featured />
          </section>
        )}

        {filtered.length > 1 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t("news.allArticles")}</h2>
            <div className={styles.grid}>
              {filtered.slice(1).map(item => (
                <InterviewCard key={item.pagename + item.date} item={item} />
              ))}
            </div>
          </section>
        )}

        {filtered.length === 0 && (
          <div className={styles.empty}>{t("news.empty")}</div>
        )}

        {guests.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t("news.eventGuests")}</h2>
            <div className={styles.guestGrid}>
              {guests.map(g => <GuestCard key={g.id} guest={g} />)}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
