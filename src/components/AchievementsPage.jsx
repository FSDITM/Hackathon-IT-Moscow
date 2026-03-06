export default function AchievementsPage({ data, currentUser }) {
  return (
    <div>
      <div className="section-title">Достижения</div>
      <div className="section-sub">Выполняйте задания и получайте награды</div>

      <div className="grid-2 mb-4">
        <div className="card">
          <div className="card-title">ПРОГРЕСС</div>
          <div style={{ fontFamily: "Orbitron", fontSize: 32, color: "var(--cyan)", marginBottom: 4 }}>
            {currentUser.badges.length} / {data.achievements.length}
          </div>
          <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 12 }}>достижений получено</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${currentUser.badges.length / data.achievements.length * 100}%` }} />
          </div>
        </div>
        <div className="grid-2" style={{ gap: 12 }}>
          {["common", "rare", "epic", "legendary"].map(r => {
            const count = data.achievements.filter(a => a.rarity === r && currentUser.badges.includes(a.id)).length;
            const total = data.achievements.filter(a => a.rarity === r).length;
            return (
              <div key={r} className="stat-card">
                <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>{r}</div>
                <div style={{ fontFamily: "Orbitron", fontSize: 20, color: r === "legendary" ? "#fbbf24" : r === "epic" ? "#a855f7" : r === "rare" ? "var(--cyan)" : "var(--muted)", margin: "4px 0" }}>{count}/{total}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="card-title">ВСЕ ДОСТИЖЕНИЯ</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {data.achievements.map(ach => {
            const unlocked = currentUser.badges.includes(ach.id);
            return (
              <div key={ach.id} className={`achievement-item ${unlocked ? "" : "locked"}`}>
                <div className="ach-icon">{ach.icon}</div>
                <div style={{ flex: 1 }}>
                  <div className="ach-name">{ach.name}</div>
                  <div className="ach-desc">{ach.desc}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
                    <span className={`rarity-${ach.rarity}`} style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>◆ {ach.rarity}</span>
                    {unlocked && <span className="badge badge-green" style={{ fontSize: 10 }}>✓ Получено</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
