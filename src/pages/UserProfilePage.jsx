import { Link } from "react-router-dom";
import { useAuth } from "../services/auth.jsx";
import { useLanguage } from "../contexts/LanguageContext";
import styles from "./UserProfilePage.module.css";

export default function UserProfilePage() {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();

  if (!user) {
    return (
      <div className="wrap" style={{ paddingTop: 80, textAlign: "center" }}>
        <h2 style={{ color: "var(--text-3)" }}>You must be signed in to view this page.</h2>
        <Link to="/" style={{ display: "inline-block", marginTop: 16, color: "var(--text-1)", fontWeight: 700 }}>← Home</Link>
      </div>
    );
  }

  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <main>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.heroInner}>
            <div className={styles.avatar}>
              <span className={styles.avatarLetter}>{user.username[0]?.toUpperCase()}</span>
            </div>
            <div className={styles.heroInfo}>
              <h1 className={styles.username}>{user.username}</h1>
              <span className={styles.email}>{user.email}</span>
              <span className={styles.joined}>Member since {joinedDate}</span>
            </div>
            <button className={styles.signOutBtn} onClick={signOut}>Sign Out</button>
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className={styles.grid}>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Account Info</h2>
            <div className={styles.infoList}>
              {[
                ["Username", user.username],
                ["Email",    user.email],
                ["Member since", joinedDate],
                ["Account ID", user.id],
              ].map(([k, v]) => (
                <div key={k} className={styles.infoRow}>
                  <span className={styles.infoKey}>{k}</span>
                  <span className={styles.infoVal}>{v}</span>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Favorite Teams</h2>
            <p className={styles.placeholder}>Coming soon — you'll be able to follow teams and get updates.</p>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Favorite Players</h2>
            <p className={styles.placeholder}>Coming soon — follow players and track their stats.</p>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Forum Activity</h2>
            <p className={styles.placeholder}>Coming soon — your topics and comments will appear here.</p>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Notifications</h2>
            <p className={styles.placeholder}>Coming soon — match alerts and transfer news for your followed teams.</p>
          </section>

        </div>
      </div>
    </main>
  );
}
