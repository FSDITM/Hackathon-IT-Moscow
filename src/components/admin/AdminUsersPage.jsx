export default function AdminUsersPage({ data }) {
  return (
    <div>
      <div className="section-title">Пользователи</div>
      <div className="section-sub">Все зарегистрированные студенты</div>
      <div className="card">
        <table>
          <thead>
            <tr><th>Игрок</th><th>Email</th><th>Уровень</th><th>Часов</th><th>Посещений</th><th>Монет</th><th>Достижений</th></tr>
          </thead>
          <tbody>
            {data.users.filter(u => u.role !== "admin").map(u => (
              <tr key={u.id}>
                <td>
                  <span style={{ fontSize: 18 }}>{u.avatar}</span>{" "}
                  <strong>{u.nick}</strong><br />
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>{u.name}</span>
                </td>
                <td style={{ color: "var(--muted)", fontSize: 12 }}>{u.email}</td>
                <td><span className="level-badge">⭐ {u.level}</span></td>
                <td>{u.hours}ч</td>
                <td>{u.visits}</td>
                <td>🪙 {u.coins}</td>
                <td>🎖️ {u.badges.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
