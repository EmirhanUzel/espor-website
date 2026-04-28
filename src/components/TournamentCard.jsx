import { Link } from "react-router-dom";
import { formatDate, formatPrize, tierLabel } from "../services/api";
import styles from "./TournamentCard.module.css";

const COUNTRY_FLAG = { fr:"🇫🇷", de:"🇩🇪", us:"🇺🇸", kr:"🇰🇷", cn:"🇨🇳", mt:"🇲🇹", gb:"🇬🇧", sg:"🇸🇬" };

export default function TournamentCard({ tournament: t }) {
  const flag = COUNTRY_FLAG[t.locations?.country?.toLowerCase()] || "🌐";
  return (
    <Link to={`/turnuva/${t.id}`} className={styles.card}>
      <div className={styles.top}>
        <span className={`${styles.tier} ${t.liquipediatier === "1" ? styles.tierS : t.liquipediatier === "2" ? styles.tierA : styles.tierB}`}>
          {tierLabel(t.liquipediatier)}{t.liquipediatiertype ? ` · ${t.liquipediatiertype}` : ""}
        </span>
        <h3 className={styles.name}>{t.name}</h3>
        {t.seriespage && <span className={styles.series}>{t.seriespage.replace(/_/g, " ")}</span>}
      </div>

      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Location</span>
          <span className={styles.metaVal}>{flag} {t.locations?.city}, {t.locations?.venue}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Dates</span>
          <span className={styles.metaVal}>{formatDate(t.startdate)} – {formatDate(t.enddate)}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Prize Pool</span>
          <span className={`${styles.metaVal} ${styles.prize}`}>{formatPrize(t.prizepool)}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Format</span>
          <span className={styles.metaVal}>{t.format}</span>
        </div>
      </div>

      <div className={styles.foot}>
        <span className={styles.footItem}>{t.participantsnumber} Teams</span>
        {t.patch && <span className={styles.footItem}>Patch {t.patch}</span>}
        <span className={styles.arrow}>→</span>
      </div>
    </Link>
  );
}
