import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getTournaments, getMatches, getInterviews, getTransfers,
  getStandings, getPlayers, getPrizeResults, getGuests, getTeams, getLiveMatches,
  formatDate, formatPrize, getFlag, tierLabel,
} from "../services/api";
import MatchCard from "../components/MatchCard";
import TournamentCard from "../components/TournamentCard";
import GroupStandings from "../components/GroupStandings";
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
                <div className={`${styles.heroTeam} ${grandFinal.winner === "1" ? styles.heroWinner : ""}`}>
                  <span className={styles.heroTeamName}>{opp1.name}</span>
                  <span className={styles.heroScoreNum}>{opp1.score}</span>
                </div>
                <span className={styles.heroVs}>:</span>
                <div className={`${styles.heroTeam} ${styles.heroTeamRight} ${grandFinal.winner === "2" ? styles.heroWinner : ""}`}>
                  <span className={styles.heroScoreNum}>{opp2.score}</span>
                  <span className={styles.heroTeamName}>{opp2.name}</span>
                </div>
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

// ── Stats Bar ──────────────────────────────────────────────────────────────────
function StatsBar({ wiki }) {
  const { t } = useLanguage();
  const tournaments = getTournaments(wiki);
  const teams       = getTeams(wiki);
  const liveCount   = getLiveMatches().length;
  const totalPrize  = tournaments.reduce((s, tr) => s + (tr.prizepool || 0), 0);

  const stats = [
    { value: formatPrize(totalPrize), label: t("home.totalPrize") },
    { value: tournaments.length,      label: t("home.tournamentsLabel") },
    { value: teams.length,            label: t("home.activeTeams") },
    { value: liveCount || "—",        label: t("home.liveNow"), live: liveCount > 0 },
  ];

  return (
    <div className={styles.statsBar}>
      {stats.map((s, i) => (
        <div key={i} className={styles.statItem}>
          <span className={`${styles.statValue} ${s.live ? styles.statLive : ""}`}>
            {s.value}
          </span>
          <span className={styles.statLabel}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Nav Cards ─────────────────────────────────────────────────────────────────
function NavCards() {
  const { t } = useLanguage();
  const NAV_CARDS = [
    { labelKey: "home.navTournaments", descKey: "home.navTournamentsDesc", to: "/tournaments" },
    { labelKey: "home.navMatches",     descKey: "home.navMatchesDesc",     to: "/matches" },
    { labelKey: "home.navTeams",       descKey: "home.navTeamsDesc",       to: "/teams" },
    { labelKey: "home.navPlayers",     descKey: "home.navPlayersDesc",     to: "/players" },
    { labelKey: "home.navTransfers",   descKey: "home.navTransfersDesc",   to: "/transfers" },
  ];
  return (
    <div className={styles.navCards}>
      {NAV_CARDS.map(c => (
        <Link key={c.to} to={c.to} className={styles.navCard}>
          <span className={styles.navCardLabel}>{t(c.labelKey)}</span>
          <span className={styles.navCardDesc}>{t(c.descKey)}</span>
          <span className={styles.navCardArrow}>→</span>
        </Link>
      ))}
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

// ── Prize Row ─────────────────────────────────────────────────────────────────
function PrizeRow({ result }) {
  const { t } = useLanguage();
  return (
    <div className={styles.prizeRow}>
      <span className={`${styles.prizePlacement} ${result.placement === "1" ? styles.prizeGold : ""}`}>
        {result.placement}
      </span>
      <span className={styles.prizeName}>{result.opponentname}</span>
      <div className={styles.prizeQual}>
        <span className={styles.prizeQualLabel}>{t("home.via")}</span>
        <span>{result.qualifier}</span>
      </div>
      {result.lastvsdata && (
        <div className={styles.prizeLastVs}>
          <span className={styles.prizeLastVsLabel}>{t("home.def")}</span>
          <span>{result.lastvsdata.opponentname} ({result.lastvsdata.score})</span>
        </div>
      )}
      <span className={styles.prizeMoney}>{formatPrize(result.prizemoney)}</span>
    </div>
  );
}

// ── Player Spotlight ───────────────────────────────────────────────────────────
function PlayerSpotlight({ player }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  if (!player) return null;
  const stats      = player.recentstats?.stats || [];
  const years      = Object.keys(player.earningsbyyear || {}).sort();
  const latestYear = years[years.length - 1];

  return (
    <div className={styles.spotlight} onClick={() => navigate(`/player/${player.id}`)}>
      <div className={styles.spotlightLeft}>
        <span className={styles.spotlightBadge}>{t("home.playerSpotlight")}</span>
        <div className={styles.spotlightAvatar}>{player.id[0].toUpperCase()}</div>
        <div className={styles.spotlightIdentity}>
          <span className={styles.spotlightNick}>{player.id}</span>
          <span className={styles.spotlightName}>{player.name}</span>
          <span className={styles.spotlightMeta}>
            {getFlag(player.nationality)} {player.nationality} · {player.teampagename}
          </span>
        </div>
      </div>

      {stats.length > 0 && (
        <div className={styles.spotlightStats}>
          <span className={styles.spotlightStatsLabel}>
            {player.recentstats.period} · {player.recentstats.games} {player.recentstats.gamesLabel}
          </span>
          <div className={styles.spotlightStatsGrid}>
            {stats.map(s => (
              <div key={s.label} className={styles.spotlightStat}>
                <span className={styles.spotlightStatVal}>{s.value}</span>
                <span className={styles.spotlightStatKey}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.spotlightEarnings}>
        <span className={styles.spotlightEarVal}>{formatPrize(player.earnings)}</span>
        <span className={styles.spotlightEarLabel}>{t("home.totalEarnings")}</span>
        {latestYear && (
          <span className={styles.spotlightEarYear}>
            {latestYear}: {formatPrize(player.earningsbyyear[latestYear])}
          </span>
        )}
      </div>

      <span className={styles.spotlightArrow}>→</span>
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────────
export default function Home({ wiki, region }) {
  const { t } = useLanguage();
  const tournaments  = getTournaments(wiki);
  const matches      = getMatches(wiki);
  const interviews   = getInterviews(wiki);
  const allTransfers = getTransfers();
  const standings    = getStandings(wiki);
  const players      = getPlayers(wiki);
  const prizeResults = getPrizeResults(wiki);
  const guests       = getGuests(wiki);

  const filteredTournaments = region && region !== "All"
    ? tournaments.filter(tr => tr.locations?.region === region)
    : tournaments;

  const carouselTournaments = filteredTournaments.length ? filteredTournaments : tournaments;
  const recentMatches       = matches.filter(m => m.finished === 1).slice(0, 3);
  const upcomingMatches     = matches.filter(m => m.finished !== 1).slice(0, 3);
  const recentInterviews    = interviews.slice(0, 3);
  const recentTransfers     = allTransfers.slice(0, 6);
  const spotlightPlayer     = players[0] || null;

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
        <StatsBar wiki={wiki} />
        <NavCards />

        <div className={styles.divider} />

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
            <SectionHead title={t("home.groupStandings")} />
            <GroupStandings groups={standings} />
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

        {prizeResults.length > 0 && (
          <section className={styles.section}>
            <SectionHead title={t("home.prizeDistribution")} />
            <div className={styles.prizeTable}>
              {prizeResults.slice(0, 8).map((r, i) => <PrizeRow key={i} result={r} />)}
            </div>
          </section>
        )}

        <div className={styles.divider} />

        {spotlightPlayer && (
          <section className={styles.section}>
            <PlayerSpotlight player={spotlightPlayer} />
          </section>
        )}

      </div>
    </main>
  );
}
