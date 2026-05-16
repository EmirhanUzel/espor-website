import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getTeam, getPlayer, getMatches, formatDate, formatPrize, getFlag, INTERVIEWS, TRANSFERS } from "../services/api";
import { useLanguage } from "../contexts/LanguageContext";
import {
  getCS2TeamByName, getCS2TeamSquad, getCS2TeamTransfersAPI, getCS2TeamRecentMatches, getCS2TeamUpcomingMatches, getCS2PlayerImage, getCS2TeamLogos,
  getCS2TeamsForRanking, getCS2PlayerProfile, getCS2PlayerAllPlacements, getCS2PlayerCareer, getCS2TeamMapMatches,
  // getCS2PlayerAllPlacements kullanılıyor: squad player valuation için
  getLoLTeamByName, getLoLTeamSquad, getLoLTeamTransfersAPI, getLoLTeamRecentMatches, getLoLTeamUpcomingMatches, getLoLPlayerImage, getLoLTeamLogos,
} from "../services/liquipediaApi";
import styles from "./TeamPage.module.css";
import { calcPlayerValue } from "../services/playerValuation";
import { getFaceitPlayerStats } from "../services/faceitApi";

function TeamLogoChip({ name, logos, linkable }) {
  const [failed, setFailed] = useState(false);
  const url = logos?.[name];
  const inner = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      {url && !failed
        ? <img src={url} alt={name} referrerPolicy="no-referrer" onError={() => setFailed(true)}
            style={{ width: 16, height: 16, objectFit: "contain", flexShrink: 0 }} />
        : <span style={{ width: 16, height: 16, background: "var(--border)", borderRadius: 3,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 9, fontWeight: 700, color: "var(--text-3)", flexShrink: 0 }}>
            {name?.[0] ?? "?"}
          </span>
      }
      <span>{name}</span>
    </span>
  );
  if (!linkable) return inner;
  return (
    <Link to={`/team/${encodeURIComponent(name)}`} className={styles.transferFrom} onClick={e => e.stopPropagation()}>
      {inner}
    </Link>
  );
}

const GH = 'https://raw.githubusercontent.com/MurkyYT/cs2-map-icons/main/images/thumbs';
const MAP_BANNERS = {
  'Ancient':   `${GH}/de_ancient_1_png.png`,
  'Anubis':    `${GH}/de_anubis_1_png.png`,
  'Dust II':   `${GH}/de_dust2_1_png.png`,
  'Inferno':   `${GH}/de_inferno_1_png.png`,
  'Mirage':    `${GH}/de_mirage_1_png.png`,
  'Nuke':      `${GH}/de_nuke_1_png.png`,
  'Overpass':  `${GH}/de_overpass_1_png.png`,
  'Vertigo':   `${GH}/de_vertigo_1_png.png`,
  'Train':     `${GH}/de_train_1_png.png`,
  'Cache':     `${GH}/de_cache_1_png.png`,
};

const SOCIAL_ICONS = {
  twitter:   <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.733-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  x:         <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.733-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  instagram: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>,
  facebook:  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
  twitch:    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>,
  youtube:   <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58a2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12z"/></svg>,
  discord:   <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>,
};

function SocialIcon({ platform }) {
  const key = platform.toLowerCase();
  return SOCIAL_ICONS[key] || (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10a15.3 15.3 0 0 1-4 10a15.3 15.3 0 0 1-4-10a15.3 15.3 0 0 1 4-10z"/></svg>
  );
}

