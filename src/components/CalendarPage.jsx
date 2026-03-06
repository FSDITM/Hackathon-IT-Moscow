import { useState } from "react";
import { getTodayStr, isClassHour } from "../data.js";
import { exportScheduleToPDF } from "./PDFExport.jsx";

export default function CalendarPage({ data, currentUser }) {
  const [date, setDate] = useState(getTodayStr());
  const [filterZone, setFilterZone] = useState("all");

  const zones = filterZone === "all" ? data.zones : data.zones.filter(z => z.id === +filterZone);
  const hours = Array.from({ length: 16 }, (_, i) => i + 8);

  const getBookingsForSlot = (zoneId, hour) =>
    data.bookings.filter(b => b.zoneId === zoneId && b.date === date && b.status === "active" && hour >= b.startHour && hour < b.startHour + b.duration);

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
        <div className="section-title" style={{ marginBottom: 0 }}>Расписание арены</div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => exportScheduleToPDF({ data, currentUser, date })}
          style={{ gap: 6 }}
        >
          📄 Экспорт PDF
        </button>
      </div>
      <div className="section-sub">Занятость зон в реальном времени</div>

      <div className="card mb-4">
        <div className="flex items-center gap-2" style={{ gap: 16, flexWrap: "wrap" }}>
          <div>
            <label className="label">Дата</label>
            <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} style={{ width: 180 }} />
          </div>
          <div>
            <label className="label">Зона</label>
            <select className="input" value={filterZone} onChange={e => setFilterZone(e.target.value)} style={{ width: 200 }}>
              <option value="all">Все зоны</option>
              {data.zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
          {[
            { color: "rgba(0,245,255,0.1)", border: "rgba(0,245,255,0.2)", label: "Свободно" },
            { color: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)", label: "Учебные пары" },
            { color: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.3)", label: "Занято" },
            { color: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.4)", label: "Моё" },
          ].map(l => (
            <div key={l.label} className="flex items-center" style={{ gap: 6 }}>
              <div style={{ width: 18, height: 18, background: l.color, border: `1px solid ${l.border}`, borderRadius: 3 }} />
              <span style={{ fontSize: 12, color: "var(--muted)" }}>{l.label}</span>
            </div>
          ))}
        </div>
        <div style={{ overflowX: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: `140px repeat(${hours.length}, 1fr)`, gap: 3, minWidth: 900 }}>
            <div />
            {hours.map(h => <div key={h} className="cal-header">{h}:00</div>)}
            {zones.map(zone => (
              <>
                <div key={`z${zone.id}`} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: zone.color }}>
                  {zone.icon} {zone.name}
                </div>
                {hours.map(hour => {
                  const bookings = getBookingsForSlot(zone.id, hour);
                  const isMine = bookings.some(b => b.userId === currentUser.id);
                  const isBooked = bookings.length > 0;
                  const classTime = isClassHour(date, hour, data.settings);
                  let cls = "cal-slot free";
                  if (isMine) cls = "cal-slot mine";
                  else if (isBooked) cls = "cal-slot booked";
                  else if (classTime) cls = "cal-slot class-time";
                  return (
                    <div key={`${zone.id}-${hour}`} className={cls}
                      title={classTime ? "Учебные пары" : isBooked ? (isMine ? "Ваше бронирование" : `Занято: ${bookings.length} чел.`) : "Свободно"}>
                      {isBooked && !isMine && <span style={{ fontSize: 9 }}>{bookings.length}</span>}
                      {isMine && "✓"}
                      {classTime && !isBooked && <span style={{ fontSize: 9, color: "#f59e0b" }}>📚</span>}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
