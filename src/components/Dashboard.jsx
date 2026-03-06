import { useState } from "react";
import AIAssistant from "./AIAssistant.jsx";

export default function UserDashboard({ data, currentUser, setPage, updateData, notify }) {
  const [showAI, setShowAI] = useState(false);
  const myBookings = data.bookings.filter(b => b.userId === currentUser.id && b.status === "active");
  const myTeam = data.teams.find(t => t.id === currentUser.teamId);
  const openTournaments = data.tournaments.filter(t => t.status === "open");

  return (
    <div>
      <div className="card mb-6" style={{ background: "linear-gradient(135deg, rgba(65,105,255,0.08) 0%, rgba(65,105,255,0.05) 100%)", borderColor: "rgba(65,105,255,0.2)" }}>
        <div className="flex items-center justify-between">
          <div>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{currentUser.avatar}</div>
            <h2 style={{ fontFamily: "'Orbitron'", fontSize: 20, color: "var(--text)", marginBottom: 4 }}>Привет, {currentUser.nick}!</h2>
            <div className="flex items-center gap-2 flex-wrap" style={{ gap: 8 }}>
              <span className="level-badge">⭐ Ур. {currentUser.level}</span>
              <span className="badge badge-cyan">🪙 {currentUser.coins} монет</span>
              <span className="badge badge-purple">🎖️ {currentUser.badges.length} достижений</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>Прогресс до ур. {currentUser.level + 1}</div>
            <div style={{ width: 200 }}>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${(currentUser.xp / currentUser.xpMax) * 100}%` }} /></div>
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{currentUser.xp} / {currentUser.xpMax} XP</div>
          </div>
        </div>
      </div>

      <div className="grid-4 mb-6">
        {[
          { icon: "📅", label: "Активных броней", value: myBookings.length, color: "var(--blue-light)" },
          { icon: "⏱️", label: "Часов на арене", value: currentUser.hours, color: "#ff6b35" },
          { icon: "🏟️", label: "Посещений", value: currentUser.visits, color: "var(--blue)" },
          { icon: "🏆", label: "Турниров", value: openTournaments.length + " открыто", color: "#10b981" },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{ color: s.color, fontSize: 22 }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="card-title">МОИ БРОНИ</div>
            <button className="btn btn-secondary btn-sm" onClick={() => setPage("booking")}>+ Новая</button>
          </div>
          {myBookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "var(--muted)" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
              <div>Нет активных броней</div>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setPage("booking")}>Забронировать</button>
            </div>
          ) : myBookings.map(b => {
            const zone = data.zones.find(z => z.id === b.zoneId);
            return (
              <div key={b.id} className="booking-row">
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{zone?.icon} {zone?.name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{b.date} · {b.startHour}:00 – {b.startHour + b.duration}:00</div>
                </div>
                <span className="badge badge-green">Место {b.seat}</span>
              </div>
            );
          })}
        </div>

        <div>
          <div className="card mb-4">
            <div className="card-title">БЫСТРЫЕ ДЕЙСТВИЯ</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

              {/* ── AI HERO BUTTON ── */}
              <div style={{ position: "relative", marginBottom: 4 }}>
                {/* Scan line sweep */}
                <div style={{
                  position: "absolute", inset: 0, borderRadius: 12, overflow: "hidden", pointerEvents: "none", zIndex: 0,
                }}>
                  <div style={{
                    position: "absolute", top: 0, left: "-100%", width: "60%", height: "100%",
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
                    animation: "aiScan 2.2s ease-in-out infinite",
                  }} />
                </div>

                <button onClick={() => setShowAI(true)} style={{
                  position: "relative", zIndex: 1,
                  width: "100%", padding: "14px 20px",
                  borderRadius: 12, border: "2px solid transparent",
                  background: "linear-gradient(#0a1520, #0a1520) padding-box, linear-gradient(135deg, var(--blue), var(--blue-light), var(--blue)) border-box",
                  backgroundSize: "100% 100%, 200% 200%",
                  cursor: "pointer",
                  fontFamily: "'Rajdhani', sans-serif",
                  animation: "aiBorderShift 3s linear infinite",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  boxShadow: "0 0 30px rgba(65,105,255,0.35), 0 0 60px rgba(65,105,255,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Animated robot icon */}
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%",
                      background: "linear-gradient(135deg, rgba(65,105,255,0.3), rgba(65,105,255,0.2))",
                      border: "1px solid rgba(65,105,255,0.5)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 22,
                      animation: "aiRobotBob 2s ease-in-out infinite",
                      boxShadow: "0 0 15px rgba(65,105,255,0.4)",
                    }}>🤖</div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{
                        fontSize: 15, fontWeight: 800, letterSpacing: 0.5,
                        background: "linear-gradient(135deg, var(--blue), var(--blue-light))",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}>AI-ассистент бронирования</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>
                        Просто напиши когда хочешь играть ✦
                      </div>
                    </div>
                  </div>

                  {/* Arrow + NEW badge */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <span style={{
                      background: "linear-gradient(135deg, var(--blue), var(--blue-light))",
                      color: "#000", fontSize: 9, fontWeight: 900,
                      padding: "2px 7px", borderRadius: 20, letterSpacing: 1,
                      animation: "aiBadgePop 1.5s ease-in-out infinite",
                    }}>NEW</span>
                    <span style={{ fontSize: 18, color: "var(--blue-light)", animation: "aiArrow 1s ease-in-out infinite" }}>›</span>
                  </div>
                </button>
              </div>

              <button className="btn btn-secondary btn-full" onClick={() => setPage("booking")}>📅 Забронировать вручную</button>
              <button className="btn btn-purple btn-full" onClick={() => setPage("tournaments")}>🏆 Турниры ({openTournaments.length} открытых)</button>
              <button className="btn btn-orange btn-full" onClick={() => setPage("teams")}>👥 {myTeam ? `Моя команда: ${myTeam.name}` : "Найти команду"}</button>
              <button className="btn btn-secondary btn-full" onClick={() => setPage("calendar")}>🗓️ Расписание арены</button>
            </div>
          </div>
          <style>{`
            @keyframes aiBorderShift {
              0%   { background-size: 100% 100%, 0% 200%;   }
              50%  { background-size: 100% 100%, 200% 200%; }
              100% { background-size: 100% 100%, 400% 200%; }
            }
            @keyframes aiScan {
              0%   { left: -60%; }
              100% { left: 160%; }
            }
            @keyframes aiRobotBob {
              0%, 100% { transform: translateY(0) rotate(-5deg); }
              50%       { transform: translateY(-3px) rotate(5deg); }
            }
            @keyframes aiBadgePop {
              0%, 100% { opacity: 1; transform: scale(1); }
              50%       { opacity: 0.8; transform: scale(1.1); }
            }
            @keyframes aiArrow {
              0%, 100% { transform: translateX(0); opacity: 1; }
              50%       { transform: translateX(4px); opacity: 0.6; }
            }
          `}</style>
          {showAI && (
            <AIAssistant
              data={data}
              updateData={updateData}
              currentUser={currentUser}
              notify={notify}
              onClose={() => setShowAI(false)}
            />
          )}
          <div className="card">
            <div className="card-title">ЛЕНТА АКТИВНОСТИ</div>
            {data.activityFeed.slice(0, 3).map(item => (
              <div key={item.id} className="feed-item">
                <div className="feed-icon" style={{ background: "rgba(65,105,255,0.1)" }}>
                  {item.type === "booking" ? "📅" : item.type === "achievement" ? "🎖️" : item.type === "tournament" ? "🏆" : "👥"}
                </div>
                <div>
                  <div className="feed-text">
                    <strong>{data.users.find(u => u.id === item.userId)?.nick || "Система"}</strong> {item.text}
                  </div>
                  <div className="feed-time">{item.time}</div>
                </div>
              </div>
            ))}
            <button className="btn btn-secondary btn-sm btn-full" style={{ marginTop: 8 }} onClick={() => setPage("activity")}>Смотреть всё</button>
          </div>
        </div>
      </div>
    </div>
  );
}
