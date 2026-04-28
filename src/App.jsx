import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import PlayerProfile from "./pages/PlayerProfile";
import TeamPage from "./pages/TeamPage";

const GAME_THEMES = {
  cs2:      { bg: "#ffffff", accent: "#f0a500" },
  lol:      { bg: "#ffffff", accent: "#C89B3C" },
  valorant: { bg: "#ffffff", accent: "#FF4655" },
};

export default function App() {
  const [activeGame, setActiveGame] = useState("cs2");
  const theme = GAME_THEMES[activeGame];

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: theme.bg }}>
      <Navbar onGameChange={setActiveGame} gameColor={theme.accent} />
      <Routes>
        <Route path="/"              element={<Home gameColor={theme.accent} activeGame={activeGame} />} />
        <Route path="/oyuncu/:nick"  element={<PlayerProfile gameColor={theme.accent} />} />
        <Route path="/takim/:name"   element={<TeamPage gameColor={theme.accent} />} />
      </Routes>
    </div>
  );
}