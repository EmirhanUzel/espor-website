import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TICKER_ITEMS } from "../services/api";
import styles from "./Navbar.module.css";

const WIKIS = [
  { id: "valorant", label: "VALORANT" },
  { id: "counterstrike", label: "CS2" },
  { id: "leagueoflegends", label: "LoL" },
];

const REGIONS = ["All", "Americas", "Europe", "Pacific", "Korea", "Asia"];

const NAV_LINKS = [
  { label: "Tournaments", to: "/turnuva/VALORANT_Champions_2025" },
  { label: "Matches",     to: "/mac/CHAMP25GF" },
  { label: "Teams",       to: "/takim/Fnatic" },
  { label: "Players",     to: "/oyuncu/Boaster" },
  { label: "Rankings",    to: "/turnuva/VALORANT_Champions_2025" },
  { label: "News",        to: "/haberler" },
  { label: "Transfers",   to: "/transferler" },
];

// ── Icons ──────────────────────────────────────────────────────────────────────
function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ── Ticker Bar ─────────────────────────────────────────────────────────────────
function TickerBar() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className={styles.ticker}>
      <span className={styles.tickerLabel}>LATEST</span>
      <div className={styles.tickerTrack}>
        <div className={styles.tickerInner}>
          {doubled.map((item, i) => (
            <span key={i} className={styles.tickerItem}>
              <span className={styles.tickerDot}>▸</span>
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Context Bar ────────────────────────────────────────────────────────────────
function ContextBar({ activeWiki, onWikiChange, activeRegion, onRegionChange }) {
  const now = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  return (
    <div className={styles.contextBar}>
      <div className={styles.contextInner}>
        <div className={styles.wikiGroup}>
          {WIKIS.map(w => (
            <button
              key={w.id}
              className={`${styles.wikiBtn} ${activeWiki === w.id ? styles.wikiBtnActive : ""}`}
              onClick={() => onWikiChange(w.id)}
            >
              {w.label}
            </button>
          ))}
        </div>

        <div className={styles.contextSep} />

        <div className={styles.regionGroup}>
          {REGIONS.map(r => (
            <button
              key={r}
              className={`${styles.regionBtn} ${activeRegion === r ? styles.regionBtnActive : ""}`}
              onClick={() => onRegionChange(r)}
            >
              {r}
            </button>
          ))}
        </div>

        <div className={styles.contextRight}>
          <span className={styles.livePill}>
            <span className={styles.liveDot} />
            0 Live
          </span>
          <span className={styles.contextDate}>{now}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Navbar ────────────────────────────────────────────────────────────────
export default function Navbar({ activeWiki, onWikiChange, activeRegion = "All", onRegionChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleSearch = (e) => {
    if (e.key === "Enter" && search.trim()) {
      navigate(`/oyuncu/${search.trim()}`);
      setSearch("");
      setMenuOpen(false);
    }
  };

  const handleRegionChange = onRegionChange || (() => {});

  return (
    <>
      <TickerBar />
      <ContextBar
        activeWiki={activeWiki}
        onWikiChange={onWikiChange}
        activeRegion={activeRegion}
        onRegionChange={handleRegionChange}
      />

      <nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ""}`}>
        <div className={styles.inner}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoEs}>eS</span>
            <span className={styles.logoPor}>POR</span>
            <span className={styles.logoMax}>MAX</span>
          </Link>

          <div className={styles.divider} />

          <ul className={styles.navLinks}>
            {NAV_LINKS.map(link => (
              <li key={link.label}>
                <Link to={link.to} className={styles.navLink}>{link.label}</Link>
              </li>
            ))}
          </ul>

          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}><IconSearch /></span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search player, team..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>

          <div className={styles.authBtns}>
            <button className={styles.loginBtn}>Sign In</button>
            <button className={styles.registerBtn}>Register</button>
          </div>

          <button className={styles.hamburger} onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
            {menuOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>

        {menuOpen && (
          <div className={styles.mobileMenu}>
            <div className={styles.mobileWikis}>
              {WIKIS.map(w => (
                <button
                  key={w.id}
                  className={`${styles.mobileWikiBtn} ${activeWiki === w.id ? styles.mobileWikiBtnActive : ""}`}
                  onClick={() => { onWikiChange(w.id); setMenuOpen(false); }}
                >
                  {w.label}
                </button>
              ))}
            </div>

            <div className={styles.mobileRegions}>
              {REGIONS.map(r => (
                <button
                  key={r}
                  className={`${styles.mobileRegionBtn} ${activeRegion === r ? styles.mobileRegionBtnActive : ""}`}
                  onClick={() => { handleRegionChange(r); setMenuOpen(false); }}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className={styles.mobileSearch}>
              <span className={styles.searchIcon}><IconSearch /></span>
              <input
                className={styles.searchInput}
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>

            <ul className={styles.mobileNavLinks}>
              {NAV_LINKS.map(link => (
                <li key={link.label}>
                  <Link to={link.to} className={styles.mobileNavLink} onClick={() => setMenuOpen(false)}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className={styles.mobileAuth}>
              <button className={styles.loginBtn}>Sign In</button>
              <button className={styles.registerBtn}>Register</button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
