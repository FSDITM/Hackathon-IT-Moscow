export default function AdminStatsPage({ data }) {
  const activeBookings = data.bookings.filter(b => b.status === "active");
  const zoneStats = data.zones.map(z => ({
    ...z,
    bookingsCount: data.bookings.filter(b => b.zoneId === z.id).length,
    activeCount: activeBookings.filter(b => b.zoneId === z.id).length,
  }));

  return (
    <div>
      <div className="section-title">Статистика</div>
      <div className="section-sub">Аналитика работы арены</div>
      <div className="grid-3 mb-6">
        {[
          { label: "Всего броней", value: data.bookings.length, icon: "📅", color: "var(--cyan)" },
          { label: "Активных", value: activeBookings.length, icon: "✅", color: "#10b981" },
          { label: "Отменённых", value: data.bookings.filter(b => b.status === "cancelled").length, icon: "❌", color: "#ef4444" },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-title">СТАТИСТИКА ПО ЗОНАМ</div>
        <table>
          <thead><tr><th>Зона</th><th>Мест</th><th>Активных броней</th><th>Всего броней</th><th>Загрузка</th></tr></thead>
          <tbody>
            {zoneStats.map(z => {
              const load = Math.round(z.activeCount / z.seats * 100);
              return (
                <tr key={z.id}>
                  <td>{z.icon} {z.name}</td>
                  <td>{z.seats}</td>
                  <td>{z.activeCount}</td>
                  <td>{z.bookingsCount}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, background: "rgba(0,245,255,0.1)", borderRadius: 99, height: 6, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${load}%`, background: load > 70 ? "#ef4444" : "var(--cyan)", borderRadius: 99 }} />
                      </div>
                      <span style={{ fontSize: 12, color: "var(--muted)", width: 36 }}>{load}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
