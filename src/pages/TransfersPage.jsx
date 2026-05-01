import { useState } from "react";
import { getTransfers, formatDate, getFlag } from "../services/api";
import styles from "./TransfersPage.module.css";
import { useLanguage } from "../contexts/LanguageContext";

const ROLE_LABEL = {
  duelist: "Duelist", controller: "Controller", initiator: "Initiator",
  sentinel: "Sentinel", igl: "IGL", rifler: "Rifler", awper: "AWPer",
  support: "Support", top: "Top", jungle: "Jungle", mid: "Mid",
  bot: "Bot/ADC", adc: "ADC",
  "1": "Carry (#1)", "2": "Mid (#2)", "3": "Offlane (#3)",
  "4": "Support (#4)", "5": "Hard Support (#5)",
};

const WIKI_LABEL = {
  valorant: "VALORANT", counterstrike: "CS2",
  dota2: "Dota 2", leagueoflegends: "LoL",
};

function TransferCard({ transfer }) {
  const { t } = useLanguage();
  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <div className={styles.playerBlock}>
          <div className={styles.playerAvatar}>{transfer.player[0]}</div>
          <div className={styles.playerInfo}>
            <span className={styles.playerName}>{transfer.player}</span>
            <span className={styles.playerNat}>{getFlag(transfer.nationality)} {transfer.nationality}</span>
          </div>
        </div>
        <div className={styles.cardMeta}>
          <span className={styles.wikiBadge}>{WIKI_LABEL[transfer.wiki] || transfer.wiki}</span>
          <span className={styles.dateLabel}>{formatDate(transfer.date)}</span>
        </div>
      </div>

      <div className={styles.transferFlow}>
        <div className={styles.teamBlock}>
          <span className={styles.teamLabel}>{t("transfers.previousTeam")}</span>
          <span className={styles.teamName}>{transfer.fromteam}</span>
        </div>
        <div className={styles.arrowBlock}>
          <div className={styles.arrowLine} />
          <span className={styles.arrowIcon}>→</span>
        </div>
        <div className={`${styles.teamBlock} ${styles.teamBlockRight}`}>
          <span className={styles.teamLabel}>{t("transfers.newTeam")}</span>
          <span className={`${styles.teamName} ${styles.teamNameNew}`}>{transfer.toteam}</span>
        </div>
      </div>

      <div className={styles.cardFoot}>
        <div className={styles.roles}>
          {transfer.role1 && (
            <span className={styles.roleBadge}>
              {ROLE_LABEL[transfer.role1.toLowerCase()] || transfer.role1}
            </span>
          )}
          {transfer.role2 && transfer.role2 !== transfer.role1 && (
            <span className={styles.roleBadge}>
              {ROLE_LABEL[transfer.role2.toLowerCase()] || transfer.role2}
            </span>
          )}
        </div>
        {transfer.reference?.reference1 && (
          <a href={transfer.reference.reference1} target="_blank" rel="noreferrer" className={styles.refLink}
            title={transfer.reference.reference1type}>
            {t("transfers.source")}
          </a>
        )}
      </div>
    </div>
  );
}

function TransferRow({ transfer }) {
  return (
    <div className={styles.tableRow}>
      <div className={styles.tablePlayer}>
        <div className={styles.tableAvatar}>{transfer.player[0]}</div>
        <div>
          <span className={styles.tablePlayerName}>{transfer.player}</span>
          <span className={styles.tableNat}>{getFlag(transfer.nationality)} {transfer.nationality}</span>
        </div>
      </div>
      <div className={styles.tableFrom}>
        <span className={styles.tableTeamFrom}>{transfer.fromteam}</span>
      </div>
      <span className={styles.tableArrow}>→</span>
      <div className={styles.tableTo}>
        <span className={styles.tableTeamTo}>{transfer.toteam}</span>
      </div>
      <div className={styles.tableRole}>
        {transfer.role1 && (
          <span className={styles.tableRoleBadge}>
            {ROLE_LABEL[transfer.role1.toLowerCase()] || transfer.role1}
          </span>
        )}
      </div>
      <div className={styles.tableWiki}>
        <span className={styles.tableWikiBadge}>{WIKI_LABEL[transfer.wiki] || transfer.wiki}</span>
      </div>
      <span className={styles.tableDate}>{formatDate(transfer.date)}</span>
      {transfer.reference?.reference1 && (
        <a href={transfer.reference.reference1} target="_blank" rel="noreferrer" className={styles.tableRef}>↗</a>
      )}
    </div>
  );
}

