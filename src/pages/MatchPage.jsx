import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getMatch, getMockMatchStats, formatDate, tierLabel } from "../services/api";
import { getLoLMatchById, getCS2MatchById, getCS2PlayerImage, getCS2H2HMatches, getCS2MatchVods } from "../services/liquipediaApi";
import { useLanguage } from "../contexts/LanguageContext";
import styles from "./MatchPage.module.css";

function cleanHeader(h) {
  if (!h || h.startsWith("!")) return "";
  const label = h.includes(",") ? h.split(",")[0].trim() : h;
  return label.replace(/<[^>]+>/g, "").trim();
}

function TierBadge({ tier, tiertype }) {
  return (
    <span className={`${styles.tier} ${tier === "1" ? styles.tierS : tier === "2" ? styles.tierA : styles.tierB}`}>
      {tierLabel(tier)}{tiertype ? `-${tiertype.slice(0, 3).toUpperCase()}` : ""}
    </span>
  );
}

function PlayerAvatarImg({ name }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    getCS2PlayerImage(name).then(u => { if (u) setUrl(u); });
  }, [name]);
  if (url) return <img src={url} alt={name} className={styles.statPlayerAvatar} referrerPolicy="no-referrer" />;
  return <span className={styles.statPlayerAvatarFallback}>{name[0]?.toUpperCase()}</span>;
}

const GH = 'https://raw.githubusercontent.com/MurkyYT/cs2-map-icons/main/images/thumbs';
const CS2_MAP_IMG = {
  'Ancient':   `${GH}/de_ancient_1_png.png`,
  'Anubis':    `${GH}/de_anubis_1_png.png`,
  'Dust2':     `${GH}/de_dust2_1_png.png`,
  'Dust II':   `${GH}/de_dust2_1_png.png`,
  'Inferno':   `${GH}/de_inferno_1_png.png`,
  'Mirage':    `${GH}/de_mirage_1_png.png`,
  'Nuke':      `${GH}/de_nuke_1_png.png`,
  'Overpass':  `${GH}/de_overpass_1_png.png`,
  'Vertigo':   `${GH}/de_vertigo_1_png.png`,
  'Train':     `${GH}/de_train_1_png.png`,
  'Cache':     `${GH}/de_cache_1_png.png`,
};
const getMapImg = name => CS2_MAP_IMG[name] || null;

