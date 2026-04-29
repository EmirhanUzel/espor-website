import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getMatchesByDate, getLiveMatches, formatTime } from "../services/api";
import styles from "./MatchesPage.module.css";

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function shiftDate(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return toDateStr(d);
}
function formatDateLabel(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}
function relativeLabel(dateStr, todayStr) {
  if (dateStr === todayStr) return "Today";
  if (dateStr === shiftDate(todayStr, -1)) return "Yesterday";
  if (dateStr === shiftDate(todayStr,  1)) return "Tomorrow";
  return null;
}

const WIKI_TABS = [
  { id: null,               label: "All Games" },
  { id: "valorant",         label: "VALORANT" },
  { id: "counterstrike",    label: "CS2" },
  { id: "leagueoflegends",  label: "LoL" },
];

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
  return (
    <div className={styles.empty}>
      <span className={styles.emptyText}>{text}</span>
    </div>
  );
}

export default function MatchesPage() {
  const [activeWiki, setActiveWiki] = useState(null);
  const todayStr = useMemo(() => toDateStr(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const dateMatches  = getMatchesByDate(selectedDate, activeWiki);
  const isToday      = selectedDate === todayStr;
  const isPast       = selectedDate < todayStr;
  const liveMatches  = isToday ? dateMatches.filter(m => m.finished === 0) : [];
  const doneMatches  = dateMatches.filter(m => m.finished === 1);
  const nextMatches  = dateMatches.filter(m => m.finished !== 0 && m.finished !== 1);
  const totalLive    = getLiveMatches().length;

  const dateLabel = formatDateLabel(selectedDate);
  const rel       = relativeLabel(selectedDate, todayStr);

  const resultsTitle  = isPast ? "Results"        : isToday ? "Today's Results"   : "Completed";
  const upcomingTitle = isPast ? "Cancelled / TBD" : isToday ? "Upcoming Today"   : "Scheduled";
  const emptyResults  = isPast ? "No completed matches on this date." : isToday ? "No completed matches yet today." : "No completed matches on this date.";
  const emptyUpcoming = isPast ? "No remaining matches on this date." : isToday ? "No more matches scheduled today." : "No matches scheduled on this date.";

  return (
    <main>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.heroBreadcrumb}>
            <Link to="/" className={styles.breadLink}>Home</Link>
            <span className={styles.breadSep}>›</span>
            <span>Matches</span>
          </div>

          <div className={styles.heroRow}>
            <div>
              <h1 className={styles.heroTitle}>Matches</h1>
              <div className={styles.heroMeta}>
                {rel && <span className={styles.heroRel}>{rel}</span>}
                <span className={styles.heroDate}>{dateLabel}</span>
                {totalLive > 0 && (
                  <span className={styles.heroLive}>
                    <span className={styles.heroLiveDot} />
                    {totalLive} Live
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.dateBar}>
            <button
              type="button"
              className={styles.dateNavBtn}
              onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}
              aria-label="Previous day"
            >‹</button>

            <input
              type="date"
              className={styles.dateInput}
              value={selectedDate}
              onChange={e => e.target.value && setSelectedDate(e.target.value)}
            />

            <button
              type="button"
              className={styles.dateNavBtn}
              onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}
              aria-label="Next day"
            >›</button>

            {!isToday && (
              <button
                type="button"
                className={styles.dateTodayBtn}
                onClick={() => setSelectedDate(todayStr)}
              >Today</button>
            )}
          </div>

          <div className={styles.wikiFilter}>
            {WIKI_TABS.map(tab => (
              <button
                key={String(tab.id)}
                className={`${styles.wikiBtn} ${activeWiki === tab.id ? styles.wikiBtnActive : ""}`}
                onClick={() => setActiveWiki(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap" style={{ paddingTop: 36, paddingBottom: 56 }}>

        {liveMatches.length > 0 && (
          <section className={styles.section}>
            <SectionHead live title="Live Now" count={liveMatches.length} />
            <div className={styles.upcomingList}>
              {liveMatches.map(m => <MatchRow key={m.id} match={m} />)}
            </div>
          </section>
        )}

        <section className={styles.section}>
          <SectionHead title={resultsTitle} count={doneMatches.length} />
          {doneMatches.length > 0
            ? (
              <div className={styles.upcomingList}>
                {doneMatches.map(m => <MatchRow key={m.id} match={m} />)}
              </div>
            )
            : <EmptyState text={emptyResults} />
          }
        </section>

        {!isPast && (
          <section className={styles.section}>
            <SectionHead title={upcomingTitle} count={nextMatches.length} />
            {nextMatches.length > 0
              ? (
                <div className={styles.upcomingList}>
                  {nextMatches.map(m => <MatchRow key={m.id} match={m} />)}
                </div>
              )
              : <EmptyState text={emptyUpcoming} />
            }
          </section>
        )}

      </div>
    </main>
  );
}

function MatchRow({ match }) {
  const [opp1, opp2] = match.match2opponents;
  const isLive     = match.finished === 0;
  const isFinished = match.finished === 1;
  const winnerIdx  = match.winner != null ? parseInt(match.winner, 10) - 1 : -1;

  return (
    <Link to={`/match/${match.id}`} className={styles.upcomingRow}>
      <div className={styles.upcomingLeft}>
        {isLive
          ? <span className={styles.liveIndicator}>● LIVE</span>
          : <span className={styles.upcomingTime}>{formatTime(match.date)}</span>
        }
        <span className={styles.upcomingTournament}>
          {match.match2bracketdata?.header || match.tournament}
          <span className={styles.upcomingTournamentFull}> · {match.tournament}</span>
        </span>
      </div>

      <div className={styles.upcomingMatchup}>
        <span className={`${styles.upcomingTeam} ${winnerIdx === 0 ? styles.upcomingWinner : winnerIdx !== -1 && isFinished ? styles.upcomingLoser : ""}`}>
          {opp1?.name}
        </span>

        {(isLive || isFinished)
          ? <span className={styles.upcomingScore}>{opp1?.score ?? 0} : {opp2?.score ?? 0}</span>
          : <span className={styles.upcomingVs}>vs</span>
        }

        <span className={`${styles.upcomingTeam} ${winnerIdx === 1 ? styles.upcomingWinner : winnerIdx !== -1 && isFinished ? styles.upcomingLoser : ""}`}>
          {opp2?.name}
        </span>
      </div>

      <div className={styles.upcomingRight}>
        <span className={styles.upcomingBo}>BO{match.bestof}</span>
        {match.stream?.twitch_en_1 && (
          <a
            href={match.stream.twitch_en_1}
            target="_blank"
            rel="noreferrer"
            className={styles.upcomingStream}
            onClick={e => e.stopPropagation()}
          >
            ▶ Watch
          </a>
        )}
        <span className={styles.upcomingArrow}>›</span>
      </div>
    </Link>
  );
}
