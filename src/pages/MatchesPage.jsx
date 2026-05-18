import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { getMatchesByDate, formatTime } from "../services/api";
import { getCS2MatchesByDate, getLoLMatchesByDate } from "../services/liquipediaApi";
import { getLoLMatchesFromPandaScore } from "../services/pandascoreApi";

function getLoLMatchesByDateWithFallback(dateStr) {
  return getLoLMatchesByDate(dateStr).catch(() => getLoLMatchesFromPandaScore(dateStr));
}
import styles from "./MatchesPage.module.css";
import { useLanguage } from "../contexts/LanguageContext";

// ── Helpers ───────────────────────────────────────────────────────────────────
function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function shiftDate(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return toDateStr(d);
}
function formatDateLabel(dateStr, locale) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}
function displayHeader(match) {
  const h = match.match2bracketdata?.header;
  if (!h || h.startsWith("!")) return match.tournament;
  // Comma-separated multi-label → take the shortest readable one
  const label = h.includes(",") ? h.split(",")[0].trim() : h;
  // Strip HTML tags (e.g. "2<sup>nd</sup> Round" → "2nd Round")
  return label.replace(/<[^>]+>/g, "").trim() || match.tournament;
}
function nowUtcStr() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}
// Liquipedia sometimes doesn't update finished=0 for hours after a match ends.
// Treat as "live" only if started within the last 4 hours (CS2 BO3 ≤ ~3h).
function utcHoursAgo(h) {
  return new Date(Date.now() - h * 3600000).toISOString().replace("T", " ").slice(0, 19);
}

// ── Shared UI ─────────────────────────────────────────────────────────────────
function SectionHead({ live, title, count }) {
  return (
    <div className={styles.sectionHead}>
      {live && <span className={styles.sectionLiveDot} />}
      <h2 className={styles.sectionTitle}>{title}</h2>
      <span className={styles.sectionCount}>{count}</span>
    </div>
  );
}
function EmptyState({ text }) {
  return <div className={styles.empty}><span className={styles.emptyText}>{text}</span></div>;
}

// DateBar lives inside the hero (dark bg) — styles designed for dark context
function DateBar({ selected, todayStr, onChange }) {
  const { t } = useLanguage();
  return (
    <div className={styles.dateBar}>
      <button type="button" className={styles.dateNavBtn}
        onClick={() => onChange(shiftDate(selected, -1))} aria-label="Previous day">‹</button>
      <input type="date" className={styles.dateInput}
        value={selected} onChange={e => e.target.value && onChange(e.target.value)} />
      <button type="button" className={styles.dateNavBtn}
        onClick={() => onChange(shiftDate(selected, 1))} aria-label="Next day">›</button>
      {selected !== todayStr && (
        <button type="button" className={styles.dateTodayBtn}
          onClick={() => onChange(todayStr)}>{t("matches.today")}</button>
      )}
    </div>
  );
}

// ── Match row ─────────────────────────────────────────────────────────────────
function TeamCell({ opp, winner, loser, right }) {
  return (
    <div className={`${styles.teamCell} ${right ? styles.teamCellRight : ""}`}>
      {!right && opp.iconurl && (
        <img src={opp.iconurl} alt="" className={styles.teamLogo}
          referrerPolicy="no-referrer"
          onError={e => { e.target.style.display = "none"; }} />
      )}
      <span className={`${styles.upcomingTeam} ${winner ? styles.upcomingWinner : loser ? styles.upcomingLoser : ""}`}>
        {opp.name}
      </span>
      {right && opp.iconurl && (
        <img src={opp.iconurl} alt="" className={styles.teamLogo}
          referrerPolicy="no-referrer"
          onError={e => { e.target.style.display = "none"; }} />
      )}
    </div>
  );
}

