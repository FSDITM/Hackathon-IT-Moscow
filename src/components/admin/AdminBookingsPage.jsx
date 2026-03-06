import { useState } from "react";

export default function AdminBookingsPage({ data, updateData, notify }) {
  const [filter, setFilter] = useState("active");
  const bookings = data.bookings.filter(b => filter === "all" || b.status === filter);

  const cancel = (id) => {
    updateData(prev => ({ bookings: prev.bookings.map(b => b.id === id ? { ...b, status: "cancelled" } : b) }));
    notify("Бронирование отменено");
  };

  return (
    <div>
      <div className="section-title">Все бронирования</div>
      <div className="flex flex-wrap mb-4" style={{ gap: 8 }}>
        {["all", "active", "cancelled"].map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-secondary"}`} onClick={() => setFilter(f)}>
            {{ all: "Все", active: "Активные", cancelled: "Отменённые" }[f]}
          </button>
        ))}
      </div>
      <div className="card">
        <table>
          <thead><tr><th>Пользователь</th><th>Зона</th><th>Дата</th><th>Время</th><th>Место</th><th>Статус</th><th></th></tr></thead>
          <tbody>
            {bookings.map(b => {
              const user = data.users.find(u => u.id === b.userId);
              const zone = data.zones.find(z => z.id === b.zoneId);
              return (
                <tr key={b.id}>
                  <td>{user?.avatar} {user?.nick}</td>
                  <td>{zone?.icon} {zone?.name}</td>
                  <td>{b.date}</td>
                  <td>{b.startHour}:00 – {b.startHour + b.duration}:00</td>
                  <td>#{b.seat}</td>
                  <td><span className={`badge ${b.status === "active" ? "badge-green" : "badge-red"}`}>{b.status}</span></td>
                  <td>{b.status === "active" && <button className="btn btn-danger btn-sm" onClick={() => cancel(b.id)}>Отменить</button>}</td>
                </tr>
              );
            })}
            {bookings.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--muted)" }}>Нет бронирований</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
