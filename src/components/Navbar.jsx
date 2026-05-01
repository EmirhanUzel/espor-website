import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TICKER_ITEMS, getTodayMatches, getLiveMatches, formatTime, searchEntities } from "../services/api";
import styles from "./Navbar.module.css";
import { useAuth } from "../services/auth.jsx";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";

const WIKIS = [
  { id: "valorant", label: "VALORANT" },
  { id: "counterstrike", label: "CS2" },
  { id: "leagueoflegends", label: "LoL" },
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
function IconSun() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}
function IconMoon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

// ── Ticker Bar ─────────────────────────────────────────────────────────────────
function TickerBar() {
  const { t } = useLanguage();
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className={styles.ticker}>
      <span className={styles.tickerLabel}>{t("nav.latest")}</span>
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
  const { t, lang } = useLanguage();

  const REGIONS_I18N = [
    { key: "All",      labelKey: "region.all" },
    { key: "Americas", labelKey: "region.americas" },
    { key: "Europe",   labelKey: "region.europe" },
    { key: "Pacific",  labelKey: "region.pacific" },
    { key: "Korea",    labelKey: "region.korea" },
    { key: "Asia",     labelKey: "region.asia" },
  ];

  const now = new Date().toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
  const liveCount = getLiveMatches().length;

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
          {REGIONS_I18N.map(r => (
            <button
              key={r.key}
              className={`${styles.regionBtn} ${activeRegion === r.key ? styles.regionBtnActive : ""}`}
              onClick={() => onRegionChange(r.key)}
            >
              {t(r.labelKey)}
            </button>
          ))}
        </div>

        <div className={styles.contextRight}>
          <Link to="/matches" className={styles.livePill}>
            <span className={styles.liveDot} />
            {liveCount} {t("nav.live")}
          </Link>
          <span className={styles.contextDate}>{now}</span>
        </div>
      </div>
    </div>
  );
}

