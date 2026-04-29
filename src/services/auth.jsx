import { createContext, useContext, useEffect, useMemo, useState } from "react";
import AuthModal from "../components/AuthModal";

// Frontend-only demo auth. Users + session are persisted to localStorage.
// In a real app this would talk to a backend; storing a password client-side
// is a deliberate prototype shortcut, not a pattern to copy.

const USERS_KEY = "espormax.users";
const SESSION_KEY = "espormax.session";

const AuthCtx = createContext(null);

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function readUsers() { return readJSON(USERS_KEY, []); }
function writeUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }

function genId() {
  return `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readJSON(SESSION_KEY, null));
  const [authMode, setAuthMode] = useState(null);

  useEffect(() => {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  }, [user]);

  const register = ({ email, password, username }) => {
    const e = email.trim().toLowerCase();
    const u = username.trim();
    const users = readUsers();
    if (users.some(x => x.email.toLowerCase() === e)) {
      return { ok: false, error: "An account with this email already exists." };
    }
    if (users.some(x => x.username.toLowerCase() === u.toLowerCase())) {
      return { ok: false, error: "This username is already taken." };
    }
    const newUser = {
      id: genId(),
      email: email.trim(),
      username: u,
      password,
      createdAt: new Date().toISOString(),
    };
    writeUsers([...users, newUser]);
    const { password: _pw, ...session } = newUser;
    setUser(session);
    return { ok: true, user: session };
  };

  const signIn = ({ email, password }) => {
    const e = email.trim().toLowerCase();
    const found = readUsers().find(x => x.email.toLowerCase() === e && x.password === password);
    if (!found) return { ok: false, error: "Invalid email or password." };
    const { password: _pw, ...session } = found;
    setUser(session);
    return { ok: true, user: session };
  };

  const signOut = () => setUser(null);

  const openAuth = (mode) => setAuthMode(mode);
  const closeAuth = () => setAuthMode(null);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    register,
    signIn,
    signOut,
    openAuth,
  }), [user]);

  return (
    <AuthCtx.Provider value={value}>
      {children}
      <AuthModal
        open={authMode !== null}
        mode={authMode}
        onClose={closeAuth}
        onSwitchMode={setAuthMode}
      />
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