function MatchRow({ match, forceUpcoming }) {
  const { t } = useLanguage();
  const opp1 = match.match2opponents?.[0];
  const opp2 = match.match2opponents?.[1];
  if (!opp1?.name || !opp2?.name) return null;

  const isFinished = match.finished === 1;
  const now    = nowUtcStr();
  const cutoff = utcHoursAgo(4);
  const isLive = !isFinished && !forceUpcoming
    && !match.date.startsWith("0000")
    && match.date < now
    && match.date >= cutoff;
  const isUpcoming = forceUpcoming || (!isFinished && !isLive);

  const winnerIdx = isFinished && match.winner ? parseInt(match.winner, 10) - 1 : -1;
  const score1 = (opp1.score ?? 0) < 0 ? 0 : (opp1.score ?? 0);
  const score2 = (opp2.score ?? 0) < 0 ? 0 : (opp2.score ?? 0);

  return (
    <Link to={`/match/${match.id}`} className={styles.upcomingRow}>
      <div className={styles.upcomingLeft}>
        {isLive
          ? <span className={styles.liveIndicator}>● LIVE</span>
          : <span className={styles.upcomingTime}>{formatTime(match.date)}</span>
        }
        <span className={styles.upcomingTournament}>
          {displayHeader(match)}
          {displayHeader(match) !== match.tournament && (
            <span className={styles.upcomingTournamentFull}> · {match.tournament}</span>
          )}
        </span>
      </div>

      <div className={styles.upcomingMatchup}>
        <TeamCell opp={opp1} winner={winnerIdx === 0} loser={winnerIdx === 1 && isFinished} />
        {isUpcoming
          ? <span className={styles.upcomingVs}>vs</span>
          : <span className={styles.upcomingScore}>{score1} : {score2}</span>
        }
        <TeamCell opp={opp2} winner={winnerIdx === 1} loser={winnerIdx === 0 && isFinished} right />
      </div>

      <div className={styles.upcomingRight}>
        <span className={styles.upcomingBo}>BO{match.bestof}</span>
        {match.stream?.twitch_en_1 && (
          <a href={match.stream.twitch_en_1} target="_blank" rel="noreferrer"
            className={styles.upcomingStream} onClick={e => e.stopPropagation()}>
            {t("matches.watch")}
          </a>
        )}
        <span className={styles.upcomingArrow}>›</span>
      </div>
    </Link>
  );
}

