import { useState } from "react";
import styles from "./Navbar.module.css";

const GAMES = [
  {
    id: "cs2",
    label: "CS2",
    color: "#f0a500",
    accent: "#1a1a2e",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
      </svg>
    ),
  },
  {
    id: "lol",
    label: "LoL",
    color: "#C89B3C",
    accent: "#091428",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
  },
  {
    id: "valorant",
    label: "VALORANT",
    color: "#FF4655",
    accent: "#0F1923",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 3l9 18 9-18H3zm2.5 2h13L12 19 5.5 5z"/>
      </svg>
    ),
  },
];

function Logo() {
  return (
    <div className={styles.logoWrapper}>
      <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
        <path d="M18 2L4 8v10c0 8.284 5.833 14.915 14 16 8.167-1.085 14-7.716 14-16V8L18 2z"
          fill="#E8631A" opacity="0.12"/>
        <path d="M18 2L4 8v10c0 8.284 5.833 14.915 14 16 8.167-1.085 14-7.716 14-16V8L18 2z"
          stroke="#E8631A" strokeWidth="1.5" fill="none"/>
        <text x="18" y="23" textAnchor="middle" fill="#E8631A"
          fontSize="11" fontWeight="800" fontFamily="monospace">eS</text>
      </svg>
      <div className={styles.logoText}>
        <span className={styles.logoMain}>eSPOR</span>
        <span className={styles.logoAccent}>MAX</span>
      </div>
    </div>
  );
}

function IconShield() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}
function IconTrophy() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="8 21 12 21 16 21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M17 3H7a2 2 0 0 0-2 2v6c0 4.418 3.134 7 7 7s7-2.582 7-7V5a2 2 0 0 0-2-2z"/><path d="M5 8H2m17 0h3"/></svg>;
}
function IconLive() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49"/><path d="M7.76 7.76a6 6 0 0 0 0 8.49"/></svg>;
}
function IconSearch() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function IconUser() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function IconUserPlus() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>;
}
function IconMenu() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
}
function IconClose() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

const NAV_LINKS = [
  { label: "Takımlar", icon: <IconShield /> },
  { label: "Turnuvalar", icon: <IconTrophy /> },
  { label: "Canlı Maçlar", icon: <IconLive />, live: true },
];

export default function Navbar({ onGameChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeGame, setActiveGame] = useState("cs2");
  const [search, setSearch] = useState("");

  const currentGame = GAMES.find((g) => g.id === activeGame);

  const handleGameSelect = (id) => {
    setActiveGame(id);
    if (onGameChange) onGameChange(id);
    setMenuOpen(false);
  };

  return (
    <>
      {/* Game accent bar */}
      <div
        className={styles.gameBar}
        style={{ "--game-color": currentGame.color }}
      >
        {GAMES.map((game) => (
          <button
            key={game.id}
            className={`${styles.gameBtn} ${activeGame === game.id ? styles.gameBtnActive : ""}`}
            style={{ "--game-color": game.color }}
            onClick={() => handleGameSelect(game.id)}
          >
            <span className={styles.gameBtnIcon}>{game.icon}</span>
            {game.label}
          </button>
        ))}
      </div>

      {/* Main navbar */}
      <nav className={styles.navbar} style={{ "--game-color": currentGame.color }}>
        <div className={styles.inner}>
          <Logo />

          <div className={styles.divider} />

          <ul className={styles.navLinks}>
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a href="#" className={styles.navLink}>
                  <span className={styles.navIcon}>{link.icon}</span>
                  {link.label}
                  {link.live && <span className={styles.liveBadge}>CANLI</span>}
                </a>
              </li>
            ))}
          </ul>

          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}><IconSearch /></span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Oyuncu, Takım veya Turnuva ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.authButtons}>
            <button className={styles.loginBtn}><IconUser /> Giriş Yap</button>
            <button className={styles.registerBtn}><IconUserPlus /> Kayıt Ol</button>
          </div>

          <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className={styles.mobileMenu}>
            {/* Game selector mobile */}
            <div className={styles.mobileGames}>
              {GAMES.map((game) => (
                <button
                  key={game.id}
                  className={`${styles.mobileGameBtn} ${activeGame === game.id ? styles.mobileGameBtnActive : ""}`}
                  style={{ "--game-color": game.color }}
                  onClick={() => handleGameSelect(game.id)}
                >
                  {game.icon}
                  {game.label}
                </button>
              ))}
            </div>

            <div className={styles.mobileSearch}>
              <span className={styles.searchIcon}><IconSearch /></span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <ul className={styles.mobileLinks}>
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a href="#" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                    <span style={{ color: currentGame.color }}>{link.icon}</span>
                    {link.label}
                    {link.live && <span className={styles.liveBadge}>CANLI</span>}
                  </a>
                </li>
              ))}
            </ul>

            <div className={styles.mobileAuth}>
              <button className={styles.loginBtn}><IconUser /> Giriş Yap</button>
              <button className={styles.registerBtn}><IconUserPlus /> Kayıt Ol</button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}