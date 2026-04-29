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

// ── Section Header ─────────────────────────────────────────────────────────────
function SectionHead({ title, to, label = "See All" }) {
  return (
    <div className={styles.sectionHead}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {to && <Link to={to} className={styles.seeAll}>{label} →</Link>}
    </div>
  );
}

// ── 1. Hero Banner — carousel + bannerurl arka plan ───────────────────────────
function HeroBanner({ tournaments, allMatches }) {
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
      {/* Arka plan — bannerurl varsa resim, yoksa gradient */}
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
              <span className={styles.heroTag}>{tournament.participantsnumber} Teams</span>
              <span className={styles.heroTag}>{tournament.format}</span>
              {tournament.patch && <span className={styles.heroTag}>Patch {tournament.patch}</span>}
            </div>
            <div className={styles.heroActions}>
              <Link to={`/tournament/${tournament.id}`} className={styles.heroBtnPrimary}>View Tournament →</Link>
              {grandFinal && (
                <Link to={`/match/${grandFinal.id}`} className={styles.heroBtnSecondary}>Grand Final</Link>
              )}
            </div>
          </div>

          {grandFinal && opp1 && opp2 && (
            <div className={styles.heroScore}>
              <span className={styles.heroScoreLabel}>Grand Final</span>
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

        {/* Dot navigasyon */}
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

// ── 4. Stats Bar ───────────────────────────────────────────────────────────────
function StatsBar({ wiki }) {
  const tournaments = getTournaments(wiki);
  const teams       = getTeams(wiki);
  const players     = getPlayers(wiki);
  const liveCount   = getLiveMatches().length;
  const totalPrize  = tournaments.reduce((s, t) => s + (t.prizepool || 0), 0);

  const stats = [
    { value: formatPrize(totalPrize), label: "Total Prize Pool" },
    { value: tournaments.length,      label: "Tournaments" },
    { value: teams.length,            label: "Active Teams" },
    { value: liveCount || "—",        label: "Live Now", live: liveCount > 0 },
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

// ── 3. Nav Cards ──────────────────────────────────────────────────────────────
const NAV_CARDS = [
  { label: "Tournaments", desc: "Schedules & results", to: "/tournaments" },
  { label: "Matches",     desc: "Live & upcoming",    to: "/matches" },
  { label: "Teams",       desc: "Rankings & rosters", to: "/teams" },
  { label: "Players",     desc: "Stats & profiles",   to: "/players" },
  { label: "Transfers",   desc: "Latest moves",       to: "/transfers" },
];

function NavCards() {
  return (
    <div className={styles.navCards}>
      {NAV_CARDS.map(c => (
        <Link key={c.to} to={c.to} className={styles.navCard}>
          <span className={styles.navCardLabel}>{c.label}</span>
          <span className={styles.navCardDesc}>{c.desc}</span>
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
  return (
    <div className={styles.prizeRow}>
      <span className={`${styles.prizePlacement} ${result.placement === "1" ? styles.prizeGold : ""}`}>
        {result.placement}
      </span>
      <span className={styles.prizeName}>{result.opponentname}</span>
      <div className={styles.prizeQual}>
        <span className={styles.prizeQualLabel}>Via:</span>
        <span>{result.qualifier}</span>
      </div>
      {result.lastvsdata && (
        <div className={styles.prizeLastVs}>
          <span className={styles.prizeLastVsLabel}>def.</span>
          <span>{result.lastvsdata.opponentname} ({result.lastvsdata.score})</span>
        </div>
      )}
      <span className={styles.prizeMoney}>{formatPrize(result.prizemoney)}</span>
    </div>
  );
}

// ── 6. Player Spotlight ────────────────────────────────────────────────────────
function PlayerSpotlight({ player }) {
  const navigate = useNavigate();
  if (!player) return null;
  const stats      = player.recentstats?.stats || [];
  const years      = Object.keys(player.earningsbyyear || {}).sort();
  const latestYear = years[years.length - 1];

  return (
    <div className={styles.spotlight} onClick={() => navigate(`/player/${player.id}`)}>
      <div className={styles.spotlightLeft}>
        <span className={styles.spotlightBadge}>Player Spotlight</span>
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
        <span className={styles.spotlightEarLabel}>Total Earnings</span>
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
  const tournaments  = getTournaments(wiki);
  const matches      = getMatches(wiki);
  const interviews   = getInterviews(wiki);
  const allTransfers = getTransfers();
  const standings    = getStandings(wiki);
  const players      = getPlayers(wiki);
  const prizeResults = getPrizeResults(wiki);
  const guests       = getGuests(wiki);

  const filteredTournaments = region && region !== "All"
    ? tournaments.filter(t => t.locations?.region === region)
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
          <p style={{ color: "var(--text-3)", fontSize: 18 }}>No data available for this game yet.</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      {/* 1. Hero — carousel */}
      <HeroBanner tournaments={carouselTournaments} allMatches={matches} />

      <div className="wrap">

        {/* 4. Stats Bar */}
        <StatsBar wiki={wiki} />

        {/* 3. Nav Cards */}
        <NavCards />

        {/* 7. Divider */}
        <div className={styles.divider} />

        {/* Recent Matches */}
        {recentMatches.length > 0 && (
          <section className={styles.section}>
            <SectionHead title="Recent Matches" to="/matches" label="See All" />
            <div className={styles.matchGrid}>
              {recentMatches.map(m => <MatchCard key={m.id} match={m} />)}
            </div>
          </section>
        )}

        {/* 2. Upcoming Matches */}
        {upcomingMatches.length > 0 && (
          <section className={styles.section}>
            <SectionHead title="Upcoming" to="/matches" label="See All" />
            <div className={styles.matchGrid}>
              {upcomingMatches.map(m => <MatchCard key={m.id} match={m} />)}
            </div>
          </section>
        )}

        {/* 7. Divider */}
        <div className={styles.divider} />

        {/* 5. Tournaments + Standings */}
        <div className={styles.twoCol}>
          <section className={styles.section}>
            <SectionHead title="Tournaments" to="/tournaments" label="See All" />
            <div className={styles.tournamentList}>
              {filteredTournaments.map(t => <TournamentCard key={t.id} tournament={t} />)}
            </div>
          </section>
          <section className={styles.section}>
            <SectionHead title="Group Standings" />
            <GroupStandings groups={standings} />
          </section>
        </div>

        {/* 7. Divider */}
        <div className={styles.divider} />

        {/* 5. News (yukarı alındı) */}
        {recentInterviews.length > 0 && (
          <section className={styles.section}>
            <SectionHead title="News & Interviews" to="/news" />
            <div className={styles.interviewGrid}>
              {recentInterviews.map(i => <InterviewCard key={i.pagename + i.date} item={i} />)}
            </div>
          </section>
        )}

        {/* 7. Divider */}
        <div className={styles.divider} />

        {/* 5. Transfers + Guests */}
        <div className={styles.twoCol}>
          <section className={styles.section}>
            <SectionHead title="Recent Transfers" to="/transfers" />
            <div className={styles.transferList}>
              {recentTransfers.map((t, i) => <TransferRow key={i} transfer={t} />)}
            </div>
          </section>
          {guests.length > 0 && (
            <section className={styles.section}>
              <SectionHead title="Event Guests & Analysts" />
              <div className={styles.guestList}>
                {guests.map(g => <GuestCard key={g.id} guest={g} />)}
              </div>
            </section>
          )}
        </div>

        {/* Prize Distribution (alta alındı) */}
        {prizeResults.length > 0 && (
          <section className={styles.section}>
            <SectionHead title="Prize Distribution" />
            <div className={styles.prizeTable}>
              {prizeResults.slice(0, 8).map((r, i) => <PrizeRow key={i} result={r} />)}
            </div>
          </section>
        )}

        {/* 7. Divider */}
        <div className={styles.divider} />

        {/* 6. Player Spotlight */}
        {spotlightPlayer && (
          <section className={styles.section}>
            <PlayerSpotlight player={spotlightPlayer} />
          </section>
        )}

      </div>
    </main>
  );
}
