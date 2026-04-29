import { useState, useEffect, useRef } from "react";
import styles from "./AuthModal.module.css";
import { useAuth } from "../services/auth.jsx";

function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconEye({ open }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.46 18.46 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
function IconGoogle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M21.35 11.1H12v3.8h5.35c-.23 1.4-1.7 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.76 1.45l2.57-2.47C16.95 4.55 14.7 3.5 12 3.5c-4.82 0-8.7 3.9-8.7 8.7s3.88 8.7 8.7 8.7c5.02 0 8.34-3.53 8.34-8.5 0-.57-.06-1-.14-1.3z" />
    </svg>
  );
}
export default function AuthModal({ open, mode, onClose, onSwitchMode }) {
  const { signIn, register } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", username: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const firstFieldRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setError("");
    setLoading(false);
    setShowPw(false);
    setForm({ email: "", password: "", username: "", confirm: "" });
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setTimeout(() => firstFieldRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, mode, onClose]);

  if (!open) return null;

  const isRegister = mode === "register";

  const handleChange = (k) => (e) => setForm(s => ({ ...s, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.email.includes("@")) { setError("Please enter a valid email."); return; }
    if (form.password.length < 6)  { setError("Password must be at least 6 characters."); return; }
    if (isRegister) {
      if (form.username.trim().length < 3)        { setError("Username must be at least 3 characters."); return; }
      if (form.password !== form.confirm)         { setError("Passwords do not match."); return; }
    }

    setLoading(true);
    const result = isRegister
      ? register({ email: form.email, password: form.password, username: form.username })
      : signIn({ email: form.email, password: form.password });
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    onClose();
  };

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <IconClose />
        </button>

        <div className={styles.header}>
          <span className={styles.brand}>
            <span className={styles.brandEs}>eS</span>
            <span className={styles.brandPor}>POR</span>
            <span className={styles.brandMax}>MAX</span>
          </span>
          <h2 className={styles.title}>
            {isRegister ? "Create your account" : "Welcome back"}
          </h2>
          <p className={styles.subtitle}>
            {isRegister
              ? "Join the esports community in seconds."
              : "Sign in to follow matches, teams and players."}
          </p>
        </div>

        <div className={styles.socialRow}>
          <button type="button" className={styles.socialBtn}>
            <IconGoogle /> <span>Continue with Google</span>
          </button>
        </div>

        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>or</span>
          <span className={styles.dividerLine} />
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {isRegister && (
            <label className={styles.field}>
              <span className={styles.label}>Username</span>
              <input
                ref={firstFieldRef}
                type="text"
                className={styles.input}
                placeholder="your_handle"
                value={form.username}
                onChange={handleChange("username")}
                autoComplete="username"
              />
            </label>
          )}

          <label className={styles.field}>
            <span className={styles.label}>Email</span>
            <input
              ref={isRegister ? null : firstFieldRef}
              type="email"
              className={styles.input}
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange("email")}
              autoComplete="email"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.labelRow}>
              <span className={styles.label}>Password</span>
              {!isRegister && <a href="#" className={styles.forgot} onClick={(e) => e.preventDefault()}>Forgot?</a>}
            </span>
            <div className={styles.pwWrap}>
              <input
                type={showPw ? "text" : "password"}
                className={styles.input}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange("password")}
                autoComplete={isRegister ? "new-password" : "current-password"}
              />
              <button
                type="button"
                className={styles.pwToggle}
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                <IconEye open={showPw} />
              </button>
            </div>
          </label>

          {isRegister && (
            <label className={styles.field}>
              <span className={styles.label}>Confirm password</span>
              <input
                type={showPw ? "text" : "password"}
                className={styles.input}
                placeholder="••••••••"
                value={form.confirm}
                onChange={handleChange("confirm")}
                autoComplete="new-password"
              />
            </label>
          )}

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
          </button>

          {isRegister && (
            <p className={styles.terms}>
              By creating an account you agree to our <a href="#" onClick={e => e.preventDefault()}>Terms</a> and <a href="#" onClick={e => e.preventDefault()}>Privacy Policy</a>.
            </p>
          )}
        </form>

        <div className={styles.footer}>
          {isRegister ? (
            <>Already have an account?{" "}
              <button type="button" className={styles.switchBtn} onClick={() => onSwitchMode("signin")}>Sign in</button>
            </>
          ) : (
            <>Don't have an account?{" "}
              <button type="button" className={styles.switchBtn} onClick={() => onSwitchMode("register")}>Register</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
