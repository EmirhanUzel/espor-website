import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getTournaments, getMatches, getInterviews, getTransfers,
  getPlayers, getGuests,
  formatDate, formatPrize, getFlag, tierLabel,
} from "../services/api";
import {
  getCS2FeaturedTournaments, getCS2TournamentMatches, getCS2OngoingMatches, getCS2RecentTournaments, getCS2Transfers,
  getLoLFeaturedTournaments, getLoLTournamentMatches, getLoLNextMatches, getLoLRecentTournaments, getLoLTransfers,
} from "../services/liquipediaApi";
import { getLoLMatchesFromPandaScore, getLoLUpcomingMatchesFromPandaScore } from "../services/pandascoreApi";
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
  const [idx, setIdx]           = useState(0);
  const [fading, setFading]     = useState(false);
  const [bannerOk, setBannerOk] = useState(true);

  useEffect(() => { setBannerOk(true); }, [idx]);

  useEffect(() => {
    if (tournaments.length <= 1) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    const onVisChange = () => { if (document.hidden) clearInterval(timer); };
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIdx(i => (i + 1) % tournaments.length);
        setFading(false);
      }, 300);
    }, 10000);
    document.addEventListener('visibilitychange', onVisChange);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', onVisChange); };
  }, [tournaments.length]);

  const goTo = (i) => {
    if (i === idx) return;
    setFading(true);
    setTimeout(() => { setIdx(i); setFading(false); }, 300);
  };

  if (!tournaments.length) return null;

  const safeIdx = tournaments.length > 0 ? idx % tournaments.length : 0;
  const tournament = tournaments[safeIdx];
  const tournamentMatches = allMatches.filter(m => m.tournament === tournament.name);

  // Support mock data, Liquipedia "Grand Final" header, and LoL "!gf" / "Final" notations
  const finished = tournamentMatches.filter(m => m.finished === 1);
  const normalizeHeader = h => (h || '').replace(/^!/, '').toLowerCase();
  const grandFinal = finished.find(m => {
    const h = normalizeHeader(m.match2bracketdata?.header);
    return h === 'grand final' || h === 'gf' || h.includes('final');
  }) || finished.sort((a, b) => b.date.localeCompare(a.date))[0] || null;
  const [opp1, opp2] = grandFinal?.match2opponents || [];

  return (
    <div className={styles.hero}>
      <div key={tournament.id} className={`${styles.heroBg} ${!tournament.bannerurl || !bannerOk ? styles.heroBgFallback : ""}`}>
        {tournament.bannerurl && bannerOk && (
          <img
            src={tournament.bannerurl}
            alt=""
            className={styles.heroBgImg}
            referrerPolicy="no-referrer"
            onError={() => setBannerOk(false)}
          />
        )}
      </div>
      <div className={styles.heroOverlay} />

      <div className="wrap">
        <div className={`${styles.heroContent} ${fading ? styles.heroFading : ""}`}>
          <div className={styles.heroLeft}>
            <span className={styles.heroPill}>
              {tournament.liquipediatiertype
                ? tournament.liquipediatiertype
                : `${tierLabel(tournament.liquipediatier)}-Tier`} · {tournament.locations?.region}
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
              <div className={styles.heroScoreRow}>
                <span className={`${styles.heroTeamName} ${grandFinal.winner === "1" ? styles.heroWinner : ""}`}>{opp1.name}</span>
                <div className={styles.heroScoreCenter}>
                  <span className={`${styles.heroScoreNum} ${grandFinal.winner === "1" ? styles.heroWinnerScore : ""}`}>{opp1.score < 0 ? 0 : opp1.score}</span>
                  <span className={styles.heroVs}>-</span>
                  <span className={`${styles.heroScoreNum} ${grandFinal.winner === "2" ? styles.heroWinnerScore : ""}`}>{opp2.score < 0 ? 0 : opp2.score}</span>
                </div>
                <span className={`${styles.heroTeamName} ${styles.heroTeamRight} ${grandFinal.winner === "2" ? styles.heroWinner : ""}`}>{opp2.name}</span>
              </div>
              <div className={styles.heroMaps}>
                {grandFinal.match2games
                  ?.filter(g => g.winner === "1" || g.winner === "2")
                  .map((g, i) => (
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
            {tournaments.map((tournament, i) => (
              <button
                key={tournament.id}
                className={`${styles.heroDot} ${i === safeIdx ? styles.heroDotActive : ""}`}
                onClick={() => goTo(i)}
                aria-label={tournament.name}
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
  const { t } = useLanguage();
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
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className={styles.playerCard} onClick={() => navigate(`/player/${player.id}`)}>
      <div className={styles.playerCardAvatar}>{player.id?.[0]?.toUpperCase() ?? '?'}</div>
      <div className={styles.playerCardInfo}>
        <span className={styles.playerCardNick}>{player.id}</span>
        <span className={styles.playerCardTeam}>
          {getFlag(player.nationality)} {player.teampagename}
        </span>
      </div>
      {player.marketvalue && (
        <div className={styles.playerCardMarket}>
          <span className={styles.playerCardMarketVal}>{formatPrize(player.marketvalue)}</span>
          <span className={styles.playerCardMarketKey}>{t("player.marketValue")}</span>
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

  // Live CS2 data from Liquipedia API
  const [cs2Tournaments, setCS2Tournaments]         = useState([]);
  const [cs2RecentMatches, setCS2RecentMatches]     = useState([]);
  const [cs2UpcomingMatches, setCS2UpcomingMatches] = useState([]);
  const [cs2PastTournaments, setCS2PastTournaments] = useState([]);
  const [cs2Transfers, setCS2Transfers]             = useState([]);
  const [cs2Loading, setCS2Loading]                 = useState(false);
  const [cs2Error, setCS2Error]                     = useState(null);

  useEffect(() => {
    if (wiki !== "counterstrike") return;
    let cancelled = false;
    setCS2Loading(true);
    setCS2Error(null);

    Promise.all([
      getCS2FeaturedTournaments(),
      getCS2RecentTournaments(),
      getCS2Transfers(),
    ])
      .then(async ([tourneys, pastTourneys, transfers]) => {
        if (cancelled) return;
        setCS2Tournaments(tourneys);
        setCS2PastTournaments(pastTourneys);
        setCS2Transfers(transfers);

        const first = tourneys[0];
        const ongoingNames = tourneys.filter(t => t._ongoing).map(t => t.name);

        const [heroMs, upcomingMs] = await Promise.all([
          first?.name ? getCS2TournamentMatches(first.name) : Promise.resolve([]),
          ongoingNames.length ? getCS2OngoingMatches(ongoingNames) : Promise.resolve([]),
        ]);
        if (!cancelled) {
          setCS2RecentMatches(heroMs);
          setCS2UpcomingMatches(upcomingMs);
        }
      })
      .catch((err) => { if (!cancelled) setCS2Error(err.message); })
      .finally(() => { if (!cancelled) setCS2Loading(false); });

    return () => { cancelled = true; };
  }, [wiki]);

  // Live LoL data from Liquipedia API
  const [lolTournaments, setLoLTournaments]         = useState([]);
  const [lolRecentMatches, setLoLRecentMatches]     = useState([]);
  const [lolUpcomingMatches, setLoLUpcomingMatches] = useState([]);
  const [lolPastTournaments, setLoLPastTournaments] = useState([]);
  const [lolTransfers, setLoLTransfers]             = useState([]);
  const [lolLoading, setLoLLoading]                 = useState(false);
  const [lolError, setLoLError]                     = useState(null);

  useEffect(() => {
    if (wiki !== "leagueoflegends") return;
    let cancelled = false;
    setLoLLoading(true);
    setLoLError(null);

    Promise.all([
      getLoLFeaturedTournaments(),
      getLoLRecentTournaments(),
      getLoLTransfers(),
    ])
      .then(async ([tourneys, pastTourneys, transfers]) => {
        if (cancelled) return;
        setLoLTournaments(tourneys);
        setLoLPastTournaments(pastTourneys);
        setLoLTransfers(transfers);

        const first = tourneys[0];

        const [heroMs, upcomingMs] = await Promise.all([
          first?.name ? getLoLTournamentMatches(first.name) : Promise.resolve([]),
          getLoLNextMatches(6),
        ]);

        // Eğer mevcut turnuvada bitmiş maç yoksa en son geçmiş turnuvadan çek
        let finalHeroMs = heroMs;
        if (!cancelled && !heroMs.some(m => m.finished === 1) && pastTourneys[0]?.name) {
          finalHeroMs = await getLoLTournamentMatches(pastTourneys[0].name);
        }

        if (!cancelled) {
          setLoLRecentMatches(finalHeroMs);
          setLoLUpcomingMatches(upcomingMs);
          // PandaScore fallback when Liquipedia returns empty data
          if (!finalHeroMs.length && !upcomingMs.length) {
            const [psRecent, psUpcoming] = await Promise.all([
              getLoLMatchesFromPandaScore(),
              getLoLUpcomingMatchesFromPandaScore(6),
            ]);
            if (!cancelled && (psRecent.length || psUpcoming.length)) {
              setLoLRecentMatches(psRecent);
              setLoLUpcomingMatches(psUpcoming);
            }
          }
        }
      })
      .catch(async (err) => {
        if (cancelled) return;
        // Liquipedia 502/rate-limit → PandaScore fallback
        const [psRecent, psUpcoming] = await Promise.all([
          getLoLMatchesFromPandaScore(),
          getLoLUpcomingMatchesFromPandaScore(6),
        ]);
        if (!cancelled) {
          setLoLRecentMatches(psRecent);
          setLoLUpcomingMatches(psUpcoming);
          if (!psRecent.length && !psUpcoming.length) setLoLError(err.message);
        }
      })
      .finally(() => { if (!cancelled) setLoLLoading(false); });

    return () => { cancelled = true; };
  }, [wiki]);

  const mockTournaments = getTournaments(wiki);
  const mockMatches     = getMatches(wiki);

  const isCS2 = wiki === "counterstrike";
  const isLoL = wiki === "leagueoflegends";

  const tournaments = (isCS2 && cs2Tournaments.length) ? cs2Tournaments
    : isLoL ? lolTournaments
    : mockTournaments;

  // Hero Grand Final lookup — tüm maçlar (finished + upcoming)
  const matches = (isCS2 && cs2RecentMatches.length) ? cs2RecentMatches
    : isLoL ? lolRecentMatches
    : mockMatches;

  // Recent matches display — sadece bitmiş maçlar; LoL için mock'a düşme
  const finishedApiMatches = isLoL ? lolRecentMatches.filter(m => m.finished === 1) : [];
  const recentMatchesSource = (isCS2 && cs2RecentMatches.length) ? cs2RecentMatches
    : isLoL ? finishedApiMatches
    : mockMatches;

  const interviews   = getInterviews(wiki);
  const allTransfers = getTransfers();
  const players      = getPlayers(wiki);
  const guests = getGuests(wiki);

  const filteredTournaments = region && region !== "All"
    ? tournaments.filter(tr => tr.locations?.region === region)
    : tournaments;

  // Hero carousel: only ongoing/upcoming tournaments (never past ones)
  const _carouselToday = new Date().toISOString().slice(0, 10);
  const _carouselBase = filteredTournaments.length ? filteredTournaments : tournaments;
  const carouselTournaments = _carouselBase.filter(tr => !tr.enddate || tr.enddate >= _carouselToday);

  // Tournaments section: sort strictly by startdate ascending
  const displayTournaments = [...filteredTournaments].sort((a, b) =>
    (a.startdate || "").localeCompare(b.startdate || "")
  );

  const recentMatches   = recentMatchesSource.filter(m => m.finished === 1).slice(0, 3);
  // CS2/LoL: use dedicated upcoming matches from ongoing tournaments; others: filter from mock
  const mockUpcoming = mockMatches.filter(m => m.finished !== 1 && m.match2opponents?.[0]?.name && m.match2opponents?.[1]?.name);
  const upcomingMatches = isCS2 ? cs2UpcomingMatches.slice(0, 3)
    : isLoL ? lolUpcomingMatches.slice(0, 3)
    : mockUpcoming.slice(0, 3);

  const recentInterviews = interviews.slice(0, 3);
  // CS2/LoL: use live transfer data; others: use mock
  const recentTransfers  = (isCS2 && cs2Transfers.length) ? cs2Transfers.slice(0, 5)
    : isLoL ? lolTransfers.slice(0, 5)
    : allTransfers.slice(0, 6);
  const recentTopics     = getTopics().slice(0, 5);

  const today = new Date().toISOString().slice(0, 10);
  // CS2/LoL: use live past tournaments from API; others: derive from mock data
  const pastTournaments = (isCS2 && cs2PastTournaments.length) ? cs2PastTournaments
    : isLoL ? lolPastTournaments
    : tournaments
        .filter(tr => tr.enddate && tr.enddate <= today)
        .sort((a, b) => b.enddate.localeCompare(a.enddate))
        .slice(0, 5);

  if (isCS2 && cs2Loading && !cs2Tournaments.length) {
    return (
      <main>
        <div className="wrap" style={{ paddingTop: 80, textAlign: "center" }}>
          <p style={{ color: "var(--text-3)", fontSize: 18 }}>{t("home.loadingCS2")}</p>
        </div>
      </main>
    );
  }

  if (isLoL && lolLoading && !lolTournaments.length) {
    return (
      <main>
        <div className="wrap" style={{ paddingTop: 80, textAlign: "center" }}>
          <p style={{ color: "var(--text-3)", fontSize: 18 }}>{t("home.loadingLoL")}</p>
        </div>
      </main>
    );
  }

  if (isCS2 && cs2Error) {
    console.warn("Liquipedia API error (CS2), falling back to mock data:", cs2Error);
  }
  if (isLoL && lolError) {
    console.warn("Liquipedia API error (LoL), falling back to mock data:", lolError);
  }

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
              {displayTournaments.map(tr => <TournamentCard key={tr.id} tournament={tr} />)}
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

        <div className={styles.twoCol}>
          {recentInterviews.length > 0 && (
            <section className={styles.section}>
              <SectionHead title={t("home.newsInterviews")} to="/news" />
              <div className={styles.interviewGrid}>
                {recentInterviews.map(i => <InterviewCard key={i.pagename + i.date} item={i} />)}
              </div>
            </section>
          )}
          {recentTransfers.length > 0 && (
            <section className={styles.section}>
              <SectionHead title={t("home.recentTransfers")} to="/transfers" />
              <div className={styles.transferList}>
                {recentTransfers.map((tr, i) => <TransferRow key={i} transfer={tr} />)}
              </div>
            </section>
          )}
        </div>

        {guests.length > 0 && (
          <>
            <div className={styles.divider} />
            <section className={styles.section}>
              <SectionHead title={t("home.eventGuests")} />
              <div className={styles.guestList}>
                {guests.map(g => <GuestCard key={g.id} guest={g} />)}
              </div>
            </section>
          </>
        )}

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
