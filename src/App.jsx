import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import PlayerProfile from "./pages/PlayerProfile";
import TeamPage from "./pages/TeamPage";
import TournamentPage from "./pages/TournamentPage";
import MatchPage from "./pages/MatchPage";
import MatchesPage from "./pages/MatchesPage";
import TournamentsPage from "./pages/TournamentsPage";
import NewsPage from "./pages/NewsPage";
import TransfersPage from "./pages/TransfersPage";
import PlayerStats from "./pages/PlayerStats";
import TeamsRanking from "./pages/TeamsRanking";
import PlayersRanking from "./pages/PlayersRanking";
import TeamsRankingFull from "./pages/TeamsRankingFull";
import ForumPage from "./pages/ForumPage";
import ForumTopicPage from "./pages/ForumTopicPage";
import UserProfilePage from "./pages/UserProfilePage";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { AuthProvider } from "./services/auth.jsx";

function Footer() {
  const { t } = useLanguage();
  const links = [
    { key: "footer.about", label: t("footer.about") },
    { key: "footer.privacy", label: t("footer.privacy") },
    { key: "footer.contact", label: t("footer.contact") },
  ];
  return (
    <footer style={{ borderTop: "1px solid var(--border)", padding: "32px 40px", marginTop: "80px" }}>
      <div className="wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: "0.12em", color: "var(--text-1)", fontFamily: "var(--font-display)" }}>
          eSPORMAX
        </span>
        <span style={{ fontSize: 12, color: "var(--text-4)" }}>
          {t("footer.copyright")}
        </span>
        <div style={{ display: "flex", gap: 20 }}>
          {links.map(l => (
            <a key={l.key} href="#" style={{ fontSize: 12, color: "var(--text-3)", transition: "color 0.15s" }}
              onMouseEnter={e => e.target.style.color = "var(--text-1)"}
              onMouseLeave={e => e.target.style.color = "var(--text-3)"}
            >{l.label}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

function AppInner() {
  const [wiki, setWiki] = useState("valorant");
  const [region, setRegion] = useState("All");

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <ScrollToTop />
      <Navbar
        activeWiki={wiki}
        onWikiChange={setWiki}
        activeRegion={region}
        onRegionChange={setRegion}
      />
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/"              element={<Home wiki={wiki} region={region} />} />
          <Route path="/tournaments"         element={<TournamentsPage wiki={wiki} />} />
          <Route path="/tournament/:id"    element={<TournamentPage wiki={wiki} />} />
          <Route path="/matches"           element={<MatchesPage wiki={wiki} />} />
          <Route path="/match/:id"         element={<MatchPage wiki={wiki} />} />
          <Route path="/teams"             element={<TeamsRanking wiki={wiki} />} />
          <Route path="/teams/official"    element={<TeamsRankingFull type="official" />} />
          <Route path="/teams/espormax"    element={<TeamsRankingFull type="esm" />} />
          <Route path="/players"           element={<PlayersRanking wiki={wiki} />} />
          <Route path="/player/:id"        element={<PlayerProfile wiki={wiki} />} />
          <Route path="/player/:id/stats"  element={<PlayerStats />} />
          <Route path="/team/:name"        element={<TeamPage wiki={wiki} />} />
          <Route path="/news"              element={<NewsPage wiki={wiki} />} />
          <Route path="/transfers"         element={<TransfersPage wiki={wiki} />} />
          <Route path="/forum"             element={<ForumPage />} />
          <Route path="/forum/:topicId"    element={<ForumTopicPage />} />
          <Route path="/profile"           element={<UserProfilePage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppInner />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
