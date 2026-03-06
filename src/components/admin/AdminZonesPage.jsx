import { useState } from "react";

const DAY_NAMES = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

export default function AdminZonesPage({ data, updateData, notify }) {
  const schedule = data.settings?.classSchedule || {};
  const [schedEnabled, setSchedEnabled] = useState(schedule.enabled ?? true);
  const [schedStart, setSchedStart] = useState(schedule.startHour ?? 9);
  const [schedEnd, setSchedEnd] = useState(schedule.endHour ?? 17);
  const [schedDays, setSchedDays] = useState(schedule.weekdays ?? [1,2,3,4,5]);

  const toggleZone = (id) => {
    updateData(prev => ({ zones: prev.zones.map(z => z.id === id ? { ...z, available: !z.available } : z) }));
    notify("Статус зоны обновлён");
  };

  const saveSchedule = () => {
    if (schedStart >= schedEnd) { notify("Время начала должно быть раньше конца", "error"); return; }
    const label = `${schedEnabled ? "Учебные пары" : "Отключено"} (${DAY_NAMES.filter((_,i) => schedDays.includes(i)).join(", ")}, ${schedStart}:00–${schedEnd}:00)`;
    updateData(prev => ({
      settings: { ...prev.settings, classSchedule: { enabled: schedEnabled, weekdays: schedDays, startHour: schedStart, endHour: schedEnd, label } }
    }));
    notify("Расписание пар обновлено!");
  };

  const toggleDay = (day) => {
    setSchedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort());
  };

  return (
    <div>
      <div className="section-title">Управление зонами</div>
      <div className="section-sub">Настройка зон и расписания учебных пар</div>

      {/* Zones */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
        {data.zones.map(zone => (
          <div key={zone.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2" style={{ gap: 14 }}>
                <div style={{ fontSize: 36, color: zone.color }}>{zone.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{zone.name}</div>
                  <div style={{ color: "var(--muted)", fontSize: 12 }}>{zone.description}</div>
                  <div style={{ marginTop: 6 }}>
                    <span className="badge badge-cyan">{zone.seats} мест</span>{" "}
                    {zone.available ? <span className="badge badge-green">Открыта</span> : <span className="badge badge-red">Закрыта</span>}
                  </div>
                </div>
              </div>
              <button className={`btn btn-sm ${zone.available ? "btn-danger" : "btn-secondary"}`} onClick={() => toggleZone(zone.id)}>
                {zone.available ? "Закрыть" : "Открыть"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Class schedule settings */}
      <div className="card" style={{ borderColor: "rgba(245,158,11,0.3)" }}>
        <div className="card-title" style={{ color: "#f59e0b" }}>⏰ РАСПИСАНИЕ УЧЕБНЫХ ПАР</div>
        <div style={{ marginBottom: 16, fontSize: 13, color: "var(--muted)" }}>
          Во время учебных пар бронирование зон недоступно для студентов.
        </div>

        <div className="form-group">
          <label className="label">Статус ограничения</label>
          <div className="flex gap-2" style={{ gap: 12 }}>
            <button className={`btn btn-sm ${schedEnabled ? "btn-primary" : "btn-secondary"}`} onClick={() => setSchedEnabled(true)}>🔒 Включено</button>
            <button className={`btn btn-sm ${!schedEnabled ? "btn-danger" : "btn-secondary"}`} onClick={() => setSchedEnabled(false)}>🔓 Отключено</button>
          </div>
        </div>

        <div className="form-group">
          <label className="label">Учебные дни</label>
          <div className="flex flex-wrap" style={{ gap: 8 }}>
            {[1,2,3,4,5,6,0].map(day => (
              <button key={day} className={`btn btn-sm ${schedDays.includes(day) ? "btn-orange" : "btn-secondary"}`}
                onClick={() => toggleDay(day)} style={{ minWidth: 48 }}>
                {DAY_NAMES[day]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid-2" style={{ gap: 16, marginBottom: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label">Начало пар</label>
            <select className="input" value={schedStart} onChange={e => setSchedStart(+e.target.value)}>
              {Array.from({length: 14}, (_, i) => i + 7).map(h => <option key={h} value={h}>{h}:00</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label">Конец пар</label>
            <select className="input" value={schedEnd} onChange={e => setSchedEnd(+e.target.value)}>
              {Array.from({length: 14}, (_, i) => i + 8).map(h => <option key={h} value={h}>{h}:00</option>)}
            </select>
          </div>
        </div>

        <button className="btn btn-primary" onClick={saveSchedule}>💾 Сохранить расписание</button>
      </div>
    </div>
  );
}
