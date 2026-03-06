export default function PageSkeleton() {
  return (
    <div style={{ padding: 0 }}>
      <div className="skeleton skeleton-title" />
      <div className="grid-3" style={{ marginBottom: 20 }}>
        {[1,2,3].map(i => <div key={i} className="skeleton skeleton-card" />)}
      </div>
      <div className="skeleton skeleton-card" style={{ height: 200 }} />
      <div style={{ marginTop: 16 }}>
        {[1,2,3].map(i => <div key={i} className="skeleton skeleton-line" style={{ width: `${80 - i*10}%` }} />)}
      </div>
    </div>
  );
}
