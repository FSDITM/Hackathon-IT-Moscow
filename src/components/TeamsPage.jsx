import { useState } from "react";

export default function TeamsPage({ data, updateData, currentUser, notify }) {
  const [showCreate, setShowCreate] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamTag, setTeamTag] = useState("");
  const [teamDesc, setTeamDesc] = useState("");
  const myTeam = data.teams.find(t => t.id === currentUser.teamId);

  const createTeam = () => {
    if (!teamName || !teamTag) { notify("Заполните название и тег", "error"); return; }
    if (teamTag.length < 2 || teamTag.length > 5) { notify("Тег должен быть 2–5 символов", "error"); return; }
    const newTeam = { id: Date.now(), name: teamName, tag: teamTag.toUpperCase(), captainId: currentUser.id, members: [currentUser.id], wins: 0, losses: 0, icon: "⚔️", description: teamDesc || "Новая команда" };
    updateData(prev => ({
      teams: [...prev.teams, newTeam],
      users: prev.users.map(u => u.id === currentUser.id ? { ...u, teamId: newTeam.id, badges: !u.badges.includes("team_player") ? [...u.badges, "team_player"] : u.badges } : u),
      activityFeed: [{ id: Date.now(), type: "team", teamId: newTeam.id, time: "только что", text: `создана новая команда ${teamName}` }, ...prev.activityFeed]
    }));
    notify("🎉 Команда создана!");
    setShowCreate(false); setTeamName(""); setTeamTag(""); setTeamDesc("");
  };

  const joinTeam = (team) => {
    if (myTeam) { notify("Сначала покиньте текущую команду", "error"); return; }
    updateData(prev => ({
      teams: prev.teams.map(t => t.id === team.id ? { ...t, members: [...t.members, currentUser.id] } : t),
      users: prev.users.map(u => u.id === currentUser.id ? { ...u, teamId: team.id, badges: !u.badges.includes("team_player") ? [...u.badges, "team_player"] : u.badges } : u)
    }));
    notify(`Вы вступили в команду ${team.name}!`);
  };

  const leaveTeam = () => {
    if (!myTeam) return;
    updateData(prev => ({
      teams: prev.teams.map(t => t.id === myTeam.id ? { ...t, members: t.members.filter(m => m !== currentUser.id) } : t).filter(t => t.members.length > 0),
      users: prev.users.map(u => u.id === currentUser.id ? { ...u, teamId: null } : u)
    }));
    notify("Вы покинули команду");
  };

  return (
    <div>
      <div className="section-title">Команды</div>
      <div className="section-sub">Найдите команду или создайте свою</div>

      {myTeam && (
        <div className="card mb-6" style={{ borderColor: "rgba(0,245,255,0.3)", background: "rgba(0,245,255,0.04)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="card-title">МОЯ КОМАНДА</div>
            <button className="btn btn-danger btn-sm" onClick={leaveTeam}>Покинуть</button>
          </div>
          <div className="flex items-center gap-2" style={{ gap: 16 }}>
            <div style={{ fontSize: 40 }}>{myTeam.icon}</div>
            <div>
              <div style={{ fontFamily: "Orbitron", fontSize: 18 }}>{myTeam.name} <span style={{ color: "var(--muted)", fontSize: 13 }}>[{myTeam.tag}]</span></div>
              <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 8 }}>{myTeam.description}</div>
              <div className="flex gap-2" style={{ gap: 12 }}>
                <span className="badge badge-green">✅ {myTeam.wins} побед</span>
                <span className="badge badge-red">❌ {myTeam.losses} поражений</span>
                <span className="badge badge-cyan">👥 {myTeam.members.length} игроков</span>
                {myTeam.captainId === currentUser.id && <span className="badge badge-orange">👑 Капитан</span>}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>СОСТАВ:</div>
            <div className="flex flex-wrap" style={{ gap: 8 }}>
              {myTeam.members.map(mid => {
                const member = data.users.find(u => u.id === mid);
                if (!member) return null;
                return (
                  <div key={mid} className="flex items-center gap-2" style={{ gap: 8, background: "rgba(0,245,255,0.06)", border: "1px solid var(--border2)", borderRadius: 8, padding: "6px 12px" }}>
                    <span>{member.avatar}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{member.nick}</span>
                    {mid === myTeam.captainId && <span style={{ fontSize: 14 }}>👑</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div style={{ fontFamily: "Orbitron", fontSize: 15 }}>Все команды</div>
        {!myTeam && <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>+ Создать команду</button>}
      </div>

      {showCreate && !myTeam && (
        <div className="card mb-4">
          <div className="card-title">НОВАЯ КОМАНДА</div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group"><label className="label">Название</label><input className="input" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="Team Alpha" /></div>
            <div className="form-group"><label className="label">Тег (2–5 букв)</label><input className="input" value={teamTag} onChange={e => setTeamTag(e.target.value)} maxLength={5} placeholder="ALPHA" /></div>
          </div>
          <div className="form-group"><label className="label">Описание</label><input className="input" value={teamDesc} onChange={e => setTeamDesc(e.target.value)} placeholder="Расскажите о команде..." /></div>
          <button className="btn btn-primary" onClick={createTeam}>Создать</button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {data.teams.map(team => {
          const isMember = team.members.includes(currentUser.id);
          return (
            <div key={team.id} className="team-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2" style={{ gap: 14 }}>
                  <div style={{ fontSize: 32 }}>{team.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{team.name} <span style={{ color: "var(--muted)", fontSize: 12 }}>[{team.tag}]</span></div>
                    <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 4 }}>{team.description}</div>
                    <div className="flex gap-2" style={{ gap: 8 }}>
                      <span className="badge badge-green">✅ {team.wins}W</span>
                      <span className="badge badge-red">❌ {team.losses}L</span>
                      <span className="badge badge-cyan">👥 {team.members.length} чел.</span>
                    </div>
                  </div>
                </div>
                {!isMember && !myTeam && (
                  <button className="btn btn-secondary btn-sm" onClick={() => joinTeam(team)}>Вступить</button>
                )}
                {isMember && <span className="badge badge-green">Вы в команде</span>}
              </div>
            </div>
          );
        })}
        {data.teams.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px", color: "var(--muted)" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>👥</div>
            <div>Пока нет команд. Создайте первую!</div>
          </div>
        )}
      </div>
    </div>
  );
}
