import { Link, useNavigate } from "react-router-dom";
import {
  getTournaments, getMatches, getInterviews, getTransfers,
  getStandings, getPlayers, getPrizeResults, getGuests,
  formatDate, formatPrize, getFlag, tierLabel,
} from "../services/api";
import MatchCard from "../components/MatchCard";
import TournamentCard from "../components/TournamentCard";
import GroupStandings from "../components/GroupStandings";
import styles from "./Home.module.css";

function SectionHead({ title, to, label = "See All" }) {
  return (
    <div className={styles.sectionHead}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {to && <Link to={to} className={styles.seeAll}>{label} →</Link>}
    </div>
  );
}

function HeroBanner({ tournament, grandFinal }) {
  if (!tournament) return null;
  const [opp1, opp2] = grandFinal?.match2opponents || [];
  return (
    <div className={styles.hero}>
      <div className="wrap">
        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <span className={styles.heroPill}>
              {tierLabel(tournament.liquipediatier)}-Tier · {tournament.locations?.region}
            </span>
            <h1 className={styles.heroTitle}>{tournament.name}</h1>
            <div className={styles.heroMeta}>
              <span>📍 {tournament.locations?.venue}, {tournament.locations?.city}</span>
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
              <Link to={`/turnuva/${tournament.id}`} className={styles.heroBtnPrimary}>View Tournament →</Link>
              {grandFinal && (
                <Link to={`/mac/${grandFinal.id}`} className={styles.heroBtnSecondary}>Grand Final</Link>
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
      </div>
    </div>
  );
}

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

function PlayerCard({ player }) {
  const navigate = useNavigate();
  const years = Object.keys(player.earningsbyyear).sort();
  const latestYear = years[years.length - 1];
  return (
    <div className={styles.playerCard} onClick={() => navigate(`/oyuncu/${player.id}`)}>
      <div className={styles.playerAvatar}>{player.id[0].toUpperCase()}</div>
      <div className={styles.playerInfo}>
        <span className={styles.playerNick}>{player.id}</span>
        <span className={styles.playerName}>{player.name}</span>
        <div className={styles.playerMeta}>
          <span>{getFlag(player.nationality)} {player.nationality}</span>
          <span>·</span>
          <span>{player.teampagename}</span>
          <span>·</span>
          <span className={`${styles.playerStatus} ${player.status === "Active" ? styles.statusActive : ""}`}>
            {player.status}
          </span>
        </div>
      </div>
      <div className={styles.playerEarnings}>
        {player.marketvalue && (
          <span className={styles.playerMV}>{formatPrize(player.marketvalue)} <span className={styles.playerMVLabel}>value</span></span>
        )}
        <span className={styles.playerEarningsVal}>{formatPrize(player.earnings)}</span>
        <span className={styles.playerEarningsLabel}>Total Earnings</span>
        {latestYear && (
          <span className={styles.playerEarningsYear}>{latestYear}: {formatPrize(player.earningsbyyear[latestYear])}</span>
        )}
      </div>
      <span className={styles.playerArrow}>→</span>
    </div>
  );
}

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

export default function Home({ wiki }) {
  const tournaments = getTournaments(wiki);
  const matches = getMatches(wiki);
  const interviews = getInterviews(wiki);
  const allTransfers = getTransfers();
  const standings = getStandings(wiki);
  const players = getPlayers(wiki);
  const prizeResults = getPrizeResults(wiki);
  const guests = getGuests(wiki);

  const featuredTournament = tournaments[0] || null;
  const grandFinal = matches.find(m => m.match2bracketdata?.header === "Grand Final");
  const recentMatches = matches.filter(m => m.finished === 1).slice(0, 3);
  const recentInterviews = interviews.slice(0, 3);
  const recentTransfers = allTransfers.slice(0, 6);

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
      <HeroBanner tournament={featuredTournament} grandFinal={grandFinal} />

      <div className="wrap">
        {recentMatches.length > 0 && (
          <section className={styles.section}>
            <SectionHead title="Recent Matches" to={grandFinal ? `/mac/${grandFinal.id}` : null} label="Details" />
            <div className={styles.matchGrid}>
              {recentMatches.map(m => <MatchCard key={m.id} match={m} />)}
            </div>
          </section>
        )}

        <div className={styles.twoCol}>
          <section className={styles.section}>
            <SectionHead title="Tournaments" />
            <div className={styles.tournamentList}>
              {tournaments.map(t => <TournamentCard key={t.id} tournament={t} />)}
            </div>
          </section>
          <section className={styles.section}>
            <SectionHead title="Group Standings" />
            <GroupStandings groups={standings} />
          </section>
        </div>

        {prizeResults.length > 0 && (
          <section className={styles.section}>
            <SectionHead title="Prize Distribution" />
            <div className={styles.prizeTable}>
              {prizeResults.slice(0, 8).map((r, i) => <PrizeRow key={i} result={r} />)}
            </div>
          </section>
        )}

        {recentInterviews.length > 0 && (
          <section className={styles.section}>
            <SectionHead title="News & Interviews" to="/haberler" />
            <div className={styles.interviewGrid}>
              {recentInterviews.map(i => <InterviewCard key={i.pagename + i.date} item={i} />)}
            </div>
          </section>
        )}

        <div className={styles.twoCol}>
          <section className={styles.section}>
            <SectionHead title="Recent Transfers" to="/transferler" />
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

        {players.length > 0 && (
          <section className={styles.section}>
            <SectionHead title="Featured Players" />
            <div className={styles.playerList}>
              {players.map(p => <PlayerCard key={p.id} player={p} />)}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
