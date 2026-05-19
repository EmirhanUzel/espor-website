import { useNavigate } from "react-router-dom";
import styles from "./TournamentBracket.module.css";

function parseHeader(raw) {
  if (!raw) return null;
  const h = raw.toLowerCase().trim();
  if (h.startsWith('!gf')  || h === 'grand final' || h === 'final') return 'Grand Final';
  if (h.startsWith('!tp')  || h.includes('3rd place') || h.includes('third')) return '3rd Place';
  if (h.startsWith('!uf')  || h === 'upper final')         return 'Upper Final';
  if (h.startsWith('!lf')  || h === 'lower final')         return 'Lower Final';
  if (h.startsWith('!usf') || h === 'upper semi-final')    return 'Upper Semi-Final';
  if (h.startsWith('!lsf') || h === 'lower semi-final')    return 'Lower Semi-Final';
  if (h.startsWith('!sf')  || h === 'semi-final')          return 'Semi-Final';
  if (h.startsWith('!uqf') || h === 'upper quarter-final') return 'Upper QF';
  if (h.startsWith('!lqf') || h === 'lower quarter-final') return 'Lower QF';
  if (h.startsWith('!qf')  || h === 'quarter-final')       return 'Quarter-Final';
  if (h.startsWith('!ro16') || h.startsWith('!r16') || h === 'round of 16') return 'Round of 16';
  if (h.startsWith('!ro32') || h.startsWith('!r32')) return 'Round of 32';
  if (h.startsWith('!pi')  || h === 'play-in') return 'Play-In';
  const rm = h.match(/^!r(\d+)/);
  if (rm) return `Round ${rm[1]}`;
  if (raw.startsWith('!')) return null;
  return raw;
}

function TeamRow({ opp, isWinner, isLoser, logos }) {
  const logo = logos?.[opp?.name] || '';
  return (
    <div className={`${styles.team} ${isWinner ? styles.winner : isLoser ? styles.loser : ''}`}>
      <div className={styles.teamLeft}>
        <div className={styles.teamLogo}>
          {logo
            ? <img src={logo} alt="" referrerPolicy="no-referrer" onError={e => { e.target.style.display = 'none'; }} />
            : <span>{(opp?.name || '?')[0]}</span>}
        </div>
        <span className={styles.teamName}>{opp?.name || 'TBD'}</span>
      </div>
      <span className={`${styles.score} ${isWinner ? styles.scoreWin : ''}`}>
        {opp?.score ?? ''}
      </span>
    </div>
  );
}

function MatchCard({ match, logos }) {
  const navigate = useNavigate();
  const [t1, t2] = match.match2opponents || [];
  const done = match.finished === 1;
  const w1 = done && match.winner === "1";
  const w2 = done && match.winner === "2";

  return (
    <div className={styles.card} onClick={() => navigate(`/match/${match.id}`)}>
      <TeamRow opp={t1} isWinner={w1} isLoser={done && !w1} logos={logos} />
      <TeamRow opp={t2} isWinner={w2} isLoser={done && !w2} logos={logos} />
    </div>
  );
}

function GroupStage({ matches, logos }) {
  if (!matches?.length) return null;

  // Aynı gün = aynı round
  const dateMap = new Map();
  for (const m of matches) {
    const day = (m.date || '').slice(0, 10) || 'unknown';
    if (!dateMap.has(day)) dateMap.set(day, []);
    dateMap.get(day).push(m);
  }

  const rounds = [...dateMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, ms], i) => ({ label: `Round ${i + 1}`, matches: ms }));

  return (
    <div className={styles.groupStage}>
      <div className={styles.stageTitle}>Group Stage</div>
      <div className={styles.groupRounds}>
        {rounds.map((r, ri) => (
          <div key={ri} className={styles.groupRound}>
            <div className={styles.groupRoundHeader}>{r.label}</div>
            <div className={styles.groupRoundMatches}>
              {r.matches.map(m => (
                <div key={m.id} className={styles.matchWrap}>
                  <MatchCard match={m} logos={logos} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TournamentBracket({ matches, groupMatches, logos = {} }) {
  if (!matches?.length && !groupMatches?.length) return null;

  // 3. lük maçını ayır
  const thirdPlace = matches.filter(m => parseHeader(m.match2bracketdata?.header || '') === '3rd Place');
  const main       = matches.filter(m => parseHeader(m.match2bracketdata?.header || '') !== '3rd Place');

  // Aynı gün = aynı tur
  const dateMap = new Map();
  for (const m of main) {
    const day = (m.date || '').slice(0, 10) || 'unknown';
    if (!dateMap.has(day)) dateMap.set(day, []);
    dateMap.get(day).push(m);
  }

  let rounds = [...dateMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, ms]) => ({ label: '', matches: ms }));

  const COUNT_NAMES = { 1: 'Grand Final', 2: 'Semi-Final', 4: 'Quarter-Final', 8: 'Round of 16', 16: 'Round of 32' };
  const singles = rounds.filter(r => r.matches.length === 1);
  rounds.forEach(r => {
    if (r.matches.length > 1) {
      r.label = COUNT_NAMES[r.matches.length] || `${r.matches.length} Maç`;
    } else {
      r.label = singles[singles.length - 1] === r ? 'Grand Final' : 'Semi-Final';
    }
  });

  // Ardışık aynı isimli turları birleştir
  const merged = [];
  for (const r of rounds) {
    const last = merged[merged.length - 1];
    if (last && last.label === r.label) last.matches.push(...r.matches);
    else merged.push({ ...r, matches: [...r.matches] });
  }

  if (!merged.length && !groupMatches?.length) return null;

  return (
    <div>
      {merged.length > 0 && <div className={styles.stageTitle}>Bracket</div>}
      <div className={styles.wrap}>
        <div className={styles.bracket}>
          {merged.map((round, ri) => {
            const isFirst = ri === 0;
            const isLast  = ri === merged.length - 1;
            const pairs = [];
            for (let i = 0; i < round.matches.length; i += 2) {
              pairs.push(round.matches.slice(i, i + 2));
            }
            return (
              <div key={ri} className={`${styles.round} ${isLast ? styles.roundFinal : ''}`}>
                <div className={styles.roundHeader}>{round.label}</div>
                <div className={styles.roundBody}>
                  {pairs.map((pair, pi) => (
                    <div key={pi} className={`${styles.pair} ${!isLast && pair.length === 2 ? styles.pairConn : ''}`}>
                      {pair.map((match, mi) => (
                        <div
                          key={match.id}
                          className={[
                            styles.matchWrap,
                            !isFirst ? styles.connLeft : '',
                            !isLast  ? styles.connRight : '',
                            mi === 0  ? styles.matchTop : styles.matchBottom,
                          ].filter(Boolean).join(' ')}
                        >
                          <MatchCard match={match} logos={logos} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {thirdPlace.length > 0 && (
        <div className={styles.thirdPlace}>
          <span className={styles.thirdPlaceLabel}>3rd Place</span>
          <div>
            {thirdPlace.map(m => <MatchCard key={m.id} match={m} logos={logos} />)}
          </div>
        </div>
      )}

      <GroupStage matches={groupMatches} logos={logos} />
    </div>
  );
}
