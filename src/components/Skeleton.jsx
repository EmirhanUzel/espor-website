import styles from "./Skeleton.module.css";

export function SkeletonLine({ width = "100%", height = 14, style }) {
  return <div className={styles.line} style={{ width, height, ...style }} />;
}

export function SkeletonCard({ style }) {
  return (
    <div className={styles.card} style={style} role="status" aria-busy="true" aria-label="Loading...">
      <SkeletonLine width="60%" height={18} style={{ marginBottom: 12 }} />
      <SkeletonLine width="100%" height={12} style={{ marginBottom: 8 }} />
      <SkeletonLine width="80%" height={12} style={{ marginBottom: 8 }} />
      <SkeletonLine width="40%" height={12} />
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className={styles.hero} role="status" aria-busy="true" aria-label="Loading...">
      <div className="wrap">
        <div className={styles.heroInner}>
          <div className={styles.avatar} />
          <div style={{ flex: 1 }}>
            <SkeletonLine width="200px" height={32} style={{ marginBottom: 12 }} />
            <SkeletonLine width="140px" height={16} style={{ marginBottom: 8 }} />
            <SkeletonLine width="300px" height={14} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 4 }) {
  return (
    <div className={styles.grid} role="status" aria-busy="true" aria-label="Loading...">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