// ── API-backed matches view (CS2 and LoL share same UI, different fetch fn) ───
function ApiMatchesView({ selectedDate, todayStr, fetchByDate, label }) {
  const { t } = useLanguage();
  const isPast   = selectedDate < todayStr;
  const isToday  = selectedDate === todayStr;

  // Past → only Results; Today → all 3; Future → only Upcoming
  const TABS = isPast
    ? [{ id: "results",  label: t("matches.results") }]
    : isToday
      ? [
          { id: "results",  label: t("matches.todayResults") },
          { id: "live",     label: t("tournaments.ongoing") },
          { id: "upcoming", label: t("matches.upcomingToday") },
        ]
      : [{ id: "upcoming", label: t("matches.scheduled") }];

  const [activeTab, setActiveTab] = useState("results");
  const [allMatches, setAllMatches] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [apiError, setApiError]     = useState(false);

  // Reset tab on date change: future → upcoming, others → results
  useEffect(() => {
    setActiveTab(selectedDate > todayStr ? "upcoming" : "results");
  }, [selectedDate, todayStr]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setApiError(false);
    setAllMatches([]);
    fetchByDate(selectedDate)
      .then(data => { if (!cancelled) { setAllMatches(data); setLoading(false); } })
      .catch(() => { if (!cancelled) { setApiError(true); setLoading(false); } });
    return () => { cancelled = true; };
  }, [selectedDate, fetchByDate]);

  const now    = nowUtcStr();
  const cutoff = utcHoursAgo(4);
  const results  = allMatches.filter(m => m.finished === 1);
  const live     = allMatches.filter(m => m.finished !== 1 && !m.date.startsWith("0000") && m.date < now && m.date >= cutoff);
  const upcoming = allMatches.filter(m => m.finished !== 1 && (m.date.startsWith("0000") || m.date >= now));
  const tabData  = { results, live, upcoming };
  const shown    = tabData[activeTab] ?? [];

  const emptyText = {
    results:  isPast ? t("matches.noCompletedPast") : t("matches.noCompletedToday"),
    live:     t("home.liveNow") + " — " + t("tournaments.empty"),
    upcoming: t("matches.noMoreToday"),
  }[activeTab];

  return (
    <div style={{ paddingTop: 24, paddingBottom: 56 }}>
      <div className={styles.tabBar}>
        {TABS.map(tab => (
          <button key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            <span className={styles.tabCount}>{tabData[tab.id]?.length ?? 0}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <EmptyState text={t("common.loading")} />
      ) : apiError ? (
        <EmptyState text={t("common.apiError")} />
      ) : shown.length === 0 ? (
        <EmptyState text={emptyText} />
      ) : (
        <section className={styles.section}>
          <div className={styles.upcomingList}>
            {shown.map(m => (
              <MatchRow key={m.id} match={m} forceUpcoming={activeTab === "upcoming"} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MatchesPage({ wiki = "valorant" }) {
  const { t, lang } = useLanguage();
  const isCS2 = wiki === "counterstrike";
  const isLoL = wiki === "leagueoflegends";
  const todayStr = useMemo(() => toDateStr(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const locale = lang === "tr" ? "tr-TR" : "en-US";
  const isToday = selectedDate === todayStr;
  const isPast  = selectedDate < todayStr;

  // non-CS2 mock data
  const dateMatches = getMatchesByDate(selectedDate, wiki);
  const liveMatches = isToday ? dateMatches.filter(m => m.finished === 0) : [];
  const doneMatches = dateMatches.filter(m => m.finished === 1);
  const nextMatches = dateMatches.filter(m => m.finished !== 0 && m.finished !== 1);

  const dateLabel = formatDateLabel(selectedDate, locale);
  const relativeLabel = (() => {
    if (selectedDate === todayStr) return t("matches.today");
    if (selectedDate === shiftDate(todayStr, -1)) return t("matches.yesterday");
    if (selectedDate === shiftDate(todayStr, 1)) return t("matches.tomorrow");
    return null;
  })();

  const resultsTitle  = isPast ? t("matches.results")      : isToday ? t("matches.todayResults") : t("matches.completed");
  const upcomingTitle = isPast ? t("matches.cancelledTbd") : isToday ? t("matches.upcomingToday") : t("matches.scheduled");
  const emptyResults  = isPast ? t("matches.noCompletedPast") : t("matches.noCompletedToday");
  const emptyUpcoming = isPast ? t("matches.noRemainingPast") : isToday ? t("matches.noMoreToday") : t("matches.noScheduled");

  return (
    <main>
      <div className={styles.hero}>
        <div className="wrap">
          <h1 className={styles.heroTitle}>{t("matches.title")}</h1>
          <p className={styles.heroSubtitle}>
            {isCS2 ? t("matches.subtitleCS2")
              : isLoL ? t("matches.subtitleLoL")
              : relativeLabel ? `${relativeLabel} · ${dateLabel}` : dateLabel}
          </p>
          <DateBar selected={selectedDate} todayStr={todayStr} onChange={setSelectedDate} />
        </div>
      </div>

      <div className="wrap">
        {isCS2 ? (
          <ApiMatchesView selectedDate={selectedDate} todayStr={todayStr} fetchByDate={getCS2MatchesByDate} />
        ) : isLoL ? (
          <ApiMatchesView selectedDate={selectedDate} todayStr={todayStr} fetchByDate={getLoLMatchesByDateWithFallback} />
        ) : (
          <div style={{ paddingTop: 36, paddingBottom: 56 }}>
            {liveMatches.length > 0 && (
              <section className={styles.section}>
                <SectionHead live title={t("matches.liveNow")} count={liveMatches.length} />
                <div className={styles.upcomingList}>
                  {liveMatches.map(m => <MatchRow key={m.id} match={m} />)}
                </div>
              </section>
            )}
            <section className={styles.section}>
              <SectionHead title={resultsTitle} count={doneMatches.length} />
              {doneMatches.length > 0
                ? <div className={styles.upcomingList}>{doneMatches.map(m => <MatchRow key={m.id} match={m} />)}</div>
                : <EmptyState text={emptyResults} />}
            </section>
            {!isPast && (
              <section className={styles.section}>
                <SectionHead title={upcomingTitle} count={nextMatches.length} />
                {nextMatches.length > 0
                  ? <div className={styles.upcomingList}>{nextMatches.map(m => <MatchRow key={m.id} match={m} />)}</div>
                  : <EmptyState text={emptyUpcoming} />}
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
