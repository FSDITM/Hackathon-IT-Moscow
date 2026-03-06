import { useState, useEffect } from "react";
import { getTodayStr, isClassHour, bookingOverlapsClass } from "../data.js";
import AIAssistant from "./AIAssistant.jsx";

export default function BookingPage({ data, updateData, currentUser, notify }) {
  const [selectedZone, setSelectedZone] = useState(null);
  const [date, setDate] = useState(getTodayStr());
  const [startHour, setStartHour] = useState(null);
  const [duration, setDuration] = useState(1);
  const [success, setSuccess] = useState(false);
  const [showAI, setShowAI] = useState(false);
  // активные игровые сессии: { bookingId → startTimestamp }
  const [activeSessions, setActiveSessions] = useState({});
  // таймеры отображения
  const [, setTick] = useState(0);

  // Обновляем таймеры каждую секунду
  useEffect(() => {
    if (Object.keys(activeSessions).length === 0) return;
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [activeSessions]);

  const schedule = data.settings?.classSchedule;
  const myBookings = data.bookings.filter(b => b.userId === currentUser.id && b.status === "active");

  const startPlaying = (bookingId) => {
    setActiveSessions(prev => ({ ...prev, [bookingId]: Date.now() }));
    notify("🎮 Игровая сессия началась! Время пошло...");
  };

  const stopPlaying = (bookingId) => {
    const startTime = activeSessions[bookingId];
    if (!startTime) return;
    const elapsedHours = (Date.now() - startTime) / 3600000; // миллисекунды → часы
    const roundedHours = Math.max(0.1, Math.round(elapsedHours * 10) / 10);
    updateData(prev => ({
      users: prev.users.map(u => u.id === currentUser.id
        ? { ...u, hours: Math.round((u.hours + roundedHours) * 10) / 10 }
        : u
      )
    }));
    setActiveSessions(prev => {
      const next = { ...prev };
      delete next[bookingId];
      return next;
    });
    notify(`⏱️ Сессия завершена! +${roundedHours}ч на счёт`);
  };

  const getElapsed = (bookingId) => {
    const start = activeSessions[bookingId];
    if (!start) return null;
    const sec = Math.floor((Date.now() - start) / 1000);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}ч ${m.toString().padStart(2,"0")}м ${s.toString().padStart(2,"0")}с`;
    return `${m.toString().padStart(2,"0")}м ${s.toString().padStart(2,"0")}с`;
  };

  const cancelBooking = (id) => {
    if (activeSessions[id]) stopPlaying(id);
    updateData(prev => ({ bookings: prev.bookings.map(b => b.id === id ? { ...b, status: "cancelled" } : b) }));
    notify("Бронирование отменено");
  };

  const isSlotBooked = (hour) =>
    data.bookings.some(b =>
      b.zoneId === selectedZone?.id && b.date === date && b.status === "active" &&
      hour >= b.startHour && hour < b.startHour + b.duration
    );

  const isSlotMine = (hour) =>
    data.bookings.some(b =>
      b.userId === currentUser.id && b.zoneId === selectedZone?.id && b.date === date && b.status === "active" &&
      hour >= b.startHour && hour < b.startHour + b.duration
    );

  const canBook = () => {
    if (!selectedZone || startHour === null) return false;
    if (bookingOverlapsClass(date, startHour, duration, data.settings)) return false;
    for (let h = startHour; h < startHour + duration; h++) {
      if (isSlotBooked(h)) return false;
    }
    return true;
  };

  // Why can't book — human-readable reason
  const bookingError = () => {
    if (!selectedZone || startHour === null) return null;
    if (bookingOverlapsClass(date, startHour, duration, data.settings)) {
      return `⚠️ Нельзя бронировать во время учебных пар (${schedule.startHour}:00 – ${schedule.endHour}:00 в будние дни). Выберите другое время.`;
    }
    for (let h = startHour; h < startHour + duration; h++) {
      if (isSlotBooked(h)) return "⚠️ Выбранное время уже занято другим пользователем. Выберите другой слот.";
    }
    return null;
  };

  const confirmBooking = () => {
    const hasOverlap = data.bookings.some(b =>
      b.userId === currentUser.id && b.date === date && b.status === "active" &&
      !(startHour >= b.startHour + b.duration || startHour + duration <= b.startHour)
    );
    if (hasOverlap) { notify("У вас уже есть бронь на это время!", "error"); return; }

    const newBooking = {
      id: Date.now(), userId: currentUser.id, zoneId: selectedZone.id,
      date, startHour, duration, status: "active",
      seat: Math.floor(Math.random() * selectedZone.seats) + 1
    };
    const newBadges = (u) => {
      const b = [...u.badges];
      if (!b.includes("first_book")) b.push("first_book");
      if (startHour >= 22 && !b.includes("night_owl")) b.push("night_owl");
      return b;
    };
    updateData(prev => ({
      bookings: [...prev.bookings, newBooking],
      users: prev.users.map(u => u.id === currentUser.id ? {
        ...u, visits: u.visits + 1,
        xp: Math.min(u.xp + duration * 50, u.xpMax),
        badges: newBadges(u)
      } : u),
      activityFeed: [{ id: Date.now(), type: "booking", userId: currentUser.id, zoneId: selectedZone.id, time: "только что", text: `забронировал зону ${selectedZone.name}` }, ...prev.activityFeed]
    }));
    setSuccess(true);
    notify("🎮 Бронирование подтверждено!");
    setTimeout(() => { setSuccess(false); setSelectedZone(null); setStartHour(null); setDuration(1); }, 3000);
  };

  if (success) return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
      <h2 style={{ fontFamily: "Orbitron", color: "var(--cyan)", marginBottom: 8 }}>Забронировано!</h2>
      <p style={{ color: "var(--muted)" }}>Ваше место ждёт вас. Удачной игры!</p>
    </div>
  );

  const error = bookingError();

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
        <div className="section-title" style={{ marginBottom: 0 }}>Бронирование зоны</div>
        <button onClick={() => setShowAI(true)} style={{
          position: "relative",
          padding: "10px 22px",
          borderRadius: 10,
          border: "none",
          cursor: "pointer",
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 800,
          fontSize: 15,
          letterSpacing: 1,
          color: "#000",
          background: "linear-gradient(135deg, var(--blue), var(--blue-light), var(--blue))",
          backgroundSize: "200% 200%",
          animation: "aiGradientShift 2.5s ease infinite, aiPulse 2s ease-in-out infinite",
          boxShadow: "0 0 25px rgba(65,105,255,0.6), 0 0 50px rgba(65,105,255,0.3)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          overflow: "visible",
        }}>
          <span style={{ fontSize: 18, animation: "aiSpin 3s linear infinite", display: "inline-block" }}>🤖</span>
          Спросить AI
          <span style={{
            position: "absolute", top: -6, right: -6,
            background: "#ef4444", color: "#fff",
            borderRadius: "50%", width: 18, height: 18,
            fontSize: 10, fontWeight: 900,
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "aiBadgePop 1s ease-in-out infinite",
            boxShadow: "0 0 8px rgba(239,68,68,0.8)",
          }}>✦</span>
        </button>
        <style>{`
          @keyframes aiGradientShift {
            0%   { background-position: 0% 50%; }
            50%  { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes aiPulse {
            0%, 100% { box-shadow: 0 0 20px rgba(65,105,255,0.6), 0 0 40px rgba(65,105,255,0.3); }
            50%       { box-shadow: 0 0 35px rgba(65,105,255,0.9), 0 0 70px rgba(65,105,255,0.5), 0 0 100px rgba(65,105,255,0.2); }
          }
          @keyframes aiSpin {
            0%   { transform: rotate(0deg) scale(1); }
            25%  { transform: rotate(-15deg) scale(1.2); }
            50%  { transform: rotate(0deg) scale(1); }
            75%  { transform: rotate(15deg) scale(1.2); }
            100% { transform: rotate(0deg) scale(1); }
          }
          @keyframes aiBadgePop {
            0%, 100% { transform: scale(1); }
            50%       { transform: scale(1.4); }
          }
        `}</style>
      </div>
      <div className="section-sub">Выберите зону, дату и время</div>

      {showAI && (
        <AIAssistant
          data={data}
          updateData={updateData}
          currentUser={currentUser}
          notify={notify}
          onClose={() => setShowAI(false)}
        />
      )}

      {/* Class schedule notice */}
      {schedule?.enabled && (
        <div className="alert alert-warning mb-4">
          🎓 <strong>Учебные пары:</strong> {schedule.label} — бронирование недоступно в это время.
          <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
            {[
              { cls: "cal-slot free", label: "Свободно" },
              { cls: "cal-slot class-time", label: "Время пар" },
              { cls: "cal-slot booked", label: "Занято" },
              { cls: "cal-slot mine", label: "Моё" },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div className={l.cls} style={{ width: 18, height: 18, borderRadius: 3, cursor: "default", fontSize: 0 }} />
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active bookings */}
      {myBookings.length > 0 && (
        <div className="card mb-6">
          <div className="card-title">МОИ АКТИВНЫЕ БРОНИ</div>
          {myBookings.map(b => {
            const zone = data.zones.find(z => z.id === b.zoneId);
            const isPlaying = !!activeSessions[b.id];
            const elapsed = getElapsed(b.id);
            return (
              <div key={b.id} className="booking-row" style={{ flexWrap: "wrap", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{zone?.icon} {zone?.name} — Место #{b.seat}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{b.date} · {b.startHour}:00 – {b.startHour + b.duration}:00 ({b.duration}ч)</div>
                  {isPlaying && (
                    <div style={{ fontSize: 12, color: "#10b981", fontWeight: 700, marginTop: 4, fontFamily: "monospace" }}>
                      🟢 Идёт игра: {elapsed}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {!isPlaying ? (
                    <button
                      className="btn btn-sm"
                      style={{ background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", border: "none", fontWeight: 700 }}
                      onClick={() => startPlaying(b.id)}
                    >▶ Начать игру</button>
                  ) : (
                    <button
                      className="btn btn-sm"
                      style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", border: "none", fontWeight: 700 }}
                      onClick={() => stopPlaying(b.id)}
                    >⏹ Завершить</button>
                  )}
                  <button className="btn btn-danger btn-sm" onClick={() => cancelBooking(b.id)}>Отменить</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Step 1: Zone */}
      <div className="card mb-4">
        <div className="card-title">ШАГ 1 — ВЫБЕРИТЕ ЗОНУ</div>
        <div className="grid-3">
          {data.zones.filter(z => z.available).map(zone => (
            <div key={zone.id} className={`zone-card ${selectedZone?.id === zone.id ? "selected" : ""}`}
              onClick={() => { setSelectedZone(zone); setStartHour(null); }}>
              <div style={{ color: zone.color, fontSize: 32 }}>{zone.icon}</div>
              <div className="zone-name">{zone.name}</div>
              <div className="zone-desc">{zone.description}</div>
              <div className="zone-seats" style={{ color: zone.color }}>{zone.seats} мест</div>
            </div>
          ))}
          {data.zones.filter(z => !z.available).map(zone => (
            <div key={zone.id} className="zone-card" style={{ opacity: 0.4, cursor: "not-allowed" }}>
              <div style={{ fontSize: 32 }}>{zone.icon}</div>
              <div className="zone-name">{zone.name}</div>
              <span className="badge badge-red" style={{ marginTop: 8 }}>🔒 Закрыта</span>
            </div>
          ))}
        </div>
      </div>

      {selectedZone && (
        <div className="card mb-4">
          <div className="card-title">ШАГ 2 — ДАТА И ВРЕМЯ</div>
          <div className="flex items-center gap-2 mb-4" style={{ gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label className="label">Дата</label>
              <input type="date" className="input" value={date} min={getTodayStr()} onChange={e => { setDate(e.target.value); setStartHour(null); }} />
            </div>
            <div style={{ width: 140 }}>
              <label className="label">Длительность</label>
              <select className="input" value={duration} onChange={e => setDuration(+e.target.value)}>
                {[1,2,3,4].map(h => <option key={h} value={h}>{h} ч.</option>)}
              </select>
            </div>
          </div>
          <label className="label">Выберите время начала</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginTop: 6 }}>
            {Array.from({ length: 16 }, (_, i) => i + 8).map(hour => {
              const booked = isSlotBooked(hour);
              const mine = isSlotMine(hour);
              const classTime = isClassHour(date, hour, data.settings);
              const sel = startHour === hour;
              let cls = "cal-slot free";
              if (mine) cls = "cal-slot mine";
              else if (booked) cls = "cal-slot booked";
              else if (classTime) cls = "cal-slot class-time";
              else if (sel) cls = "cal-slot selected";
              const disabled = booked || mine || classTime;
              return (
                <div key={hour} className={cls} onClick={() => !disabled && setStartHour(hour)}
                  style={{ height: 46, fontSize: 12, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer" }}
                  title={classTime ? `Учебные пары (${hour}:00–${hour+1}:00)` : booked ? "Занято" : mine ? "Ваше бронирование" : `Выбрать ${hour}:00`}>
                  {hour}:00
                  {classTime && <span style={{ fontSize: 8, display: "block", color: "#f59e0b" }}>пары</span>}
                  {booked && !mine && <span style={{ fontSize: 8, display: "block" }}>занято</span>}
                  {mine && <span style={{ fontSize: 8, display: "block" }}>моё</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedZone && startHour !== null && (
        <div className="card">
          <div className="card-title">ШАГ 3 — ПОДТВЕРЖДЕНИЕ</div>
          <div style={{ marginBottom: 16 }}>
            <div className="booking-row"><span className="text-muted">Зона</span><strong>{selectedZone.icon} {selectedZone.name}</strong></div>
            <div className="booking-row"><span className="text-muted">Дата</span><strong>{date}</strong></div>
            <div className="booking-row"><span className="text-muted">Время</span><strong>{startHour}:00 – {startHour + duration}:00</strong></div>
            <div className="booking-row"><span className="text-muted">Длительность</span><strong>{duration} ч.</strong></div>
            <div className="booking-row"><span className="text-muted">Стоимость</span><strong style={{ color: "var(--cyan)" }}>Бесплатно 🎉</strong></div>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <button className="btn btn-primary btn-full" onClick={confirmBooking} disabled={!canBook()}>
            ✅ Подтвердить бронирование
          </button>
        </div>
      )}
    </div>
  );
}
