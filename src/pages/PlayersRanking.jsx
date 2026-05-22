import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { getPlayers, formatPrize, getFlag } from "../services/api";
import { getLoLPlayersForRanking } from "../services/liquipediaApi";
import styles from "./PlayersRanking.module.css";
import { useLanguage } from "../contexts/LanguageContext";

// ── Form score ────────────────────────────────────────────────────────────────
function calcFormScore(player) {
  const rs = player.recentstats;
  if (!rs?.stats) return 0;
  const get = (label) => {
    const raw = rs.stats.find(s => s.label === label)?.value || "0";
    return parseFloat(raw.replace("%", ""));
  };
  if (player.wiki === "valorant") {
    const acs  = get("ACS");
    const kd   = get("K/D");
    const kast = get("KAST") / 100;
    return Math.min((acs / 350) * 40 + Math.min(kd / 2, 1) * 30 + kast * 30, 100);
  }
  if (player.wiki === "counterstrike") {
    const rating = get("Rating");
    const kd     = get("K/D");
    const kast   = get("KAST") / 100;
    return Math.min(Math.min(rating / 1.6, 1) * 50 + kast * 30 + Math.min(kd / 2, 1) * 20, 100);
  }
  if (player.wiki === "leagueoflegends") {
    const kda  = get("KDA");
    const wr   = get("Win Rate") / 100;
    const csm  = get("CS/min");
    return Math.min(Math.min(kda / 6, 1) * 50 + wr * 30 + Math.min(csm / 10, 1) * 20, 100);
  }
  return 0;
}

const GAME_LABEL = {
  valorant: "VAL", counterstrike: "CS2", leagueoflegends: "LoL",
};
const GAME_COLOR = {
  valorant: styles.gameVal, counterstrike: styles.gameCs, leagueoflegends: styles.gameLol,
};

function fmtViews(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000)    return `${Math.round(n / 1000)}K`;
  return String(n);
}

function PlayerRow({ rank, player, metric }) {
  return (
    <Link to={`/player/${player.id}`} className={styles.row}>
      <span className={`${styles.rank} ${rank <= 3 ? styles[`rank${rank}`] : ""}`}>#{rank}</span>
      <div className={styles.avatar}>{player.id?.[0]?.toUpperCase() ?? '?'}</div>
      <div className={styles.info}>
        <span className={styles.nick}>{player.id}</span>
        <span className={styles.name}>{player.name}</span>
      </div>
      <span className={styles.team}>{player.teampagename}</span>
      <span className={`${styles.game} ${GAME_COLOR[player.wiki] || ""}`}>
        {GAME_LABEL[player.wiki] || player.wiki}
      </span>
      <div className={styles.metric}>{metric}</div>
      <span className={styles.arrow}>→</span>
    </Link>
  );
}

export default function PlayersRanking({ wiki }) {
  const { t } = useLanguage();
  const [tab, setTab] = useState("mv");
  const [lolPlayers, setLolPlayers] = useState([]);
  const [lolLoading, setLolLoading] = useState(false);

  useEffect(() => {
    if (wiki !== 'leagueoflegends') return;
    let cancelled = false;
    setLolLoading(true);
    getLoLPlayersForRanking(50)
      .then(players => { if (!cancelled) setLolPlayers(players); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLolLoading(false); });
    return () => { cancelled = true; };
  }, [wiki]);

  const mockPlayers = getPlayers(wiki);
  const allPlayers = wiki === 'leagueoflegends' ? lolPlayers : mockPlayers;

  const TABS = [
    { id: "mv",    labelKey: "players.marketValue" },
    { id: "form",  labelKey: "players.inForm" },
    { id: "views", labelKey: "players.mostViewed" },
  ];

  const isLoLApi = wiki === 'leagueoflegends' && lolPlayers.length > 0;

  const ranked = useMemo(() => {
    if (isLoLApi) {
      // API LoL players don't have marketvalue/recentstats/views — show all sorted by role
      const ROLE_ORDER = { Top: 0, Jungle: 1, Mid: 2, Bot: 3, Support: 4 };
      return [...allPlayers].sort((a, b) => {
        const ra = ROLE_ORDER[a.role] ?? 9;
        const rb = ROLE_ORDER[b.role] ?? 9;
        return ra !== rb ? ra - rb : a.id.localeCompare(b.id);
      });
    }
    if (tab === "mv") {
      return [...allPlayers]
        .filter(p => p.marketvalue)
        .sort((a, b) => (b.marketvalue || 0) - (a.marketvalue || 0));
    }
    if (tab === "form") {
      return [...allPlayers]
        .filter(p => p.recentstats)
        .map(p => ({ ...p, _form: calcFormScore(p) }))
        .sort((a, b) => b._form - a._form);
    }
    if (tab === "views") {
      return [...allPlayers]
        .filter(p => p.views)
        .sort((a, b) => (b.views || 0) - (a.views || 0));
    }
    return allPlayers;
  }, [allPlayers, tab, isLoLApi]);

  const maxForm = Math.max(...ranked.map(p => p._form || 0), 1);

  function renderMetric(player) {
    if (isLoLApi) {
      return <span className={styles.mvVal} style={{ color: "var(--text-3)", fontSize: 12 }}>{player.role || player.team || "—"}</span>;
    }
    if (tab === "mv") {
      return <span className={styles.mvVal}>{formatPrize(player.marketvalue)}</span>;
    }
    if (tab === "form") {
      const score = Math.round(player._form || 0);
      const pct   = (score / maxForm) * 100;
      return (
        <div className={styles.formWrap}>
          <div className={styles.formBar}>
            <div className={styles.formFill} style={{ width: `${pct}%` }} />
          </div>
          <span className={styles.formNum}>{score}<span className={styles.formMax}>/100</span></span>
        </div>
      );
    }
    if (tab === "views") {
      return <span className={styles.viewsVal}>{fmtViews(player.views)} <span className={styles.viewsLabel}>{t("players.views")}</span></span>;
    }
  }

  const tabDesc = tab === "mv"
    ? t("players.tabDescMv")
    : tab === "form"
    ? t("players.tabDescForm")
    : t("players.tabDescViews");

  return (
    <main>
      <div className={styles.hero}>
        <div className="wrap">
          <p className={styles.eyebrow}>eSPORMAX</p>
          <h1 className={styles.title}>{t("players.title")}</h1>
        </div>
      </div>

      <div className="wrap">
        <div className={styles.tabs}>
          {TABS.map(tabItem => (
            <button
              key={tabItem.id}
              className={`${styles.tab} ${tab === tabItem.id ? styles.tabActive : ""}`}
              onClick={() => setTab(tabItem.id)}
            >
              {t(tabItem.labelKey)}
            </button>
          ))}
        </div>

        <p className={styles.tabDesc}>{tabDesc}</p>

        {lolLoading && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-3)" }}>
            {t("common.loading")}
          </div>
        )}

        <div className={styles.list}>
          {!lolLoading && ranked.map((player, i) => (
            <PlayerRow
              key={player.id}
              rank={i + 1}
              player={player}
              metric={renderMetric(player)}
            />
          ))}
          {!lolLoading && ranked.length === 0 && (
            <p className={styles.empty}>{t("players.noData")}</p>
          )}
        </div>
      </div>
    </main>
  );
}
