import { useState } from "react";
import { Routes, Route } from "react-router-dom";
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

function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", padding: "32px 40px", marginTop: "80px" }}>
      <div className="wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: "0.12em", color: "var(--text-1)", fontFamily: "var(--font-display)" }}>
          eSPORMAX
        </span>
        <span style={{ fontSize: 12, color: "var(--text-4)" }}>
          © 2025 eSPORMAX · Powered by Liquipedia API
        </span>
        <div style={{ display: "flex", gap: 20 }}>
          {["About", "Privacy", "Contact"].map(l => (
            <a key={l} href="#" style={{ fontSize: 12, color: "var(--text-3)", transition: "color 0.15s" }}
              onMouseEnter={e => e.target.style.color = "var(--text-1)"}
              onMouseLeave={e => e.target.style.color = "var(--text-3)"}
            >{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [wiki, setWiki] = useState("valorant");
  const [region, setRegion] = useState("All");

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <Navbar
        activeWiki={wiki}
        onWikiChange={setWiki}
        activeRegion={region}
        onRegionChange={setRegion}
      />
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/"              element={<Home wiki={wiki} region={region} />} />
          <Route path="/tournaments"         element={<TournamentsPage />} />
          <Route path="/tournament/:id"    element={<TournamentPage wiki={wiki} />} />
          <Route path="/matches"           element={<MatchesPage />} />
          <Route path="/match/:id"         element={<MatchPage />} />
          <Route path="/teams"             element={<TeamsRanking wiki={wiki} />} />
          <Route path="/teams/official"    element={<TeamsRankingFull type="official" />} />
          <Route path="/teams/espormax"    element={<TeamsRankingFull type="esm" />} />
          <Route path="/players"           element={<PlayersRanking wiki={wiki} />} />
          <Route path="/player/:id"        element={<PlayerProfile />} />
          <Route path="/player/:id/stats"  element={<PlayerStats />} />
          <Route path="/team/:name"        element={<TeamPage wiki={wiki} />} />
          <Route path="/news"              element={<NewsPage wiki={wiki} />} />
          <Route path="/transfers"         element={<TransfersPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