export default function TransfersPage() {
  const { t } = useLanguage();
  const transfers = getTransfers();
  const [viewMode, setViewMode] = useState("cards");
  const [wikiFilter, setWikiFilter] = useState("All");

  const wikis = ["All", ...new Set(transfers.map(tr => tr.wiki))];
  const filtered = wikiFilter === "All" ? transfers : transfers.filter(tr => tr.wiki === wikiFilter);
  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  const stats = {
    total: transfers.length,
    valorant: transfers.filter(tr => tr.wiki === "valorant").length,
    cs2: transfers.filter(tr => tr.wiki === "counterstrike").length,
    dota2: transfers.filter(tr => tr.wiki === "dota2").length,
    lol: transfers.filter(tr => tr.wiki === "leagueoflegends").length,
  };

  return (
    <main>
      <div className={styles.pageHero}>
        <div className="wrap">
          <h1 className={styles.pageTitle}>{t("transfers.title")}</h1>
          <p className={styles.pageSubtitle}>{t("transfers.subtitle")}</p>
          <div className={styles.heroStats}>
            {[
              [t("transfers.total"), stats.total],
              ["VALORANT", stats.valorant],
              ["CS2", stats.cs2],
              ["Dota 2", stats.dota2],
              ["LoL", stats.lol],
            ].map(([label, val]) => (
              <div key={label} className={styles.heroStat}>
                <span className={styles.heroStatVal}>{val}</span>
                <span className={styles.heroStatLabel}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className={styles.controls}>
          <div className={styles.filterBar}>
            {wikis.map(w => (
              <button
                key={w}
                className={`${styles.filterBtn} ${wikiFilter === w ? styles.filterBtnActive : ""}`}
                onClick={() => setWikiFilter(w)}
              >
                {w === "All" ? t("transfers.total") : (WIKI_LABEL[w] || w)}
                {w !== "All" && (
                  <span className={styles.filterCount}>
                    {transfers.filter(tr => tr.wiki === w).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewBtn} ${viewMode === "cards" ? styles.viewBtnActive : ""}`}
              onClick={() => setViewMode("cards")} title={t("transfers.cardView")}
            >⊞</button>
            <button
              className={`${styles.viewBtn} ${viewMode === "table" ? styles.viewBtnActive : ""}`}
              onClick={() => setViewMode("table")} title={t("transfers.listView")}
            >≡</button>
          </div>
        </div>

        <p className={styles.resultCount}>
          <strong>{sorted.length}</strong> {t("transfers.shown")}
        </p>

        {viewMode === "cards" && (
          <section className={styles.section}>
            <div className={styles.grid}>
              {sorted.map((tr, i) => (
                <TransferCard key={`${tr.player}-${tr.date}-${i}`} transfer={tr} />
              ))}
            </div>
          </section>
        )}

        {viewMode === "table" && (
          <section className={styles.section}>
            <div className={styles.table}>
              <div className={styles.tableHead}>
                <span>{t("transfers.player")}</span>
                <span>{t("transfers.from")}</span>
                <span></span>
                <span>{t("transfers.to")}</span>
                <span>{t("transfers.role")}</span>
                <span>{t("transfers.game")}</span>
                <span>{t("transfers.date")}</span>
                <span></span>
              </div>
              {sorted.map((tr, i) => (
                <TransferRow key={`${tr.player}-${tr.date}-${i}`} transfer={tr} />
              ))}
            </div>
          </section>
        )}

        {sorted.length === 0 && (
          <div className={styles.empty}>{t("transfers.empty")}</div>
        )}
      </div>
    </main>
  );
}
