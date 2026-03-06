import { useState } from "react";

export default function ActivityPage({ data }) {
  const [filter, setFilter] = useState("all");
  const types = ["all", "booking", "achievement", "tournament", "team"];
  const feed = filter === "all" ? data.activityFeed : data.activityFeed.filter(f => f.type === filter);
  const icons = { booking: "📅", achievement: "🎖️", tournament: "🏆", team: "👥" };
  const colors = { booking: "rgba(0,245,255,0.15)", achievement: "rgba(255,107,53,0.15)", tournament: "rgba(168,85,247,0.15)", team: "rgba(16,185,129,0.15)" };
  const labels = { booking: "Брони", achievement: "Достижения", tournament: "Турниры", team: "Команды" };

  return (
    <div>
      <div className="section-title">Лента активности</div>
      <div className="section-sub">Всё, что происходит на арене</div>

      <div className="flex flex-wrap mb-4" style={{ gap: 8 }}>
        {types.map(t => (
          <button key={t} className={`btn btn-sm ${filter === t ? "btn-primary" : "btn-secondary"}`} onClick={() => setFilter(t)}>
            {t === "all" ? "Всё" : icons[t] + " " + labels[t]}
          </button>
        ))}
      </div>

      <div className="card">
        {feed.length === 0 && <div style={{ color: "var(--muted)", textAlign: "center", padding: 24 }}>Нет событий</div>}
        {feed.map(item => (
          <div key={item.id} className="feed-item">
            <div className="feed-icon" style={{ background: colors[item.type] || "rgba(0,245,255,0.1)" }}>
              {icons[item.type] || "📡"}
            </div>
            <div style={{ flex: 1 }}>
              <div className="feed-text">
                {item.userId && <strong>{data.users.find(u => u.id === item.userId)?.nick || "Система"} </strong>}
                {item.text}
              </div>
              <div className="feed-time">{item.time}</div>
            </div>
            <span className="badge badge-cyan" style={{ fontSize: 10 }}>{item.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