function ytId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function MatchVideos({ match }) {
  const [apiVods, setApiVods] = useState(null);

  useEffect(() => {
    if (!match?.id) return;
    getCS2MatchVods(match.id).then(setApiVods);
  }, [match?.id]);

  if (!match) return null;

  // Per-map VODs from match2games
  const mapVods = (match.match2games || [])
    .filter(g => g.vod)
    .map(g => ({ url: g.vod, map: g.map, score: `${g.scores?.[0] ?? ''} : ${g.scores?.[1] ?? ''}` }));

  // Full-match VODs from matchvod endpoint
  const fullVods = (apiVods || []).map(v => ({ url: v.url, label: `${v.language} VOD` }));

  const all = [...mapVods, ...fullVods];
  if (!all.length) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Maç Videosu</h2>
      <div className={styles.videoGrid}>
        {all.map((v, i) => {
          const id = ytId(v.url);
          const thumb = id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
          const mapImg = v.map ? getMapImg(v.map) : null;
          const fallbackImg = mapImg || null;
          const label = v.map ? v.map : (v.label || 'VOD');
          return (
            <a key={i} href={v.url} target="_blank" rel="noreferrer" className={styles.videoCard}>
              <div className={styles.videoThumbWrap}>
                {(thumb || fallbackImg) && (
                  <img
                    src={thumb || fallbackImg}
                    alt={label}
                    className={styles.videoThumb}
                    referrerPolicy="no-referrer"
                    onError={e => { if (fallbackImg && e.target.src !== fallbackImg) e.target.src = fallbackImg; }}
                  />
                )}
                <div className={styles.videoThumbOverlay} />
                <div className={styles.videoPlayBtn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                {v.map && mapImg && (
                  <div className={styles.videoMapBadge}>
                    <img src={mapImg} alt={v.map} className={styles.videoMapBadgeImg} referrerPolicy="no-referrer" />
                    <span>{v.map}</span>
                  </div>
                )}
              </div>
              <div className={styles.videoInfo}>
                <span className={styles.videoTitle}>{label}</span>
                {v.score && (
                  <div className={styles.videoMeta}>
                    <span className={styles.videoScore}>{v.score}</span>
                  </div>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

function H2HSection({ team1, team2, team1Icon, team2Icon }) {
  const [matches, setMatches] = useState(null);
  useEffect(() => {
    if (!team1 || !team2) return;
    setMatches(null);
    getCS2H2HMatches(team1, team2, 5).then(setMatches);
  }, [team1, team2]);

  if (!matches) return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Head-to-Head</h2>
      <div className={styles.h2hLoading}>Yükleniyor…</div>
    </section>
  );
  if (!matches.length) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Head-to-Head</h2>
      <div className={styles.h2hList}>
        {matches.map((m, i) => {
          const o1 = m.match2opponents?.[0];
          const o2 = m.match2opponents?.[1];
          const isTeam1Left = (o1?.name || '').toLowerCase() === team1.toLowerCase();
          const left  = isTeam1Left ? o1 : o2;
          const right = isTeam1Left ? o2 : o1;
          const leftWon  = left?.result  === "W" || left?.score  > right?.score;
          const rightWon = right?.result === "W" || right?.score > left?.score;
          const leftIcon  = isTeam1Left ? team1Icon : team2Icon;
          const rightIcon = isTeam1Left ? team2Icon : team1Icon;
          return (
            <div key={i} className={styles.h2hRow}>
              <Link to={`/team/${encodeURIComponent(left?.name || '')}`} className={`${styles.h2hTeam} ${leftWon ? styles.h2hWinner : styles.h2hLoser}`}>
                {leftIcon && <img src={leftIcon} alt={left?.name} className={styles.h2hLogo} referrerPolicy="no-referrer" />}
                <span>{left?.name}</span>
              </Link>
              <span className={styles.h2hScore}>
                <span className={leftWon  ? styles.h2hScoreWin : styles.h2hScoreLoss}>{left?.score  ?? "—"}</span>
                <span className={styles.h2hScoreSep}>:</span>
                <span className={rightWon ? styles.h2hScoreWin : styles.h2hScoreLoss}>{right?.score ?? "—"}</span>
              </span>
              <Link to={`/team/${encodeURIComponent(right?.name || '')}`} className={`${styles.h2hTeam} ${styles.h2hTeamRight} ${rightWon ? styles.h2hWinner : styles.h2hLoser}`}>
                {rightIcon && <img src={rightIcon} alt={right?.name} className={styles.h2hLogo} referrerPolicy="no-referrer" />}
                <span>{right?.name}</span>
              </Link>
              <div className={styles.h2hMeta}>
                <span className={styles.h2hTournament}>{m.tournament || "—"}</span>
                <span className={styles.h2hDate}>{formatDate(m.date)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function VetoBoard({ veto, opp1Name, opp2Name }) {
  const teamLabel = (t) => t === "1" ? opp1Name : t === "2" ? opp2Name : null;
  return (
    <div className={styles.vetoCard}>
      <h3 className={styles.vetoTitle}>Map Veto</h3>
      <div className={styles.vetoList}>
        {veto.map((v, i) => {
          const isBan = v.type === "ban";
          const isPick = v.type === "pick";
          const cls = isBan ? styles.vetoBan : isPick ? styles.vetoPick : styles.vetoDecider;
          const tagCls = isBan ? styles.vetoTagBan : isPick ? styles.vetoTagPick : styles.vetoTagDecider;
          const team = teamLabel(v.team);
          const imgUrl = getMapImg(v.map);
          return (
            <div key={i} className={`${styles.vetoItem} ${cls}`}>
              {imgUrl && (
                <div className={styles.vetoMapBg} style={{ backgroundImage: `url(${imgUrl})` }} />
              )}
              <div className={styles.vetoContent}>
                <span className={`${styles.vetoTag} ${tagCls}`}>{v.type}</span>
                {team && <span className={styles.vetoTeamLabel}>{team}</span>}
                <span className={styles.vetoMapName}>{v.map}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


function PlayerStatTable({ players }) {
  return (
    <table className={styles.csStatTable}>
      <thead>
        <tr>
          <th>Player</th>
          <th>K</th>
          <th>D</th>
          <th>A</th>
          <th>K/D</th>
          <th>ADR</th>
          <th>Rating</th>
          <th>HS%</th>
        </tr>
      </thead>
      <tbody>
        {players.map(p => (
          <tr key={p.name}>
            <td>
              <Link to={`/player/${encodeURIComponent(p.name)}`} className={styles.statPlayerCell}>
                <PlayerAvatarImg name={p.name} />
                {p.name}
              </Link>
            </td>
            <td>{p.kills}</td>
            <td>{p.deaths}</td>
            <td>{p.assists > 0 ? p.assists : "—"}</td>
            <td>{typeof p.kd === "number" ? p.kd.toFixed(2) : "—"}</td>
            <td>{p.adr > 0 ? p.adr.toFixed(1) : "—"}</td>
            <td>{p.rating > 0 ? p.rating.toFixed(2) : "—"}</td>
            <td>{p.hs > 0 ? `${p.hs.toFixed(1)}%` : "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function HalftimePanel({ extradata, opp1Name, opp2Name }) {
  if (!extradata) return null;
  const t1halfs = extradata.t1halfs || {};
  const t2halfs = extradata.t2halfs || {};
  const t1sides = extradata.t1sides || {};

  const halves = Object.keys(t1halfs).sort();
  if (!halves.length) return null;

  const sideLabel = s => s === "ct" ? "CT" : s === "t" ? "T" : s?.toUpperCase() || "—";
  const sideColor = s => s === "ct" ? "#4a9eff" : "#e8a020";

  return (
    <div className={styles.halftimePanel}>
      <div className={styles.halftimeTitle}>Half-time Breakdown</div>
      <div className={styles.halftimeGrid}>
        <div className={styles.halftimeHeader}>
          <span />
          <span className={styles.halftimeTeam}>{opp1Name}</span>
          <span className={styles.halftimeTeam}>{opp2Name}</span>
        </div>
        {halves.map(h => {
          const t1side = t1sides[h];
          const t2side = t1side === "ct" ? "t" : "ct";
          return (
            <div key={h} className={styles.halftimeRow}>
              <span className={styles.halftimeLabel}>Half {h}</span>
              <span className={styles.halftimeCell}>
                <span className={styles.halfSideBadge} style={{ background: sideColor(t1side) }}>
                  {sideLabel(t1side)}
                </span>
                <span className={styles.halftimeScore}>{t1halfs[h] ?? "—"}</span>
              </span>
              <span className={styles.halftimeCell}>
                <span className={styles.halfSideBadge} style={{ background: sideColor(t2side) }}>
                  {sideLabel(t2side)}
                </span>
                <span className={styles.halftimeScore}>{t2halfs[h] ?? "—"}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CsMapPanel({ game, opp1Name, opp2Name, opp1Icon, opp2Icon }) {
  const isWin1 = game.winner === "1";
  const isWin2 = game.winner === "2";

  const hasPlayerStats = game?.playerStats &&
    (game.playerStats.team1?.length > 0 || game.playerStats.team2?.length > 0);
  const hasHalftime = game?.extradata?.t1halfs &&
    Object.keys(game.extradata.t1halfs).length > 0;

  if (!hasPlayerStats && !hasHalftime) {
    return <div style={{ padding: 24, textAlign: "center", color: "var(--text-4)", fontSize: 13 }}>No match details available for this map.</div>;
  }

  return (
    <div className={styles.csPanel}>
      <div className={styles.csPanelHead}>
        <span className={styles.csPanelMap}>{game.map}</span>
        <span className={styles.csPanelScore}>{game.scores[0]} : {game.scores[1]}</span>
        <span className={styles.csPanelLen}>{game.length || ""}</span>
      </div>

      <HalftimePanel extradata={game.extradata} opp1Name={opp1Name} opp2Name={opp2Name} />

      {hasPlayerStats && (
        <>
          <div className={styles.csTeamBlock}>
            <div className={styles.csTeamHead}>
              {opp1Icon && <img src={opp1Icon} alt={opp1Name} className={styles.csTeamHeadLogo} referrerPolicy="no-referrer" />}
              <Link to={`/team/${encodeURIComponent(opp1Name)}`} className={styles.csTeamName}>{opp1Name}</Link>
              {isWin1 && <span className={styles.csTeamWin}>Winner</span>}
            </div>
            <PlayerStatTable players={game.playerStats.team1} />
          </div>

          <div className={styles.csTeamBlock}>
            <div className={styles.csTeamHead}>
              {opp2Icon && <img src={opp2Icon} alt={opp2Name} className={styles.csTeamHeadLogo} referrerPolicy="no-referrer" />}
              <Link to={`/team/${encodeURIComponent(opp2Name)}`} className={styles.csTeamName}>{opp2Name}</Link>
              {isWin2 && <span className={styles.csTeamWin}>Winner</span>}
            </div>
            <PlayerStatTable players={game.playerStats.team2} />
          </div>
        </>
      )}
    </div>
  );
}

const CHAMPION_ALIASES = {
  'Wukong': 'MonkeyKing',
  'Nunu & Willump': 'Nunu',
  'Nunu': 'Nunu',
  'Renata Glasc': 'Renata',
};

let _ddVersion = '15.10.1';
fetch('https://ddragon.leagueoflegends.com/api/versions.json')
  .then(r => r.json())
  .then(v => { if (v?.[0]) _ddVersion = v[0]; })
  .catch(() => {});

function getDDragonUrl(name) {
  const aliased = CHAMPION_ALIASES[name] || name;
  const sanitized = aliased.replace(/['\s.]/g, '');
  return `https://ddragon.leagueoflegends.com/cdn/${_ddVersion}/img/champion/${sanitized}.png`;
}

function ChampionIcon({ name, size = 24, banned = false }) {
  const [failed, setFailed] = useState(false);
  if (!name) return <span style={{ color: "var(--text-4)" }}>—</span>;
  const src = getDDragonUrl(name);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      {!failed && (
        <img src={src} alt={name} width={size} height={size}
          style={{ borderRadius: 3, flexShrink: 0, opacity: banned ? 0.4 : 1, filter: banned ? "grayscale(1)" : "none" }}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)} />
      )}
      <span style={{ textDecoration: banned ? "line-through" : "none", color: banned ? "var(--text-4)" : "inherit" }}>{name}</span>
    </span>
  );
}

function LolStatTable({ players }) {
  return (
    <table className={styles.lolStatTable}>
      <thead>
        <tr>
          <th>Player</th>
          <th>Champion</th>
          <th>K</th>
          <th>D</th>
          <th>A</th>
          <th>KDA</th>
          <th>CS</th>
          <th>Gold</th>
          <th>Damage</th>
          <th>Vision</th>
        </tr>
      </thead>
      <tbody>
        {players.map((p, i) => {
          const hasData = p.kills > 0 || p.deaths > 0 || p.assists > 0;
          const kda = !hasData ? "—"
            : ((p.kills + p.assists) / Math.max(1, p.deaths)).toFixed(2);
          return (
            <tr key={p.name || i}>
              <td>{p.name || "—"}</td>
              <td>{p.champion || "—"}</td>
              <td>{hasData ? p.kills : "—"}</td>
              <td>{hasData ? p.deaths : "—"}</td>
              <td>{hasData ? p.assists : "—"}</td>
              <td>{kda}</td>
              <td>{p.cs > 0 ? p.cs : "—"}</td>
              <td>{p.gold > 0 ? `${(p.gold / 1000).toFixed(1)}k` : "—"}</td>
              <td>{p.damage > 0 ? `${(p.damage / 1000).toFixed(1)}k` : "—"}</td>
              <td>{p.visionScore > 0 ? p.visionScore : "—"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function LolMatchDetails({ match, opp1Name, opp2Name }) {
  const { t } = useLanguage();
  const games = match.match2games || [];
  const [activeIdx, setActiveIdx] = useState(0);
  if (!games.length) return null;
  const activeGame = games[activeIdx];
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("match.statistics")}</h2>

      {/* Game-by-game winner summary */}
      <div className={styles.lolGameSummary}>
        {games.map((g, i) => {
          const winner = g.winner === "1" ? opp1Name : g.winner === "2" ? opp2Name : null;
          return (
            <div
              key={i}
              className={`${styles.lolGameRow} ${i === activeIdx ? styles.lolGameRowActive : ""}`}
              onClick={() => setActiveIdx(i)}
            >
              <span className={styles.lolGameNum}>Game {i + 1}</span>
              <span className={styles.lolGameWinner}>{winner ?? "—"}</span>
              {g.length && <span className={styles.lolGameLen}>{g.length}</span>}
            </div>
          );
        })}
      </div>

      {games.length > 1 && (
        <div className={styles.csTabs}>
          {games.map((g, i) => (
            <button
              key={i}
              className={`${styles.csTabBtn} ${i === activeIdx ? styles.csTabActive : ""}`}
              onClick={() => setActiveIdx(i)}
            >
              Game {i + 1} · {g.length}
            </button>
          ))}
        </div>
      )}
      {activeGame?.playerStats && (activeGame.playerStats.team1.length > 0 || activeGame.playerStats.team2.length > 0) ? (() => {
        const ps = activeGame.playerStats;
        const swapped = ps.team1.length === 0;
        const t1 = swapped ? ps.team2 : ps.team1;
        const t2 = swapped ? ps.team1 : ps.team2;
        const h1 = swapped ? opp2Name : opp1Name;
        const h2 = swapped ? opp1Name : opp2Name;
        const w1 = swapped ? "2" : "1";
        const w2 = swapped ? "1" : "2";
        return (
          <div className={styles.csPanel} style={{ marginTop: 16 }}>
            <div className={styles.csTeamBlock}>
              <div className={styles.csTeamHead}>
                <span className={styles.csTeamName}>{h1}</span>
                {activeGame.winner === w1 && <span className={styles.csTeamWin}>Winner</span>}
              </div>
              {t1.length > 0 ? <LolStatTable players={t1} /> : <div style={{ padding: 12, fontSize: 12, color: "var(--text-4)" }}>—</div>}
            </div>
            <div className={styles.csTeamBlock}>
              <div className={styles.csTeamHead}>
                <span className={styles.csTeamName}>{h2}</span>
                {activeGame.winner === w2 && <span className={styles.csTeamWin}>Winner</span>}
              </div>
              {t2.length > 0 ? <LolStatTable players={t2} /> : <div style={{ padding: 12, fontSize: 12, color: "var(--text-4)" }}>—</div>}
            </div>
          </div>
        );
      })() : (
        <div style={{ padding: 24, textAlign: "center", color: "var(--text-4)", fontSize: 13 }}>
          {t("match.noPlayerStats")}
        </div>
      )}

      {(activeGame?.picks || activeGame?.bans) && (
        <div style={{ marginTop: 16, display: "flex", gap: 24, flexWrap: "wrap" }}>
          {activeGame.picks && (
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", letterSpacing: 1, marginBottom: 6 }}>{t("match.picks")}</div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 2 }}>{opp1Name}</span>
                  {activeGame.picks.team1.map((c, i) => <span key={i} style={{ padding: "2px 0" }}><ChampionIcon name={c} size={20} /></span>)}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                  <span style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 2 }}>{opp2Name}</span>
                  {activeGame.picks.team2.map((c, i) => <span key={i} style={{ padding: "2px 0" }}><ChampionIcon name={c} size={20} /></span>)}
                </div>
              </div>
            </div>
          )}
          {activeGame.bans && (
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", letterSpacing: 1, marginBottom: 6 }}>{t("match.bans")}</div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 2 }}>{opp1Name}</span>
                  {activeGame.bans.team1.map((c, i) => <span key={i} style={{ padding: "2px 0" }}><ChampionIcon name={c} size={20} banned /></span>)}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                  <span style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 2 }}>{opp2Name}</span>
                  {activeGame.bans.team2.map((c, i) => <span key={i} style={{ padding: "2px 0" }}><ChampionIcon name={c} size={20} banned /></span>)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeGame?.objectives && (activeGame.objectives.team1 || activeGame.objectives.team2) && (() => {
        const o1 = activeGame.objectives.team1 || {};
        const o2 = activeGame.objectives.team2 || {};
        const side1 = activeGame.objectives.team1side;
        const rows = [
          { icon: "🐉", label: t("obj.dragon"),  v1: o1.dragons,  v2: o2.dragons  },
          { icon: "💀", label: t("obj.baron"),   v1: o1.barons,   v2: o2.barons   },
          { icon: "🏰", label: t("obj.tower"),   v1: o1.towers,   v2: o2.towers   },
          { icon: "🪲", label: t("obj.grub"),    v1: o1.grubs,    v2: o2.grubs    },
          { icon: "🦅", label: t("obj.herald"),  v1: o1.heralds,  v2: o2.heralds  },
          { icon: "🔥", label: t("obj.atakhan"), v1: o1.atakhan,  v2: o2.atakhan  },
          { icon: "🐲", label: t("obj.elder"),   v1: o1.elder,    v2: o2.elder    },
        ].filter(r => r.v1 != null || r.v2 != null);
        if (!rows.length) return null;
        return (
          <div style={{ marginTop: 16, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", letterSpacing: 1 }}>{t("match.objectives")}</span>
              {side1 && <span style={{ fontSize: 11, background: side1 === "blue" ? "#1a3a6a" : "#6a1a1a", borderRadius: 4, padding: "1px 6px", color: "#fff" }}>{opp1Name} {side1}</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {rows.map(({ icon, label, v1, v2 }) => {
                const total = (v1 ?? 0) + (v2 ?? 0);
                const pct1 = total > 0 ? ((v1 ?? 0) / total) * 100 : 50;
                return (
                  <div key={label} style={{ display: "grid", gridTemplateColumns: "32px 1fr auto 1fr 32px", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, textAlign: "right" }}>{v1 ?? 0}</span>
                    <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct1}%`, background: "var(--text-1)", borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 11, color: "var(--text-3)", textAlign: "center", whiteSpace: "nowrap" }}>{icon} {label}</span>
                    <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${100 - pct1}%`, background: "var(--text-1)", borderRadius: 3, marginLeft: "auto" }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{v2 ?? 0}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </section>
  );
}

function CsMatchDetails({ match, opp1Name, opp2Name, opp1Icon, opp2Icon }) {
  const games = (match.match2games || []).filter(g =>
    g.winner || (g.scores?.[0] ?? 0) > 0 || (g.scores?.[1] ?? 0) > 0
  );
  const [activeIdx, setActiveIdx] = useState(0);
  if (games.length === 0 && !match.veto) return null;
  const activeGame = games[Math.min(activeIdx, games.length - 1)];
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Match Details</h2>
      {match.veto && <VetoBoard veto={match.veto} opp1Name={opp1Name} opp2Name={opp2Name} />}
      {games.length > 0 && (
        <>
          <div className={styles.csTabs}>
            {games.map((g, i) => (
              <button
                key={i}
                className={`${styles.csTabBtn} ${i === activeIdx ? styles.csTabActive : ""}`}
                onClick={() => setActiveIdx(i)}
              >
                <span>Map {i + 1} · {g.map}</span>
                <span className={styles.csTabScore}>{g.scores[0]}–{g.scores[1]}</span>
              </button>
            ))}
          </div>
          <CsMapPanel game={activeGame} opp1Name={opp1Name} opp2Name={opp2Name} opp1Icon={opp1Icon} opp2Icon={opp2Icon} />
        </>
      )}
    </section>
  );
}

export default function MatchPage({ wiki }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [apiMatch, setApiMatch]   = useState(null);
  const [loading,  setLoading]    = useState(false);
  const [multiVods, setMultiVods] = useState([]);
  const mockMatch = getMatch(id);

  useEffect(() => {
    if (mockMatch || !id) return;
    if (id.startsWith('ps_')) return; // PandaScore maçları şimdilik detay yok
    let cancelled = false;
    setLoading(true);
    const isLoL = wiki === 'leagueoflegends';
    const isCS2 = wiki === 'counterstrike';
    const fetcher = isLoL ? getLoLMatchById : isCS2 ? getCS2MatchById : null;
    if (!fetcher) { setLoading(false); return; }
    fetcher(id)
      .then(m => {
        if (!cancelled) {
          setApiMatch(m);
          setLoading(false);
        }
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, wiki, mockMatch]);

  // useMemo must come before early returns (Rules of Hooks)
  const match = useMemo(() => {
    if (mockMatch) return mockMatch;
    if (!apiMatch) return null;
    const mockData = getMockMatchStats(id);
    if (!mockData) return apiMatch;
    return {
      ...apiMatch,
      ...(mockData.veto ? { veto: mockData.veto } : {}),
      match2games: apiMatch.match2games.map((g, i) => ({
        ...g,
        playerStats: mockData.games?.[i]?.playerStats ?? g.playerStats,
      })),
    };
  }, [mockMatch, apiMatch, id]);

  if (loading) {
    return (
      <div className="wrap" style={{ paddingTop: 80, textAlign: "center", color: "var(--text-2)" }}>
        {t("common.loading")}
      </div>
    );
  }

  if (!match) {
    return (
      <div className="wrap" style={{ paddingTop: 80, textAlign: "center" }}>
        <h2 style={{ color: "var(--text-3)" }}>Match not found: {id}</h2>
        <Link to="/" style={{ display: "inline-block", marginTop: 16, color: "var(--text-1)", fontWeight: 700 }}>← Home</Link>
      </div>
    );
  }

  const [opp1, opp2] = match.match2opponents;
  const isFinished = match.finished === 1;
  const isLive = match.finished === 0;
  const isUpcoming = !isFinished && !isLive;
  const winnerIdx = match.winner != null ? parseInt(match.winner, 10) - 1 : -1;
  const streams = typeof match.stream === 'object' && match.stream !== null ? Object.entries(match.stream) : [];

  return (
    <main>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.heroBreadcrumb}>
            <Link to="/" className={styles.breadLink}>{t("nav.home")}</Link>
            <span className={styles.breadSep}>›</span>
            <Link to={`/tournament/${match.tournament.replace(/ /g, "_")}`} className={styles.breadLink}>
              {match.tournament}
            </Link>
            <span className={styles.breadSep}>›</span>
            <span>{cleanHeader(match.match2bracketdata?.header) || "Match"}</span>
          </div>

          <div className={styles.heroTop}>
            <TierBadge tier={match.liquipediatier} tiertype={match.liquipediatiertype} />
            {match.match2bracketdata?.type && (
              <span className={styles.bracketType}>
                {match.match2bracketdata.type === "bracket" ? "Elimination" : "Group Stage"}
              </span>
            )}
            {match.match2bracketdata?.header && (
              <span className={styles.bracketHeader}>{cleanHeader(match.match2bracketdata.header)}</span>
            )}
            <span className={styles.bestofBadge}>BO{match.bestof}</span>
            {isLive && <span className={styles.liveBadge}>● LIVE</span>}
            {isFinished && <span className={styles.finishedBadge}>Finished</span>}
            {isUpcoming && <span className={styles.upcomingBadge}>Upcoming</span>}
          </div>

          <div className={styles.heroMatchup}>
            <div
              className={`${styles.heroTeam} ${winnerIdx === 0 ? styles.heroWinner : winnerIdx !== -1 ? styles.heroLoser : ""}`}
              onClick={() => navigate(`/team/${encodeURIComponent(opp1?.name)}`)}
            >
              {opp1?.iconurl
                ? <img src={opp1.iconurl} alt={opp1.name} className={styles.heroTeamAvatar}
                    style={{ objectFit: "contain", background: "transparent" }}
                    referrerPolicy="no-referrer"
                    onError={e => { e.target.style.display = "none"; e.target.nextSibling?.style && (e.target.nextSibling.style.display = "flex"); }}
                  />
                : null}
              <div className={styles.heroTeamAvatar} style={{ display: opp1?.iconurl ? "none" : "flex" }}>{opp1?.name?.[0] || "?"}</div>
              <span className={styles.heroTeamName}>{opp1?.name}</span>
            </div>

            <div className={styles.heroScoreBlock}>
              <div className={styles.heroScores}>
                <span className={`${styles.heroScore} ${winnerIdx === 0 ? styles.heroScoreWin : ""}`}>
                  {isUpcoming ? "—" : (opp1?.score ?? "—")}
                </span>
                <span className={styles.heroColon}>:</span>
                <span className={`${styles.heroScore} ${winnerIdx === 1 ? styles.heroScoreWin : ""}`}>
                  {isUpcoming ? "—" : (opp2?.score ?? "—")}
                </span>
              </div>
              <span className={styles.heroDate}>{formatDate(match.date)}</span>
              <span className={styles.heroTournament}>{match.tournament}</span>
            </div>

            <div
              className={`${styles.heroTeam} ${styles.heroTeamRight} ${winnerIdx === 1 ? styles.heroWinner : winnerIdx !== -1 ? styles.heroLoser : ""}`}
              onClick={() => navigate(`/team/${encodeURIComponent(opp2?.name)}`)}
            >
              {opp2?.iconurl
                ? <img src={opp2.iconurl} alt={opp2.name} className={styles.heroTeamAvatar}
                    style={{ objectFit: "contain", background: "transparent" }}
                    referrerPolicy="no-referrer"
                    onError={e => { e.target.style.display = "none"; e.target.nextSibling?.style && (e.target.nextSibling.style.display = "flex"); }}
                  />
                : null}
              <div className={styles.heroTeamAvatar} style={{ display: opp2?.iconurl ? "none" : "flex" }}>{opp2?.name?.[0] || "?"}</div>
              <span className={styles.heroTeamName}>{opp2?.name}</span>
            </div>
          </div>

          {(streams.length > 0 || multiVods.length > 0) && (
            <div className={styles.heroStreams}>
              {streams.map(([key, url]) => {
                const lang = key.match(/_([a-z]{2})_/)?.[1]?.toUpperCase() || "EN";
                return (
                  <a key={key} href={url} target="_blank" rel="noreferrer" className={styles.streamBtn}>
                    ▶ Watch {lang} Stream
                  </a>
                );
              })}
              {multiVods.map((v, i) => {
                const langFlag = v.language === 'KO' ? '🇰🇷' : v.language === 'EN' ? '🇬🇧' : v.language === 'CN' ? '🇨🇳' : '🌐';
                return (
                  <a key={i} href={v.url} target="_blank" rel="noreferrer" className={styles.streamBtn}>
                    {langFlag} VOD
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="wrap">
        {match.wiki === "counterstrike" && (
          <>
            <CsMatchDetails match={match} opp1Name={opp1?.name} opp2Name={opp2?.name} opp1Icon={opp1?.iconurl} opp2Icon={opp2?.iconurl} />
            <MatchVideos match={match} />
            <H2HSection team1={opp1?.name} team2={opp2?.name} team1Icon={opp1?.iconurl} team2Icon={opp2?.iconurl} />
          </>
        )}

        {match.wiki === "leagueoflegends" && (
          <LolMatchDetails match={match} opp1Name={opp1?.name} opp2Name={opp2?.name} />
        )}

        {match.wiki !== "leagueoflegends" && match.wiki !== "counterstrike" && match.match2games?.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Map Results</h2>
            <div className={styles.mapSummary}>
              <div className={styles.mapSummaryHead}>
                <span className={styles.mapSummaryTeam}>{opp1?.name}</span>
                <span className={styles.mapSummaryLabel}>Map Summary</span>
                <span className={styles.mapSummaryTeam}>{opp2?.name}</span>
              </div>
              {match.match2games.map((g, i) => (
                <div key={i} className={styles.mapSummaryRow}>
                  <span className={`${styles.summaryScore} ${g.winner === "1" ? styles.summaryWin : styles.summaryLoss}`}>
                    {g.scores[0]}
                  </span>
                  <div className={styles.summaryMapInfo}>
                    <span className={styles.summaryMapName}>{g.map}</span>
                    {g.length && <span className={styles.summaryLen}>{g.length}</span>}
                    {g.vod && <a href={g.vod} target="_blank" rel="noreferrer" className={styles.summaryVod}>VOD ↗</a>}
                  </div>
                  <span className={`${styles.summaryScore} ${g.winner === "2" ? styles.summaryWin : styles.summaryLoss}`}>
                    {g.scores[1]}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
