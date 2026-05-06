import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getTournaments, getMatches, getInterviews, getTransfers,
  getPlayers, getGuests,
  formatDate, formatPrize, getFlag, tierLabel,
} from "../services/api";
import { getTopics, formatRelative } from "../services/forum";
import MatchCard from "../components/MatchCard";
import TournamentCard from "../components/TournamentCard";
import styles from "./Home.module.css";
import { useLanguage } from "../contexts/LanguageContext";

// ── Section Header ─────────────────────────────────────────────────────────────
function SectionHead({ title, to, label }) {
  return (
    <div className={styles.sectionHead}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {to && <Link to={to} className={styles.seeAll}>{label} →</Link>}
    </div>
  );
}

// ── 1. Hero Banner ─────────────────────────────────────────────────────────────
function HeroBanner({ tournaments, allMatches }) {
  const { t } = useLanguage();
  const [idx, setIdx]     = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (tournaments.length <= 1) return;
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIdx(i => (i + 1) % tournaments.length);
        setFading(false);
      }, 300);
    }, 10000);
    return () => clearInterval(timer);
  }, [tournaments.length]);

  const goTo = (i) => {
    if (i === idx) return;
    setFading(true);
    setTimeout(() => { setIdx(i); setFading(false); }, 300);
  };

  if (!tournaments.length) return null;

  const tournament = tournaments[idx];
  const tournamentMatches = allMatches.filter(m => m.tournament === tournament.name);
  const grandFinal        = tournamentMatches.find(m => m.match2bracketdata?.header === "Grand Final");
  const [opp1, opp2]      = grandFinal?.match2opponents || [];

  return (
    <div className={styles.hero}>
      <div
        key={tournament.id}
        className={`${styles.heroBg} ${tournament.bannerurl ? "" : styles.heroBgFallback}`}
        style={tournament.bannerurl ? { backgroundImage: `url(${tournament.bannerurl})` } : {}}
      />
      <div className={styles.heroOverlay} />

      <div className="wrap">
        <div className={`${styles.heroContent} ${fading ? styles.heroFading : ""}`}>
          <div className={styles.heroLeft}>
            <span className={styles.heroPill}>
              {tierLabel(tournament.liquipediatier)}-Tier · {tournament.locations?.region}
            </span>
            <h1 className={styles.heroTitle}>{tournament.name}</h1>
            <div className={styles.heroMeta}>
              <span>{tournament.locations?.venue}, {tournament.locations?.city}</span>
              <span>·</span>
              <span>{formatDate(tournament.startdate)} – {formatDate(tournament.enddate)}</span>
              <span>·</span>
              <span className={styles.heroPrize}>{formatPrize(tournament.prizepool)}</span>
            </div>
            <div className={styles.heroTags}>
              <span className={styles.heroTag}>{tournament.participantsnumber} {t("home.teamsUnit")}</span>
              <span className={styles.heroTag}>{tournament.format}</span>
              {tournament.patch && <span className={styles.heroTag}>Patch {tournament.patch}</span>}
            </div>
            <div className={styles.heroActions}>
              <Link to={`/tournament/${tournament.id}`} className={styles.heroBtnPrimary}>{t("home.viewTournament")}</Link>
              {grandFinal && (
                <Link to={`/match/${grandFinal.id}`} className={styles.heroBtnSecondary}>{t("home.grandFinal")}</Link>
              )}
            </div>
          </div>

          {grandFinal && opp1 && opp2 && (
            <div className={styles.heroScore}>
              <span className={styles.heroScoreLabel}>{t("home.grandFinal")}</span>
              <div className={styles.heroScoreRow}>
                <span className={`${styles.heroTeamName} ${grandFinal.winner === "1" ? styles.heroWinner : ""}`}>{opp1.name}</span>
                <div className={styles.heroScoreCenter}>
                  <span className={`${styles.heroScoreNum} ${grandFinal.winner === "1" ? styles.heroWinnerScore : ""}`}>{opp1.score}</span>
                  <span className={styles.heroVs}>-</span>
                  <span className={`${styles.heroScoreNum} ${grandFinal.winner === "2" ? styles.heroWinnerScore : ""}`}>{opp2.score}</span>
                </div>
                <span className={`${styles.heroTeamName} ${styles.heroTeamRight} ${grandFinal.winner === "2" ? styles.heroWinner : ""}`}>{opp2.name}</span>
              </div>
              <div className={styles.heroMaps}>
                {grandFinal.match2games?.map((g, i) => (
                  <span key={i} className={`${styles.heroMap} ${g.winner === "1" ? styles.heroMapW1 : styles.heroMapW2}`}>
                    {g.map} {g.scores[0]}–{g.scores[1]}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {tournaments.length > 1 && (
          <div className={styles.heroDots}>
            {tournaments.map((t, i) => (
              <button
                key={t.id}
                className={`${styles.heroDot} ${i === idx ? styles.heroDotActive : ""}`}
                onClick={() => goTo(i)}
                aria-label={t.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



// ── Interview Card ─────────────────────────────────────────────────────────────
function InterviewCard({ item }) {
  return (
    <a href={item.link} target="_blank" rel="noreferrer" className={styles.interviewCard}>
      <div className={styles.interviewHead}>
        <span className={`${styles.interviewType} ${item.type === "Interview" ? styles.typeInterview : styles.typeArticle}`}>
          {item.type}
        </span>
        <span className={styles.interviewPublisher}>{item.publisher}</span>
        <span className={styles.interviewLang}>{item.language.toUpperCase()}</span>
      </div>
      <h3 className={styles.interviewTitle}>"{item.title}"</h3>
      <div className={styles.interviewFoot}>
        <span className={styles.interviewSubject}>{item.pagename}</span>
        <span className={styles.interviewDate}>{formatDate(item.date)}</span>
      </div>
    </a>
  );
}

// ── Transfer Row ───────────────────────────────────────────────────────────────
function TransferRow({ transfer }) {
  return (
    <div className={styles.transferRow}>
      <span className={styles.transferFlag}>{getFlag(transfer.nationality)}</span>
      <span className={styles.transferPlayer}>{transfer.player}</span>
      <span className={styles.transferNationality}>{transfer.nationality}</span>
      <div className={styles.transferMove}>
        <span className={styles.transferFrom}>{transfer.fromteam}</span>
        <span className={styles.transferArrow}>→</span>
        <span className={styles.transferTo}>{transfer.toteam}</span>
      </div>
      {transfer.role1 && <span className={styles.transferRole}>{transfer.role1}</span>}
      <span className={styles.transferDate}>{formatDate(transfer.date)}</span>
      {transfer.reference?.reference1 && (
        <a href={transfer.reference.reference1} target="_blank" rel="noreferrer"
          className={styles.transferRef} onClick={e => e.stopPropagation()}>↗</a>
      )}
    </div>
  );
}

// ── Guest Card ─────────────────────────────────────────────────────────────────
function GuestCard({ guest }) {
  return (
    <div className={styles.guestCard}>
      <span className={styles.guestFlag}>{getFlag(guest.flag)}</span>
      <div className={styles.guestInfo}>
        <span className={styles.guestName}>{guest.name}</span>
        <span className={styles.guestMeta}>
          <span className={styles.guestPos}>{guest.position}</span>
          <span>·</span>
          <span>{guest.language}</span>
        </span>
      </div>
      <span className={styles.guestDate}>{formatDate(guest.date)}</span>
    </div>
  );
}

// ── Forum Topic Row ────────────────────────────────────────────────────────────
function ForumTopicRow({ topic }) {
  return (
    <Link to={`/forum/${topic.id}`} className={styles.forumRow}>
      <span className={styles.forumCat}>{topic.category}</span>
      <span className={styles.forumTitle}>{topic.title}</span>
      <span className={styles.forumMeta}>
        <span>{topic.commentCount} {t("home.comments")}</span>
        <span>·</span>
        <span>{formatRelative(topic.createdAt)}</span>
      </span>
    </Link>
  );
}

// ── Player Carousel ────────────────────────────────────────────────────────────
function PlayerCard({ player }) {
  const navigate = useNavigate();

  return (
    <div className={styles.playerCard} onClick={() => navigate(`/player/${player.id}`)}>
      <div className={styles.playerCardAvatar}>{player.id[0].toUpperCase()}</div>
      <div className={styles.playerCardInfo}>
        <span className={styles.playerCardNick}>{player.id}</span>
        <span className={styles.playerCardTeam}>
          {getFlag(player.nationality)} {player.teampagename}
        </span>
      </div>
      {player.marketvalue && (
        <div className={styles.playerCardMarket}>
          <span className={styles.playerCardMarketVal}>{formatPrize(player.marketvalue)}</span>
          <span className={styles.playerCardMarketKey}>Piyasa Değeri</span>
        </div>
      )}
    </div>
  );
}

function PlayerCarousel({ players }) {
  const { t } = useLanguage();
  if (!players.length) return null;

  // İki kopya → sonsuz döngü için
  const doubled = [...players, ...players];
  const duration = Math.max(20, players.length * 5);

  return (
    <section className={styles.section}>
      <SectionHead title={t("home.playerSpotlight")} to="/players" label={t("home.seeAll")} />
      <div className={styles.playerCarousel}>
        <div
          className={styles.playerTrack}
          style={{ animationDuration: `${duration}s` }}
        >
          {doubled.map((p, i) => (
            <PlayerCard key={`${p.id}-${i}`} player={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────────
export default function Home({ wiki, region }) {
  const { t } = useLanguage();
  const tournaments  = getTournaments(wiki);
  const matches      = getMatches(wiki);
  const interviews   = getInterviews(wiki);
  const allTransfers = getTransfers();
  const players      = getPlayers(wiki);
  const guests = getGuests(wiki);

  const filteredTournaments = region && region !== "All"
    ? tournaments.filter(tr => tr.locations?.region === region)
    : tournaments;

  const carouselTournaments = filteredTournaments.length ? filteredTournaments : tournaments;
  const recentMatches       = matches.filter(m => m.finished === 1).slice(0, 3);
  const upcomingMatches     = matches.filter(m => m.finished !== 1).slice(0, 3);
  const recentInterviews    = interviews.slice(0, 3);
  const recentTransfers = allTransfers.slice(0, 6);
  const recentTopics    = getTopics().slice(0, 5);

  const today = new Date().toISOString().slice(0, 10);
  const pastTournaments = tournaments
    .filter(tr => tr.enddate && tr.enddate <= today)
    .sort((a, b) => b.enddate.localeCompare(a.enddate))
    .slice(0, 5);

  if (!tournaments.length && !matches.length) {
    return (
      <main>
        <div className="wrap" style={{ paddingTop: 80, textAlign: "center" }}>
          <p style={{ color: "var(--text-3)", fontSize: 18 }}>{t("home.noData")}</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <HeroBanner tournaments={carouselTournaments} allMatches={matches} />

      <div className="wrap">
        {recentMatches.length > 0 && (
          <section className={styles.section}>
            <SectionHead title={t("home.recentMatches")} to="/matches" label={t("home.seeAll")} />
            <div className={styles.matchGrid}>
              {recentMatches.map(m => <MatchCard key={m.id} match={m} />)}
            </div>
          </section>
        )}

        {upcomingMatches.length > 0 && (
          <section className={styles.section}>
            <SectionHead title={t("home.upcoming")} to="/matches" label={t("home.seeAll")} />
            <div className={styles.matchGrid}>
              {upcomingMatches.map(m => <MatchCard key={m.id} match={m} />)}
            </div>
          </section>
        )}

        <div className={styles.divider} />

        <div className={styles.twoCol}>
          <section className={styles.section}>
            <SectionHead title={t("home.tournaments")} to="/tournaments" label={t("home.seeAll")} />
            <div className={styles.tournamentList}>
              {filteredTournaments.map(tr => <TournamentCard key={tr.id} tournament={tr} />)}
            </div>
          </section>
          <section className={styles.section}>
            <SectionHead title={t("home.recentTournaments")} to="/tournaments" label={t("home.seeAll")} />
            <div className={styles.tournamentList}>
              {pastTournaments.map(tr => <TournamentCard key={tr.id} tournament={tr} />)}
            </div>
          </section>
        </div>

        <div className={styles.divider} />

        {recentInterviews.length > 0 && (
          <section className={styles.section}>
            <SectionHead title={t("home.newsInterviews")} to="/news" />
            <div className={styles.interviewGrid}>
              {recentInterviews.map(i => <InterviewCard key={i.pagename + i.date} item={i} />)}
            </div>
          </section>
        )}

        <div className={styles.divider} />

        <div className={styles.twoCol}>
          <section className={styles.section}>
            <SectionHead title={t("home.recentTransfers")} to="/transfers" />
            <div className={styles.transferList}>
              {recentTransfers.map((tr, i) => <TransferRow key={i} transfer={tr} />)}
            </div>
          </section>
          {guests.length > 0 && (
            <section className={styles.section}>
              <SectionHead title={t("home.eventGuests")} />
              <div className={styles.guestList}>
                {guests.map(g => <GuestCard key={g.id} guest={g} />)}
              </div>
            </section>
          )}
        </div>

        <div className={styles.divider} />

        {recentTopics.length > 0 && (
          <section className={styles.section}>
            <SectionHead title={t("home.forumHot")} to="/forum" label={t("home.seeAll")} />
            <div className={styles.forumList}>
              {recentTopics.map(tp => <ForumTopicRow key={tp.id} topic={tp} />)}
            </div>
          </section>
        )}

        <div className={styles.divider} />

        <PlayerCarousel players={players} />

      </div>
    </main>
  );
}
