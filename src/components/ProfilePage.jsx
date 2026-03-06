import { useState } from "react";

export default function ProfilePage({ data, currentUser, updateData, notify }) {
  const [editing, setEditing] = useState(false);
  const [nick, setNick] = useState(currentUser.nick);
  const [name, setName] = useState(currentUser.name);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const avatars = ["🎮", "⚡", "🔥", "💎", "🌟", "👑", "🦁", "🐉"];

  const save = () => {
    updateData(prev => ({ users: prev.users.map(u => u.id === currentUser.id ? { ...u, nick, name, avatar } : u) }));
    notify("Профиль обновлён!");
    setEditing(false);
  };

  const myBookings = data.bookings.filter(b => b.userId === currentUser.id);
  const myTeam = data.teams.find(t => t.id === currentUser.teamId);

  return (
    <div>
      <div className="section-title">Профиль</div>
      <div className="section-sub">Ваша статистика и настройки</div>

      <div className="grid-2">
        <div>
          <div className="card mb-4" style={{ background: "linear-gradient(135deg, rgba(0,245,255,0.06) 0%, rgba(168,85,247,0.04) 100%)" }}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 56, marginBottom: 8 }}>
                {editing ? (
                  <div className="flex flex-wrap" style={{ justifyContent: "center", gap: 8 }}>
                    {avatars.map(a => <span key={a} onClick={() => setAvatar(a)} style={{ cursor: "pointer", fontSize: 32, opacity: avatar === a ? 1 : 0.4, transform: avatar === a ? "scale(1.2)" : "none", transition: "all 0.2s" }}>{a}</span>)}
                  </div>
                ) : currentUser.avatar}
              </div>
              {editing ? (
                <>
                  <input className="input" value={nick} onChange={e => setNick(e.target.value)} style={{ textAlign: "center", marginBottom: 8 }} />
                  <input className="input" value={name} onChange={e => setName(e.target.value)} style={{ textAlign: "center" }} />
                </>
              ) : (
                <>
                  <div style={{ fontFamily: "Orbitron", fontSize: 18, color: "var(--text)", marginBottom: 4 }}>{currentUser.nick}</div>
                  <div style={{ color: "var(--muted)", fontSize: 13 }}>{currentUser.name}</div>
                  <div style={{ color: "var(--muted)", fontSize: 12 }}>{currentUser.email}</div>
                </>
              )}
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="level-badge">⭐ Уровень {currentUser.level}</span>
              <span className="badge badge-cyan">🪙 {currentUser.coins} монет</span>
            </div>
            <div className="mb-4">
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
                <span>XP: {currentUser.xp} / {currentUser.xpMax}</span>
                <span>{Math.round(currentUser.xp / currentUser.xpMax * 100)}%</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${currentUser.xp / currentUser.xpMax * 100}%` }} /></div>
            </div>
            {editing ? (
              <div className="flex gap-2" style={{ gap: 8 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={save}>Сохранить</button>
                <button className="btn btn-secondary" onClick={() => setEditing(false)}>Отмена</button>
              </div>
            ) : (
              <button className="btn btn-secondary btn-full" onClick={() => setEditing(true)}>✏️ Редактировать</button>
            )}
          </div>

          <div className="card">
            <div className="card-title">МОЯ КОМАНДА</div>
            {myTeam ? (
              <div>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{myTeam.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{myTeam.name}</div>
                <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 12 }}>[{myTeam.tag}] · {myTeam.members.length} игроков</div>
                <div className="flex gap-2" style={{ gap: 12 }}>
                  <span className="badge badge-green">✅ {myTeam.wins} побед</span>
                  <span className="badge badge-red">❌ {myTeam.losses} поражений</span>
                </div>
              </div>
            ) : <div style={{ color: "var(--muted)", fontSize: 13 }}>Вы не состоите в команде</div>}
          </div>
        </div>

        <div>
          <div className="card mb-4">
            <div className="card-title">СТАТИСТИКА</div>
            <div className="grid-2" style={{ gap: 12 }}>
              {[
                { label: "Часов на арене", value: currentUser.hours, icon: "⏱️" },
                { label: "Посещений", value: currentUser.visits, icon: "🏟️" },
                { label: "Всего броней", value: myBookings.length, icon: "📅" },
                { label: "Достижений", value: currentUser.badges.length, icon: "🎖️" },
              ].map(s => (
                <div key={s.label} style={{ background: "rgba(0,245,255,0.04)", border: "1px solid var(--border2)", borderRadius: 8, padding: "14px" }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontFamily: "Orbitron", fontSize: 20, color: "var(--cyan)" }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title">МОИ ДОСТИЖЕНИЯ</div>
            {currentUser.badges.length === 0 ? (
              <div style={{ color: "var(--muted)", fontSize: 13 }}>Пока нет достижений. Начните бронировать!</div>
            ) : currentUser.badges.map(bid => {
              const ach = data.achievements.find(a => a.id === bid);
              if (!ach) return null;
              return (
                <div key={bid} className="achievement-item">
                  <div className="ach-icon">{ach.icon}</div>
                  <div>
                    <div className="ach-name">{ach.name}</div>
                    <div className="ach-desc">{ach.desc}</div>
                    <span className={`badge badge-${ach.rarity === "legendary" ? "orange" : ach.rarity === "epic" ? "purple" : "cyan"}`} style={{ marginTop: 4 }}>{ach.rarity}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
