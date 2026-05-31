import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTransfers, getTeam, getPlayer, formatDate } from "../services/api";
import {
  getCS2Transfers, getLoLTransfers,
  getCS2PlayerImage, getLoLPlayerImage,
  getCS2TeamLogos, getLoLTeamLogos,
} from "../services/liquipediaApi";
import styles from "./TransfersPage.module.css";
import { useLanguage } from "../contexts/LanguageContext";

const ROLE_LABEL = {
  duelist: "Duelist", controller: "Controller", initiator: "Initiator",
  sentinel: "Sentinel", igl: "IGL", rifler: "Rifler", awper: "AWPer",
  support: "Support", top: "Top", jungle: "Jungle", mid: "Mid",
  bot: "Bot/ADC", adc: "ADC",
  "1": "Carry", "2": "Mid", "3": "Offlane",
  "4": "Support", "5": "Hard Support",
};

const PAGE_SIZE = 15;

const STAFF_ROLES = new Set([
  "coach", "head coach", "assistant coach",
  "analyst", "performance analyst",
  "manager", "general manager", "team manager",
  "ceo", "owner", "staff", "content creator",
  "observer", "streamer", "director",
]);

const AVATAR_COLORS = ["#6c5ce7","#0984e3","#00b894","#e17055","#fd79a8","#fdcb6e","#a29bfe","#55efc4"];
function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function PlayerAvatar({ name, wiki }) {
  const [src, setSrc] = useState(getPlayer(name)?.imageurl || "");

  useEffect(() => {
    const mock = getPlayer(name)?.imageurl || "";
    setSrc(mock);
    if (mock) return;

    let cancelled = false;
    const fetchImg = wiki === "counterstrike" ? getCS2PlayerImage
                   : wiki === "leagueoflegends" ? getLoLPlayerImage
                   : null;
    if (fetchImg) {
      fetchImg(name).then(url => { if (!cancelled && url) setSrc(url); }).catch(() => {});
    }
    return () => { cancelled = true; };
  }, [name, wiki]);

  if (!src) {
    return (
      <span className={styles.avatarLetter} style={{ background: avatarColor(name) }}>
        {(name || "?")[0].toUpperCase()}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      className={styles.avatar}
      referrerPolicy="no-referrer"
      onError={() => setSrc("")}
    />
  );
}

function TeamLogo({ name, logoMap }) {
  const team = getTeam(name);
  const logo = logoMap?.[name] || team?.textlesslogourl || team?.logourl;
  const [err, setErr] = useState(false);

  if (!logo || err) {
    return (
      <span className={styles.teamLogoFallback}>
        {(name || "?")[0].toUpperCase()}
      </span>
    );
  }
  return <img src={logo} alt={name} className={styles.teamLogoImg} referrerPolicy="no-referrer" onError={() => setErr(true)} />;
}

function TeamBlock({ name, isTo, logoMap }) {
  const hasTeam = name && name !== "-" && name !== "—";
  if (!hasTeam) {
    return isTo
      ? <span className={styles.freeAgent}>Free Agent</span>
      : null;
  }
  return (
    <Link to={`/team/${encodeURIComponent(name)}`} className={isTo ? styles.teamTo : styles.teamFrom}>
      <TeamLogo name={name} logoMap={logoMap} />
      <span className={isTo ? styles.teamToName : styles.teamFromName}>{name}</span>
    </Link>
  );
}

function TransferRow({ transfer, wiki, logoMap }) {
  const role = transfer.role1
    ? (ROLE_LABEL[transfer.role1.toLowerCase()] || transfer.role1)
    : null;

  return (
    <div className={styles.row}>
      <div className={styles.playerCell}>
        <Link to={`/player/${encodeURIComponent(transfer.player)}`} className={styles.avatarLink} tabIndex={-1}>
          <PlayerAvatar name={transfer.player} wiki={wiki} />
        </Link>
        <div className={styles.playerMeta}>
          <Link to={`/player/${encodeURIComponent(transfer.player)}`} className={styles.playerName}>
            {transfer.player}
          </Link>
          {role && <span className={styles.roleBadge}>{role}</span>}
        </div>
      </div>

      <div className={styles.flowCell}>
        <TeamBlock name={transfer.fromteam} isTo={false} logoMap={logoMap} />
        <span className={styles.arrow}>→</span>
        <TeamBlock name={transfer.toteam} isTo={true} logoMap={logoMap} />
      </div>

      <span className={styles.date}>{formatDate(transfer.date)}</span>
    </div>
  );
}

export default function TransfersPage({ wiki = "valorant" }) {
  const { t } = useLanguage();
  const [apiTransfers, setApiTransfers] = useState([]);
  const [teamLogos, setTeamLogos] = useState({});
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setVisible(PAGE_SIZE);
    setLoading(true);
    setTeamLogos({});

    if (wiki === "counterstrike") {
      getCS2Transfers(150).catch(() => []).then(cs2 => {
        const players = cs2.filter(tr => {
          const r = (tr.role1 || "").toLowerCase();
          return !STAFF_ROLES.has(r);
        });
        setApiTransfers(players.map(tr => ({ ...tr, wiki: "counterstrike" })));
        setLoading(false);
      });
    } else if (wiki === "leagueoflegends") {
      getLoLTransfers(80).catch(() => []).then(lol => {
        const players = lol.filter(tr => !STAFF_ROLES.has((tr.role1 || "").toLowerCase()));
        setApiTransfers(players.map(tr => ({ ...tr, wiki: "leagueoflegends" })));
        setLoading(false);
      });
    } else {
      setApiTransfers([]);
      setLoading(false);
    }
  }, [wiki]);

  // Fetch team logos in bulk from Liquipedia once transfers are loaded
  useEffect(() => {
    const fetchLogos = wiki === "counterstrike" ? getCS2TeamLogos
                     : wiki === "leagueoflegends" ? getLoLTeamLogos
                     : null;
    if (!fetchLogos || !apiTransfers.length) return;

    const names = [...new Set(
      apiTransfers
        .flatMap(tr => [tr.fromteam, tr.toteam])
        .filter(n => n && n !== "-" && n !== "—")
    )];
    if (!names.length) return;

    let cancelled = false;
    fetchLogos(names).then(map => { if (!cancelled) setTeamLogos(prev => ({ ...prev, ...map })); }).catch(() => {});
    return () => { cancelled = true; };
  }, [apiTransfers, wiki]);

  // Merge API data with mock data (API first; mock fills in when API returns nothing)
  const mockForWiki = getTransfers().filter(tr => tr.wiki === wiki);
  const apiKeys = new Set(apiTransfers.map(tr => `${tr.player}|${(tr.date || "").slice(0, 10)}`));
  const mockFallback = mockForWiki.filter(tr => !apiKeys.has(`${tr.player}|${(tr.date || "").slice(0, 10)}`));
  const all = [...apiTransfers, ...mockFallback];

  const sorted = [...all].sort((a, b) => new Date(b.date) - new Date(a.date));
  const shown = sorted.slice(0, visible);
  const hasMore = visible < sorted.length;

  return (
    <main>
      <div className={styles.hero}>
        <div className="wrap">
          <h1 className={styles.title}>{t("transfers.title")}</h1>
          <p className={styles.subtitle}>
            {sorted.length} {t("transfers.shown")}
          </p>
        </div>
      </div>

      <div className="wrap">
        <div className={styles.listWrap}>
          <div className={styles.listHead}>
            <span>{t("transfers.player")}</span>
            <span>{t("transfers.from")} → {t("transfers.to")}</span>
            <span>{t("transfers.date")}</span>
          </div>

          {shown.map((tr, i) => (
            <TransferRow key={`${tr.player}-${tr.date}-${i}`} transfer={tr} wiki={wiki} logoMap={teamLogos} />
          ))}

          {loading && shown.length === 0 && (
            <div className={styles.loading}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className={styles.skeleton} />
              ))}
            </div>
          )}

          {!loading && shown.length === 0 && (
            <div className={styles.empty}>{t("transfers.empty")}</div>
          )}

          {!loading && hasMore && (
            <button className={styles.seeMore} onClick={() => setVisible(v => v + PAGE_SIZE)}>
              {t("transfers.seeMore") || "See More"}
              <span className={styles.seeMoreCount}>+{sorted.length - visible}</span>
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