function EarningsBar({ data }) {
  const entries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
  const max = Math.max(...entries.map(([, v]) => v));
  return (
    <div className={styles.earningsBar}>
      {entries.map(([year, val]) => (
        <div key={year} className={styles.earningsCol}>
          <div className={styles.earningsBarOuter}>
            <div className={styles.earningsBarInner} style={{ height: `${max > 0 ? (val / max) * 100 : 0}%` }} />
          </div>
          <span className={styles.earningsYear}>{year.slice(2)}</span>
          <span className={styles.earningsVal}>
            {val >= 1000000 ? `$${(val / 1000000).toFixed(1)}M` : val >= 1000 ? `$${Math.round(val / 1000)}K` : `$${val}`}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function TeamPage({ wiki }) {
  const { name } = useParams();
  const navigate  = useNavigate();
  const { t }    = useLanguage();

  const decodedName = decodeURIComponent(name);
  const mockTeam    = getTeam(decodedName);
  // wiki prop wins over mock team wiki — avoids cross-game name collisions.
  const isCS2 = wiki === "counterstrike" || (!wiki && mockTeam?.wiki === "counterstrike");
  const isLoL = wiki === "leagueoflegends" || (!wiki && mockTeam?.wiki === "leagueoflegends");
  const isApiWiki = isCS2 || isLoL;

  // ── API state (shared between CS2 and LoL) ─────────────────────────────────
  const [apiTeam,        setApiTeam]        = useState(null);
  const [apiSquad,       setApiSquad]       = useState(null);
  const [apiMatches,     setApiMatches]     = useState(null);
  const [apiUpcoming,    setApiUpcoming]    = useState(null);
  const [apiTransfers,   setApiTransfers]   = useState(null);
  const [squadImages,    setSquadImages]    = useState({});
  const [squadValuation, setSquadValuation] = useState({});
  const [mapMatches,     setMapMatches]     = useState(null);
  const [transferLogos,  setTransferLogos]  = useState({});
  const [matchLogos,     setMatchLogos]     = useState({});
  const [apiLoading,     setApiLoading]     = useState(isApiWiki);
  const [rankInfo,       setRankInfo]       = useState(null);
  const [showAllMatches, setShowAllMatches] = useState(false);
  const [matchPage,      setMatchPage]      = useState(0);
  const MATCHES_PER_PAGE = 10;

  useEffect(() => {
    if (!isApiWiki) return;
    let cancelled = false;
    setApiLoading(true);
    setApiTeam(null); setApiSquad(null); setApiMatches(null); setApiUpcoming(null); setApiTransfers(null);
    setSquadImages({}); setSquadValuation({}); setMapMatches(null); setTransferLogos({}); setMatchLogos({}); setRankInfo(null);

    const getTeamFn       = isCS2 ? getCS2TeamByName            : getLoLTeamByName;
    const getSquadFn      = isCS2 ? getCS2TeamSquad             : getLoLTeamSquad;
    const getMatchesFn    = isCS2 ? getCS2TeamRecentMatches     : getLoLTeamRecentMatches;
    const getUpcomingFn   = isCS2 ? getCS2TeamUpcomingMatches   : getLoLTeamUpcomingMatches;
    const getTransfersFn  = isCS2 ? getCS2TeamTransfersAPI      : getLoLTeamTransfersAPI;
    const getPlayerImgFn  = isCS2 ? getCS2PlayerImage           : getLoLPlayerImage;
    const getLogosFn      = isCS2 ? getCS2TeamLogos             : getLoLTeamLogos;

    getTeamFn(decodedName).then(team => {
      if (cancelled || !team) { setApiLoading(false); return; }
      setApiTeam(team);
      setApiLoading(false);

      if (isCS2) {
        getCS2TeamsForRanking().then(allTeams => {
          if (cancelled) return;
          const vrsRanked = [...allTeams].sort((a, b) => (b.rankpoints || 0) - (a.rankpoints || 0));
          const esmRanked = [...allTeams].sort((a, b) => (b.esm || 0) - (a.esm || 0));
          const nameLower = team.name.toLowerCase();
          const vrsIdx    = vrsRanked.findIndex(t => t.name.toLowerCase() === nameLower);
          const esmIdx    = esmRanked.findIndex(t => t.name.toLowerCase() === nameLower);
          setRankInfo({
            vrsRank:   vrsIdx >= 0 ? vrsIdx + 1 : null,
            vrsPoints: vrsIdx >= 0 ? (vrsRanked[vrsIdx].rankpoints || null) : null,
            esmRank:   esmIdx >= 0 ? esmIdx + 1 : null,
            esmScore:  esmIdx >= 0 ? (esmRanked[esmIdx].esm || null) : null,
          });
        }).catch(() => {});
      }

      getSquadFn(team.pagename).then(squad => {
        if (cancelled) return;
        setApiSquad(squad);
        squad.forEach(p => {
          getPlayerImgFn(p.pagename || p.id).then(url => {
            if (!cancelled && url) setSquadImages(prev => ({ ...prev, [p.id]: url }));
          });

          if (isCS2) {
            // Her oyuncu için player sayfasıyla aynı veriyi çek → aynı hesaplama
            Promise.all([
              getCS2PlayerProfile(p.id).catch(() => null),
              getFaceitPlayerStats(p.id).catch(() => null),
              getCS2PlayerCareer(p.pagename || p.id).catch(() => []),
            ]).then(async ([profile, faceitStats, career]) => {
              if (cancelled) return;
              const allTeams = [...new Set([team.name, ...(career || []).map(c => c.team)].filter(Boolean))];
              const placements = await getCS2PlayerAllPlacements(allTeams).catch(() => []);
              if (cancelled) return;
              const playerData = profile || { earnings: p.earnings || 0, status: 'active', roles: p.role ? [p.role] : [] };
              const faceitId  = profile?.faceitId || null;
              const faceitResult = faceitStats || await getFaceitPlayerStats(p.id, faceitId).catch(() => null);
              const { usd, value } = calcPlayerValue({ player: playerData, faceitStats: faceitResult, placements });
              setSquadValuation(prev => ({ ...prev, [p.id]: { usd, value, faceitStats: faceitResult } }));
              // Player sayfasıyla aynı değeri cache'e de yaz
              if (usd) {
                try { localStorage.setItem(`esm_val_${p.id}`, JSON.stringify({ usd, value, ts: Date.now() })); } catch {}
              }
            });
          }
        });
      });

      getMatchesFn(team.name, 30).then(matches => {
        if (cancelled) return;
        setApiMatches(matches);
        const oppNames = [...new Set(
          matches.flatMap(m => m.match2opponents.map(o => o.name)).filter(n => n && n !== team.name)
        )];
        if (oppNames.length) {
          getLogosFn(oppNames).then(logoMap => {
            if (!cancelled) setMatchLogos(logoMap);
          });
        }
      });

      getUpcomingFn(team.name, 5).then(upcoming => {
        if (cancelled) return;
        setApiUpcoming(upcoming);
        const upOppNames = [...new Set(
          upcoming.flatMap(m => m.match2opponents.map(o => o.name)).filter(n => n && n !== team.name)
        )];
        if (upOppNames.length) {
          getLogosFn(upOppNames).then(logoMap => {
            if (!cancelled) setMatchLogos(prev => ({ ...prev, ...logoMap }));
          });
        }
      });

      getTransfersFn(team.name, 15).then(transfers => {
        if (!cancelled) setApiTransfers(transfers);
        if (isCS2 && transfers?.length) {
          const teamNames = [...new Set(
            transfers.flatMap(t => [t.fromteam, t.toteam].filter(Boolean))
          )];
          getLogosFn(teamNames).then(logos => { if (!cancelled) setTransferLogos(logos); });
        }
      });
      if (isCS2) {
        getCS2TeamMapMatches(team.name, 30).then(m => { if (!cancelled) setMapMatches(m); }).catch(() => {});
      }

    }).catch(() => { if (!cancelled) setApiLoading(false); });

    return () => { cancelled = true; };
  }, [decodedName, isCS2, isLoL, isApiWiki]);

  // ── Unified data ────────────────────────────────────────────────────────────
  const team = isApiWiki ? apiTeam : mockTeam;

  if (apiLoading) {
    return (
      <div className="wrap" style={{ paddingTop: 80, textAlign: "center", color: "var(--text-2)" }}>
        Loading…
      </div>
    );
  }

  if (!team) {
    return (
      <div className="wrap" style={{ paddingTop: 80, textAlign: "center" }}>
        <h2 style={{ color: "var(--text-3)" }}>Team not found: {decodedName}</h2>
        <Link to="/" style={{ display: "inline-block", marginTop: 16, color: "var(--text-1)", fontWeight: 700 }}>← Home</Link>
      </div>
    );
  }

  // ── Mock-data derived values (non-API wikis) ───────────────────────────────
  const allMatches = isApiWiki ? [] : getMatches(wiki);
  const teamMatches = isApiWiki
    ? (apiMatches || [])
    : allMatches.filter(m => m.match2opponents?.some(o => o.name.toLowerCase() === team.name.toLowerCase()));
  const teamUpcoming = isApiWiki ? (apiUpcoming || []) : [];

  const earningsYears = Object.entries(team.earningsbyyear || {}).sort(([a], [b]) => a.localeCompare(b));
  const lastYear = earningsYears[earningsYears.length - 1];

  // Squad: API for CS2/LoL, mock for others
  const squad = isApiWiki
    ? (apiSquad || []).map(p => ({ id: p.id, pagename: p.pagename, name: p.name, nationality: p.nationality, role: p.role || p.roles?.[0] || '', earnings: p.earnings }))
    : (mockTeam?.squad || []).map(m => {
        const p = getPlayer(m.id);
        return { id: m.id, name: p?.name || '', nationality: p?.nationality || '', role: m.role, earnings: p?.earnings || 0 };
      });

  const totalMarketValue = isApiWiki ? 0 : (mockTeam?.squad || []).reduce((sum, member) => {
    const p = getPlayer(member.id);
    return sum + (p?.marketvalue || 0);
  }, 0);

  const squadBonservis = isCS2 && squad.length > 0
    ? squad.reduce((sum, p) => sum + (squadValuation[p.id]?.usd || 0), 0)
    : 0;

  const formatMV = (val) => {
    if (!val) return null;
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${Math.round(val / 1_000)}K`;
    return `$${val}`;
  };

  // Transfers
  const rawTransfers = isApiWiki ? (apiTransfers || []) : TRANSFERS.filter(tr =>
    tr.fromteam?.toLowerCase() === team.name.toLowerCase() ||
    tr.toteam?.toLowerCase()   === team.name.toLowerCase()
  );

  // News (mock only)
  const squadIds = new Set(squad.map(m => (m.id || '').toLowerCase()));
  const teamNews = isApiWiki ? [] : INTERVIEWS.filter(item =>
    item.pagename.toLowerCase() === team.name.toLowerCase() ||
    squadIds.has(item.pagename.toLowerCase())
  );


  const ALLOWED_SOCIALS = new Set(["instagram", "x", "twitter", "youtube", "twitch"]);
  const socialEntries = Object.entries(team.links || {}).filter(([k]) => ALLOWED_SOCIALS.has(k.toLowerCase()));

  return (
    <main>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.heroInner}>
            <div className={styles.logoBox}>
              {team.textlesslogourl
                ? <img src={team.textlesslogourl} alt={team.name} className={styles.teamLogo} />
                : <span className={styles.logoFallback}>{team.name[0]}</span>
              }
            </div>

            <div className={styles.heroInfo}>
              <div className={styles.heroMeta}>
                <span className={styles.heroBadge}>{team.region}</span>
                <span className={`${styles.heroBadge} ${team.status === "active" ? styles.badgeActive : styles.badgeInactive}`}>
                  {team.status === "active" ? "Active" : "Disbanded"}
                </span>
              </div>
              <h1 className={styles.teamName}>{team.name}</h1>
              <div className={styles.heroTags}>
                <span className={styles.tag}>Founded <strong>{formatDate(team.createdate)}</strong></span>
                {team.disbanddate && !team.disbanddate.startsWith("0000") && (
                  <span className={styles.tag}>Disbanded <strong>{formatDate(team.disbanddate)}</strong></span>
                )}
                <span className={styles.tag}>Region <strong>{team.region}</strong></span>
                {isCS2 && rankInfo?.vrsRank && (
                  <span className={styles.tag}>VRS <strong>#{rankInfo.vrsRank}</strong></span>
                )}
                {isCS2 && rankInfo?.esmRank && (
                  <span className={styles.tag}>ESM <strong>#{rankInfo.esmRank}</strong></span>
                )}
              </div>
              {socialEntries.length > 0 && (
                <div className={styles.heroSocial}>
                  {socialEntries.map(([k, url]) => (
                    <a key={k} href={url} target="_blank" rel="noreferrer" className={styles.heroSocialLink} title={k.charAt(0).toUpperCase() + k.slice(1)}>
                      <SocialIcon platform={k} />
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.heroBadges}>
              <div className={styles.earningsBadge}>
                <span className={styles.earningsTotal}>{formatPrize(team.earnings)}</span>
                <span className={styles.earningsLabel}>Total Earnings</span>
                {lastYear && <span className={styles.earningsLast}>{lastYear[0]}: {formatPrize(lastYear[1])}</span>}
              </div>
              {squadBonservis > 0 && (
                <div className={styles.earningsBadge}>
                  <span className={styles.earningsTotal}>{formatMV(squadBonservis)}</span>
                  <span className={styles.earningsLabel}>ESM Bonservis</span>
                  <span className={styles.earningsLast}>{squad.length} oyuncu</span>
                </div>
              )}
              {totalMarketValue > 0 && (
                <div className={styles.earningsBadge}>
                  <span className={styles.earningsTotal}>{formatMV(totalMarketValue)}</span>
                  <span className={styles.earningsLabel}>Squad Value</span>
                  <span className={styles.earningsLast}>{(team.squad || []).length} players</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className={styles.grid}>

          {squad.length > 0 && (
            <section className={`${styles.card} ${styles.cardWide}`}>
              <h2 className={styles.cardTitle}>Current Roster</h2>
              <div className={styles.rosterGrid}>
                {squad.map((member) => {
                  const mockPlayer = !isApiWiki ? getPlayer(member.id) : null;
                  const mv = mockPlayer?.marketvalue;
                  const mvFmt = mv
                    ? mv >= 1_000_000 ? `$${(mv / 1_000_000).toFixed(1)}M`
                    : mv >= 1_000 ? `$${Math.round(mv / 1_000)}K`
                    : `$${mv}`
                    : null;
                  const allStats = mockPlayer?.recentstats?.stats || [];
                  const valData  = isCS2 ? (squadValuation[member.id] || null) : null;
                  const fs       = valData?.faceitStats || null;
                  const cardStats = isCS2 && fs
                    ? (() => {
                        const role   = member.role || '';
                        const isAWP  = role === 'AWPer';
                        const isUtil = role === 'IGL' || role === 'Support';
                        const roleStat = isAWP
                          ? { label: "Sniper/R", value: fs.sniperKillRate  != null ? fs.sniperKillRate.toFixed(2)              : "—" }
                          : isUtil
                          ? { label: "Utility%", value: fs.utilitySuccess  != null ? `${Math.round(fs.utilitySuccess * 100)}%`  : "—" }
                          : { label: "Entry%",   value: fs.entrySuccessRate != null ? `${Math.round(fs.entrySuccessRate * 100)}%` : "—" };
                        return [
                          { label: "K/D", value: fs.kd != null ? fs.kd.toFixed(2)      : "—" },
                          { label: "HS%", value: fs.hs != null ? `${fs.hs.toFixed(0)}%` : "—" },
                          roleStat,
                        ];
                      })()
                    : mockPlayer?.wiki === "counterstrike"
                    ? allStats.filter(s => ["K/D", "KAST", "HS %"].includes(s.label))
                    : mockPlayer?.wiki === "leagueoflegends"
                    ? allStats.filter(s => ["KDA", "Win Rate", "CS/min"].includes(s.label))
                    : allStats.filter(s => ["ACS", "K/D", "KAST"].includes(s.label));
                  const cachedVal = valData;
                  const flag    = member.nationality ? getFlag(member.nationality) : (mockPlayer ? getFlag(mockPlayer.nationality) : "🌍");
                  const initial = (member.id || "?")[0].toUpperCase();
                  const imgUrl  = isApiWiki ? (squadImages[member.id] || '') : (mockPlayer?.imageurl || '');
                  return (
                    <div key={member.id} className={styles.playerCard} onClick={() => navigate(`/player/${member.id}`)}>
                      <div className={styles.playerCardTop}>
                        <span className={styles.playerCardFlag}>{flag}</span>
                        {imgUrl
                          ? <img src={imgUrl} alt={member.id} className={styles.playerCardImg} referrerPolicy="no-referrer"
                              onError={e => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }} />
                          : null}
                        <div className={styles.playerCardInitial} style={imgUrl ? { display: "none" } : {}}>{initial}</div>
                      </div>
                      <div className={styles.playerCardBody}>
                        <span className={styles.playerCardNick}>{member.id}</span>
                        {member.name && <span className={styles.playerCardName}>{member.name}</span>}
                      </div>
                      {cardStats.length > 0 && (
                        <div className={styles.playerCardStats}>
                          {cardStats.map(s => (
                            <div key={s.label} className={styles.playerCardStat}>
                              <span className={styles.playerCardStatVal}>{s.value}</span>
                              <span className={styles.playerCardStatLabel}>{s.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className={styles.playerCardFooter}>
                        <span className={styles.playerCardRole}>{member.role}</span>
                        {cachedVal?.value
                          ? <span className={styles.playerCardMV}>{cachedVal.value}</span>
                          : (!isCS2 && mvFmt) ? <span className={styles.playerCardMV}>{mvFmt}</span>
                          : null
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {(teamUpcoming.length > 0 || teamMatches.length > 0) && (() => {
            const renderMatchRow = (match, onClickFn) => {
              const [opp1, opp2] = match.match2opponents;
              const isOpp1    = opp1?.name.toLowerCase() === team.name.toLowerCase();
              const myScore    = isOpp1 ? opp1?.score : opp2?.score;
              const theirScore = isOpp1 ? opp2?.score : opp1?.score;
              const opponent   = isOpp1 ? opp2?.name  : opp1?.name;
              const won        = (isOpp1 && match.winner === "1") || (!isOpp1 && match.winner === "2");
              const logoUrl    = matchLogos[opponent] || null;
              return (
                <div key={match.id} className={styles.matchRow} onClick={() => onClickFn(match.id)}>
                  <span className={won ? styles.matchW : styles.matchL}>{won ? "W" : "L"}</span>
                  <Link to={`/team/${encodeURIComponent(opponent)}`} className={styles.matchOppWrap} onClick={e => e.stopPropagation()}>
                    {logoUrl
                      ? <img src={logoUrl} alt={opponent} className={styles.matchOppLogo} referrerPolicy="no-referrer" />
                      : <div className={styles.matchOppLogoFb}>{opponent?.[0] ?? '?'}</div>
                    }
                    <span className={styles.matchOpp}>{opponent}</span>
                  </Link>
                  <span className={styles.matchScore}>{myScore} – {theirScore}</span>
                  <div className={styles.matchRight}>
                    {match.tournament && <span className={styles.matchTournament}>{match.tournament}</span>}
                    <span className={styles.matchDate}>{formatDate(match.date)}</span>
                  </div>
                </div>
              );
            };
            return (
              <section className={`${styles.card} ${styles.cardWide}`}>
                <div className={styles.matchCardHeader}>
                  <h2 className={styles.matchCardTitle}>Matches</h2>
                  {teamMatches.length > 5 && (
                    <button className={styles.seeMoreBtn} onClick={() => { setMatchPage(0); setShowAllMatches(true); }}>
                      See all {teamMatches.length} →
                    </button>
                  )}
                </div>

                <div className={styles.matchList}>
                  {teamUpcoming.slice(0, 1).map(match => {
                    const opp = match.match2opponents.find(o => o.name.toLowerCase() !== team.name.toLowerCase());
                    const logoUrl = matchLogos[opp?.name] || null;
                    return (
                      <div key={match.id} className={styles.upcomingRow}>
                        <span className={styles.upcomingBadge}>NEXT</span>
                        <Link to={`/team/${encodeURIComponent(opp?.name ?? '')}`} className={styles.matchOppWrap} onClick={e => e.stopPropagation()}>
                          {logoUrl
                            ? <img src={logoUrl} alt={opp?.name} className={styles.matchOppLogo} referrerPolicy="no-referrer" />
                            : <div className={styles.matchOppLogoFb}>{opp?.name?.[0] ?? '?'}</div>
                          }
                          <span className={styles.matchOpp}>{opp?.name}</span>
                        </Link>
                        <div className={styles.matchRight}>
                          {match.tournament && <span className={styles.matchTournament}>{match.tournament}</span>}
                          <span className={styles.matchDate}>{formatDate(match.date)}</span>
                        </div>
                      </div>
                    );
                  })}
                  {(teamUpcoming.length > 0 && teamMatches.length > 0) && (
                    <div className={styles.matchDivider} />
                  )}
                  {teamMatches.slice(0, 5).map(m => renderMatchRow(m, id => navigate(`/match/${id}`)))}
                </div>

                {showAllMatches && (() => {
                  const totalPages = Math.ceil(teamMatches.length / MATCHES_PER_PAGE);
                  const pageMatches = teamMatches.slice(matchPage * MATCHES_PER_PAGE, (matchPage + 1) * MATCHES_PER_PAGE);
                  return (
                    <div className={styles.modalOverlay} onClick={() => setShowAllMatches(false)}>
                      <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                          <span className={styles.modalTitle}>Matches — {team.name}</span>
                          <button className={styles.modalClose} onClick={() => setShowAllMatches(false)}>✕</button>
                        </div>
                        <div className={styles.modalBody}>
                          {pageMatches.map(m => renderMatchRow(m, id => { setShowAllMatches(false); navigate(`/match/${id}`); }))}
                        </div>
                        {totalPages > 1 && (
                          <div className={styles.modalPager}>
                            <button
                              className={styles.pagerBtn}
                              disabled={matchPage === 0}
                              onClick={() => setMatchPage(p => p - 1)}
                            >← Prev</button>
                            <span className={styles.pagerInfo}>
                              {matchPage + 1} / {totalPages}
                            </span>
                            <button
                              className={styles.pagerBtn}
                              disabled={matchPage === totalPages - 1}
                              onClick={() => setMatchPage(p => p + 1)}
                            >Next →</button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </section>
            );
          })()}

          {isCS2 && mapMatches?.length > 0 && (() => {
            const mapStats = {};
            mapMatches.forEach(match => {
              const opps = match.match2opponents || [];
              const tIdx = opps.findIndex(o => o.name.toLowerCase() === team.name.toLowerCase());
              if (tIdx === -1) return;
              (match.match2games || []).forEach(g => {
                const map = g.map;
                if (!map || map === 'TBD' || map === '') return;
                if (!mapStats[map]) mapStats[map] = { w: 0, l: 0, ctW: 0, ctTotal: 0, tW: 0, tTotal: 0 };
                const won = g.winner === String(tIdx + 1);
                if (won) mapStats[map].w++; else mapStats[map].l++;
                // CT/T side
                const ex     = g.extradata || {};
                const halfs  = ex[`t${tIdx + 1}halfs`] || {};
                const sides  = ex[`t${tIdx + 1}sides`] || {};
                Object.entries(sides).forEach(([half, side]) => {
                  const rounds = parseInt(halfs[half]) || 0;
                  const maxRounds = 12;
                  if (side === 'ct') { mapStats[map].ctW += rounds; mapStats[map].ctTotal += maxRounds; }
                  else               { mapStats[map].tW  += rounds; mapStats[map].tTotal  += maxRounds; }
                });
              });
            });

            const rows = Object.entries(mapStats)
              .filter(([, s]) => s.w + s.l >= 2)
              .sort(([, a], [, b]) => (b.w + b.l) - (a.w + a.l));

            if (!rows.length) return null;
            return (
              <section className={`${styles.card} ${styles.cardWide}`}>
                <h2 className={styles.cardTitle}>Map Win Rates <span style={{ fontWeight: 400, fontSize: 11, color: 'var(--text-4)', textTransform: 'none', letterSpacing: 0 }}>· Son {mapMatches.length} Maç</span></h2>
                <div className={styles.mapGrid}>
                  {rows.map(([map, s]) => {
                    const total = s.w + s.l;
                    const wr    = Math.round(s.w / total * 100);
                    const color = wr >= 60 ? '#4ade80' : wr >= 45 ? '#fbbf24' : '#f87171';
                    const ctWr  = s.ctTotal > 0 ? Math.round(s.ctW / s.ctTotal * 100) : null;
                    const tWr   = s.tTotal  > 0 ? Math.round(s.tW  / s.tTotal  * 100) : null;
                    return (
                      <div key={map} className={styles.mapRow}>
                        {MAP_BANNERS[map] && (
                          <div className={styles.mapBanner} style={{ backgroundImage: `url(${MAP_BANNERS[map]})` }} />
                        )}
                        <div className={styles.mapContent}>
                          <div className={styles.mapRowTop}>
                            <span className={styles.mapName}>{map}</span>
                            <span className={styles.mapRecord}>{s.w}W – {s.l}L</span>
                          </div>
                          <div className={styles.mapBarOuter}>
                            <div className={styles.mapBarInner} style={{ width: `${wr}%`, background: color }} />
                          </div>
                          <div className={styles.mapRowTop}>
                            <span className={styles.mapWr} style={{ color }}>{wr}%</span>
                            <div className={styles.mapSides}>
                              {ctWr != null && <span className={styles.mapSideCT}>CT {ctWr}%</span>}
                              {tWr  != null && <span className={styles.mapSideT}>T {tWr}%</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })()}

          {earningsYears.length > 0 && (
            <section className={`${styles.card} ${styles.cardWide}`}>
              <h2 className={styles.cardTitle}>Annual Earnings</h2>
              <EarningsBar data={team.earningsbyyear} />
              <div className={styles.earningsTable}>
                {earningsYears.map(([year, val]) => (
                  <div key={year} className={styles.earningsRow}>
                    <span className={styles.earningsRowYear}>{year}</span>
                    <div className={styles.earningsRowBar}>
                      <div className={styles.earningsRowFill}
                        style={{ width: `${(val / Math.max(...earningsYears.map(([, v]) => v))) * 100}%` }} />
                    </div>
                    <span className={styles.earningsRowAmt}>{formatPrize(val)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── News ── */}
          {teamNews.length > 0 && (
            <section className={`${styles.card} ${styles.cardWide}`}>
              <h2 className={styles.cardTitle}>News & Interviews</h2>
              <div className={styles.newsList}>
                {teamNews.map((item, i) => (
                  <a key={i} href={item.link} target="_blank" rel="noreferrer" className={styles.newsItem}>
                    <div className={styles.newsItemTop}>
                      <span className={`${styles.newsBadge} ${item.type === "Interview" ? styles.newsBadgeInterview : styles.newsBadgeArticle}`}>
                        {item.type}
                      </span>
                      <span className={styles.newsPublisher}>{item.publisher}</span>
                      <span className={styles.newsDate}>{formatDate(item.date)}</span>
                    </div>
                    <p className={styles.newsTitle}>"{item.title}"</p>
                    <span className={styles.newsSubject}>{item.pagename}</span>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* ── Rumors (only for non-API wikis) ── */}
          {!isApiWiki && (
            <section className={`${styles.card} ${styles.cardWide}`}>
              <h2 className={styles.cardTitle}>{t("team.rumors")}</h2>
              <div className={styles.rumorList}>
                {[
                  { id: 1, text: `${team.name} is reportedly in talks with a top-tier IGL.`, source: "insider_anon", date: "2025-10-15", reliability: "low" },
                  { id: 2, text: `Roster shuffle expected at ${team.name} after disappointing playoff run.`, source: "esports_wire", date: "2025-10-10", reliability: "medium" },
                ].map(r => (
                  <div key={r.id} className={styles.rumorRow}>
                    <span className={`${styles.rumorBadge} ${r.reliability === "medium" ? styles.rumorMedium : styles.rumorLow}`}>
                      {r.reliability === "medium" ? t("team.rumorMedium") : t("team.rumorLow")}
                    </span>
                    <span className={styles.rumorText}>{r.text}</span>
                    <div className={styles.rumorMeta}>
                      <span className={styles.rumorSource}>@{r.source}</span>
                      <span className={styles.rumorDate}>{formatDate(r.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Transfers ── */}
          {rawTransfers.length > 0 && (
            <section className={`${styles.card} ${styles.cardWide}`}>
              <h2 className={styles.cardTitle}>Transfers</h2>
              <div className={styles.transferList}>
                {rawTransfers.slice(0, 5).map((tr, i) => {
                  const playerName = tr.player || tr.displayname || tr.extradata?.displayname || '';
                  const fromTeam   = tr.fromteam || '';
                  const toTeam     = tr.toteam   || '';
                  const role1      = (tr.role1 || '').toLowerCase();
                  const role2      = (tr.role2 || '').toLowerCase();
                  const teamLow    = team.name.toLowerCase();

                  // Aynı takımda statü değişikliği (bench, inactive, loan)
                  const isSameTeam = fromTeam.toLowerCase() === toTeam.toLowerCase();
                  const isInactive = role1 === 'inactive' || role2 === 'inactive';
                  const isLoan     = role1 === 'loan'     || role2 === 'loan';
                  const isBenched  = isSameTeam && (isInactive || !toTeam);

                  const dirLabel = isBenched
                    ? (isLoan ? "LOAN" : "BENCH")
                    : toTeam.toLowerCase() === teamLow ? "IN" : "OUT";
                  const dirCls = isBenched
                    ? styles.transferBench
                    : toTeam.toLowerCase() === teamLow ? styles.transferIn : styles.transferOut;

                  return (
                    <div key={i} className={styles.transferRow}>
                      <span className={`${styles.transferDir} ${dirCls}`}>{dirLabel}</span>
                      <Link to={`/player/${encodeURIComponent(playerName)}`} className={styles.transferPlayer} onClick={e => e.stopPropagation()}>
                        {playerName}
                      </Link>
                      <div className={styles.transferTeams}>
                        {isBenched ? (
                          <>
                            <TeamLogoChip name={fromTeam} logos={transferLogos} linkable />
                            <span className={styles.transferArrow}>→</span>
                            <span className={styles.transferBenchLabel}>{isLoan ? "Loan" : "Benched"}</span>
                          </>
                        ) : (
                          <>
                            {fromTeam && <TeamLogoChip name={fromTeam} logos={transferLogos} linkable />}
                            {fromTeam && toTeam && <span className={styles.transferArrow}>→</span>}
                            {toTeam   && <TeamLogoChip name={toTeam}   logos={transferLogos} linkable />}
                          </>
                        )}
                      </div>
                      <span className={styles.transferDate}>{formatDate(tr.date)}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

        </div>
      </div>
    </main>
  );
}
