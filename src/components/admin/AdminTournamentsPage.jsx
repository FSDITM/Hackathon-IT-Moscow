import { useState } from "react";
import { getDateStr } from "../../data.js";

export default function AdminTournamentsPage({ data, updateData, notify }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [game, setGame] = useState("");
  const [prize, setPrize] = useState("");
  const [maxTeams, setMaxTeams] = useState(8);

  const create = () => {
    if (!name || !game) { notify("Заполните название и игру", "error"); return; }
    const t = { id: Date.now(), name, game, status: "open", maxTeams: +maxTeams, teams: [], prize: prize || "TBD", date: getDateStr(7), icon: "🏆" };
    updateData(prev => ({ tournaments: [...prev.tournaments, t] }));
    notify("Турнир создан!");
    setShowForm(false); setName(""); setGame(""); setPrize("");
  };

  const changeStatus = (id, status) => {
    updateData(prev => ({ tournaments: prev.tournaments.map(t => t.id === id ? { ...t, status } : t) }));
    notify("Статус обновлён");
  };

  return (
    <div>
      <div className="section-title">Управление турнирами</div>
      <div className="flex items-center justify-between mb-4">
        <div />
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Создать турнир</button>
      </div>
      {showForm && (
        <div className="card mb-4">
          <div className="card-title">НОВЫЙ ТУРНИР</div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group"><label className="label">Название</label><input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="CS2 Spring Cup" /></div>
            <div className="form-group"><label className="label">Игра</label><input className="input" value={game} onChange={e => setGame(e.target.value)} placeholder="CS2, Valorant..." /></div>
            <div className="form-group"><label className="label">Приз</label><input className="input" value={prize} onChange={e => setPrize(e.target.value)} placeholder="500 монет" /></div>
            <div className="form-group"><label className="label">Макс. команд</label><select className="input" value={maxTeams} onChange={e => setMaxTeams(e.target.value)}><option>4</option><option>8</option><option>16</option></select></div>
          </div>
          <button className="btn btn-primary" onClick={create}>Создать</button>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {data.tournaments.map(t => (
          <div key={t.id} className="tournament-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2" style={{ gap: 12 }}>
                <div style={{ fontSize: 28 }}>{t.icon}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{t.game} · {t.date} · {t.teams.length}/{t.maxTeams} команд</div>
                  <div style={{ fontSize: 12, color: "#fbbf24" }}>🏆 {t.prize}</div>
                </div>
              </div>
              <div className="flex gap-2" style={{ gap: 8 }}>
                {t.status === "open" && <button className="btn btn-orange btn-sm" onClick={() => changeStatus(t.id, "ongoing")}>Начать</button>}
                {t.status === "ongoing" && <button className="btn btn-purple btn-sm" onClick={() => changeStatus(t.id, "finished")}>Завершить</button>}
                <span className={`badge ${t.status === "open" ? "badge-green" : t.status === "ongoing" ? "badge-orange" : "badge-purple"}`}>{t.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