// ── Search Box ────────────────────────────────────────────────────────────────
function SearchBox({ variant = "desktop", onSelect }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const results = useMemo(() => searchEntities(query, 4), [query]);
  const flatList = useMemo(
    () => [...results.players, ...results.teams, ...results.tournaments],
    [results]
  );

  useEffect(() => { setActiveIdx(-1); }, [query]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const close = () => { setOpen(false); setActiveIdx(-1); };

  const pick = (item) => {
    if (!item) return;
    navigate(item.to);
    setQuery("");
    close();
    onSelect?.();
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      if (!flatList.length) return;
      e.preventDefault();
      setOpen(true);
      setActiveIdx(i => (i + 1) % flatList.length);
    } else if (e.key === "ArrowUp") {
      if (!flatList.length) return;
      e.preventDefault();
      setOpen(true);
      setActiveIdx(i => (i <= 0 ? flatList.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      if (!flatList.length) return;
      e.preventDefault();
      pick(activeIdx >= 0 ? flatList[activeIdx] : flatList[0]);
    } else if (e.key === "Escape") {
      close();
    }
  };

  const showDropdown = open && query.trim().length > 0;
  const hasAny = results.total > 0;
  const wrapClass = variant === "mobile" ? styles.mobileSearch : styles.searchWrapper;

  return (
    <div className={wrapClass} ref={containerRef}>
      <span className={styles.searchIcon}><IconSearch /></span>
      <input
        className={styles.searchInput}
        type="text"
        placeholder={variant === "mobile" ? t("nav.searchPlaceholderMobile") : t("nav.searchPlaceholder")}
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        autoComplete="off"
      />

      {showDropdown && (
        <div className={styles.searchDropdown} role="listbox">
          {!hasAny && (
            <div className={styles.searchEmpty}>{t("nav.noResults", { q: query.trim() })}</div>
          )}

          {results.players.length > 0 && (
            <SearchSection
              label={t("nav.searchPlayers")}
              items={results.players}
              startIdx={0}
              activeIdx={activeIdx}
              onPick={pick}
              onHover={setActiveIdx}
            />
          )}
          {results.teams.length > 0 && (
            <SearchSection
              label={t("nav.searchTeams")}
              items={results.teams}
              startIdx={results.players.length}
              activeIdx={activeIdx}
              onPick={pick}
              onHover={setActiveIdx}
            />
          )}
          {results.tournaments.length > 0 && (
            <SearchSection
              label={t("nav.searchTournaments")}
              items={results.tournaments}
              startIdx={results.players.length + results.teams.length}
              activeIdx={activeIdx}
              onPick={pick}
              onHover={setActiveIdx}
            />
          )}
        </div>
      )}
    </div>
  );
}

function SearchSection({ label, items, startIdx, activeIdx, onPick, onHover }) {
  return (
    <div className={styles.searchSection}>
      <div className={styles.searchSectionLabel}>{label}</div>
      {items.map((item, i) => {
        const idx = startIdx + i;
        const isActive = idx === activeIdx;
        return (
          <button
            key={`${item.kind}-${item.id}`}
            type="button"
            role="option"
            aria-selected={isActive}
            className={`${styles.searchItem} ${isActive ? styles.searchItemActive : ""}`}
            onMouseEnter={() => onHover(idx)}
            onClick={() => onPick(item)}
          >
            <span className={styles.searchItemThumb}>
              {item.kind === "team" && item.logo
                ? <img src={item.logo} alt="" />
                : item.kind === "tournament" && item.icon
                ? <img src={item.icon} alt="" />
                : item.kind === "player"
                ? <span className={styles.searchItemFlag}>{item.flag}</span>
                : <span className={styles.searchItemFallback}>{item.title.slice(0, 1).toUpperCase()}</span>}
            </span>
            <span className={styles.searchItemBody}>
              <span className={styles.searchItemTitle}>{item.title}</span>
              {item.subtitle && (
                <span className={styles.searchItemSub}>{item.subtitle}</span>
              )}
            </span>
            {item.wikiShort && (
              <span className={styles.searchItemBadge}>{item.wikiShort}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Matches Dropdown ──────────────────────────────────────────────────────────
function MatchesDropdown() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const todayAll  = getTodayMatches();
  const live      = todayAll.filter(m => m.finished === 0);
  const done      = todayAll.filter(m => m.finished === 1);
  const upcoming  = todayAll.filter(m => m.finished !== 0 && m.finished !== 1);
  const hasContent = live.length + done.length + upcoming.length > 0;

  return (
    <div className={styles.matchDropdown}>
      {!hasContent && (
        <div className={styles.mdEmpty}>{t("nav.noMatchesToday")}</div>
      )}

      {live.length > 0 && (
        <div className={styles.mdSection}>
          <div className={styles.mdSectionHead}>
            <span className={styles.mdLiveDot} />
            <span className={styles.mdSectionLabel}>{t("nav.liveNow")}</span>
          </div>
          {live.map(m => <DropdownRow key={m.id} match={m} navigate={navigate} />)}
        </div>
      )}

      {done.length > 0 && (
        <div className={styles.mdSection}>
          <div className={styles.mdSectionHead}>
            <span className={styles.mdSectionLabel}>{t("nav.todayResults")}</span>
          </div>
          {done.map(m => <DropdownRow key={m.id} match={m} navigate={navigate} />)}
        </div>
      )}

      {upcoming.length > 0 && (
        <div className={styles.mdSection}>
          <div className={styles.mdSectionHead}>
            <span className={styles.mdSectionLabel}>{t("nav.upcoming")}</span>
          </div>
          {upcoming.map(m => <DropdownRow key={m.id} match={m} navigate={navigate} />)}
        </div>
      )}

      <div className={styles.mdFooter}>
        <Link to="/matches" className={styles.mdSeeAll}>{t("nav.seeAllMatches")}</Link>
      </div>
    </div>
  );
}

function DropdownRow({ match, navigate }) {
  const [opp1, opp2] = match.match2opponents;
  const isLive     = match.finished === 0;
  const isFinished = match.finished === 1;

  return (
    <div className={styles.mdRow} onClick={() => navigate(`/match/${match.id}`)}>
      <div className={styles.mdRowStatus}>
        {isLive     && <span className={styles.mdRowLive}>●</span>}
        {!isLive    && <span className={styles.mdRowTime}>{formatTime(match.date)}</span>}
      </div>
      <div className={styles.mdRowMatchup}>
        <span className={`${styles.mdRowTeam} ${isFinished && match.winner === "1" ? styles.mdRowWinner : ""}`}>
          {opp1?.name}
        </span>
        <span className={styles.mdRowScore}>
          {(isLive || isFinished) ? `${opp1?.score ?? 0} : ${opp2?.score ?? 0}` : "vs"}
        </span>
        <span className={`${styles.mdRowTeam} ${styles.mdRowTeamRight} ${isFinished && match.winner === "2" ? styles.mdRowWinner : ""}`}>
          {opp2?.name}
        </span>
      </div>
      <span className={styles.mdRowHeader}>
        {match.match2bracketdata?.header || match.tournament}
      </span>
      <span className={styles.mdRowArrow}>›</span>
    </div>
  );
}

// ── User Menu (signed-in) ─────────────────────────────────────────────────────
function UserMenu({ user, onSignOut }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const initial = user.username[0]?.toUpperCase() || "?";

  return (
    <div className={styles.userMenu} ref={ref}>
      <button className={styles.userBtn} onClick={() => setOpen(o => !o)} aria-label={t("nav.accountMenu")}>
        <span className={styles.userAvatar}>{initial}</span>
        <span className={styles.userName}>{user.username}</span>
        <span className={styles.userCaret}>▾</span>
      </button>
      {open && (
        <div className={styles.userDropdown}>
          <div className={styles.userInfo}>
            <span className={styles.userInfoName}>{user.username}</span>
            <span className={styles.userInfoEmail}>{user.email}</span>
          </div>
          <button
            className={styles.userMenuItem}
            onClick={() => { setOpen(false); onSignOut(); }}
          >
            {t("nav.signOut")}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Navbar ────────────────────────────────────────────────────────────────
export default function Navbar({ activeWiki, onWikiChange, activeRegion = "All", onRegionChange }) {
  const { user, openAuth: openAuthCtx, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLanguage();
  const [menuOpen, setMenuOpen]       = useState(false);
  const [scrolled, setScrolled]       = useState(false);

  const openAuth = (mode) => { openAuthCtx(mode); setMenuOpen(false); };

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleRegionChange = onRegionChange || (() => {});

  const allNavLinks = [
    { labelKey: "nav.tournaments", to: "/tournaments" },
    { labelKey: "nav.matches",     to: "/matches" },
    { labelKey: "nav.teams",       to: "/teams" },
    { labelKey: "nav.players",     to: "/players" },
    { labelKey: "nav.news",        to: "/news" },
    { labelKey: "nav.transfers",   to: "/transfers" },
    { labelKey: "nav.forum",       to: "/forum" },
  ];

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
            {allNavLinks.map(link => (
              <li key={link.labelKey}>
                <Link to={link.to} className={styles.navLink}>{t(link.labelKey)}</Link>
              </li>
            ))}
          </ul>

          <SearchBox variant="desktop" />

          {/* Theme + Language toggles */}
          <div className={styles.iconBtns}>
            <button
              className={styles.iconBtn}
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              {theme === "dark" ? <IconSun /> : <IconMoon />}
            </button>
            <button
              className={styles.langBtn}
              onClick={toggleLang}
              aria-label="Toggle language"
              title={lang === "en" ? "Türkçe'ye geç" : "Switch to English"}
            >
              {lang === "en" ? "TR" : "EN"}
            </button>
          </div>

          {user ? (
            <div className={styles.authBtns}>
              <UserMenu user={user} onSignOut={signOut} />
            </div>
          ) : (
            <div className={styles.authBtns}>
              <button className={styles.loginBtn} onClick={() => openAuth("signin")}>{t("nav.signIn")}</button>
              <button className={styles.registerBtn} onClick={() => openAuth("register")}>{t("nav.register")}</button>
            </div>
          )}

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
              {[
                { key: "All", labelKey: "region.all" },
                { key: "Americas", labelKey: "region.americas" },
                { key: "Europe", labelKey: "region.europe" },
                { key: "Pacific", labelKey: "region.pacific" },
                { key: "Korea", labelKey: "region.korea" },
                { key: "Asia", labelKey: "region.asia" },
              ].map(r => (
                <button
                  key={r.key}
                  className={`${styles.mobileRegionBtn} ${activeRegion === r.key ? styles.mobileRegionBtnActive : ""}`}
                  onClick={() => { handleRegionChange(r.key); setMenuOpen(false); }}
                >
                  {t(r.labelKey)}
                </button>
              ))}
            </div>

            <SearchBox variant="mobile" onSelect={() => setMenuOpen(false)} />

            {/* Mobile theme + lang toggles */}
            <div className={styles.mobileToggles}>
              <button className={styles.mobileIconBtn} onClick={toggleTheme}>
                {theme === "dark" ? <IconSun /> : <IconMoon />}
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </button>
              <button className={styles.mobileIconBtn} onClick={toggleLang}>
                <span className={styles.mobileLangIcon}>{lang === "en" ? "TR" : "EN"}</span>
                <span>{lang === "en" ? "Türkçe" : "English"}</span>
              </button>
            </div>

            <ul className={styles.mobileNavLinks}>
              {allNavLinks.map(link => (
                <li key={link.labelKey}>
                  <Link to={link.to} className={styles.mobileNavLink} onClick={() => setMenuOpen(false)}>
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>

            {user ? (
              <div className={styles.mobileUser}>
                <div className={styles.mobileUserInfo}>
                  <span className={styles.userAvatar}>{user.username[0]?.toUpperCase()}</span>
                  <div className={styles.mobileUserText}>
                    <span className={styles.userInfoName}>{user.username}</span>
                    <span className={styles.userInfoEmail}>{user.email}</span>
                  </div>
                </div>
                <button
                  className={styles.loginBtn}
                  onClick={() => { signOut(); setMenuOpen(false); }}
                >
                  {t("nav.signOut")}
                </button>
              </div>
            ) : (
              <div className={styles.mobileAuth}>
                <button className={styles.loginBtn} onClick={() => openAuth("signin")}>{t("nav.signIn")}</button>
                <button className={styles.registerBtn} onClick={() => openAuth("register")}>{t("nav.register")}</button>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
