export default function TournamentsPage({ data, updateData, currentUser, notify }) {
  const myTeam = data.teams.find(t => t.id === currentUser.teamId);

  const register = (tournament) => {
    if (!myTeam) { notify("Вступите в команду для участия в турнире", "error"); return; }
    if (tournament.teams.includes(myTeam.id)) { notify("Ваша команда уже зарегистрирована", "error"); return; }
    if (tournament.teams.length >= tournament.maxTeams) { notify("Мест нет, турнир заполнен", "error"); return; }
    updateData(prev => ({
      tournaments: prev.tournaments.map(t => t.id === tournament.id ? { ...t, teams: [...t.teams, myTeam.id] } : t),
      activityFeed: [{ id: Date.now(), type: "tournament", tournamentId: tournament.id, time: "только что", text: `команда ${myTeam.name} зарегистрировалась на ${tournament.name}` }, ...prev.activityFeed]
    }));
    notify(`🏆 Команда ${myTeam.name} зарегистрирована на ${tournament.name}!`);
  };

  const statusBadge = (status) => {
    if (status === "open") return <span className="badge badge-green">Регистрация открыта</span>;
    if (status === "ongoing") return <span className="badge badge-orange">Идёт</span>;
    return <span className="badge badge-purple">Завершён</span>;
  };

  return (
    <div>
      <div className="section-title">Турниры и соревнования</div>
      <div className="section-sub">Участвуйте в турнирах и выигрывайте призы</div>

      {!myTeam && (
        <div className="alert alert-info mb-4">💡 Для участия в турнирах нужна команда. Перейдите в раздел «Команды»</div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {data.tournaments.map(t => {
          const isRegistered = myTeam && t.teams.includes(myTeam.id);
          return (
            <div key={t.id} className="tournament-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2" style={{ gap: 12 }}>
                  <div style={{ fontSize: 32 }}>{t.icon}</div>
                  <div>
                    <div style={{ fontFamily: "Orbitron", fontSize: 15, color: "var(--text)" }}>{t.name}</div>
                    <div style={{ color: "var(--muted)", fontSize: 12 }}>{t.game} · {t.date}</div>
                  </div>
                </div>
                {statusBadge(t.status)}
              </div>
              <div className="flex items-center gap-2" style={{ gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>🏆 Приз: <strong style={{ color: "#fbbf24" }}>{t.prize}</strong></span>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>👥 Команд: <strong>{t.teams.length}/{t.maxTeams}</strong></span>
                {t.winner && <span style={{ fontSize: 13 }}>🥇 Победитель: <strong style={{ color: "#fbbf24" }}>{t.winner}</strong></span>}
              </div>
              <div style={{ marginBottom: 12 }}>
                <div className="progress-bar" style={{ height: 4 }}>
                  <div className="progress-fill" style={{ width: `${t.teams.length / t.maxTeams * 100}%`, background: t.status === "open" ? "linear-gradient(90deg, var(--cyan), #0088ff)" : "var(--muted)" }} />
                </div>
              </div>
              {t.status === "open" && (
                isRegistered ? (
                  <span className="badge badge-green">✅ Ваша команда зарегистрирована</span>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={() => register(t)} disabled={t.teams.length >= t.maxTeams}>
                    {t.teams.length >= t.maxTeams ? "Мест нет" : "Зарегистрироваться"}
                  </button>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
