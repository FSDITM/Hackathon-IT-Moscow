// ── PDF-экспорт через window.print() ─────────────────────
// Открывает отдельное окно с расписанием в стиле ИТ.МОСКВА и вызывает печать.
// Не требует библиотек — работает в любом браузере.

export function exportScheduleToPDF({ data, currentUser, date }) {
  const zones  = data.zones.filter(z => z.available);
  const myBookings = data.bookings.filter(b =>
    b.userId === currentUser.id && b.status === "active"
  );
  const allBookings = data.bookings.filter(b => b.status === "active");

  // Даты: текущая неделя
  const weekDates = [];
  const start = new Date(date + "T12:00:00");
  const dow = start.getDay();
  const monday = new Date(start);
  monday.setDate(start.getDate() - (dow === 0 ? 6 : dow - 1));
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates.push(d.toISOString().slice(0, 10));
  }

  const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const hours = Array.from({ length: 16 }, (_, i) => i + 8); // 8:00 – 23:00

  const rows = hours.map(hour => {
    const cells = weekDates.map(d => {
      const myB = myBookings.find(b =>
        b.date === d && hour >= b.startHour && hour < b.startHour + b.duration
      );
      const othB = allBookings.find(b =>
        !myBookings.includes(b) && b.date === d &&
        hour >= b.startHour && hour < b.startHour + b.duration
      );
      if (myB) {
        const zone = zones.find(z => z.id === myB.zoneId);
        return `<td style="background:#4169FF22;border:1px solid #4169FF55;padding:3px 5px;font-size:9px;color:#4169FF;font-weight:600">${zone?.name || "Зона"}</td>`;
      }
      if (othB) {
        return `<td style="background:#EF444418;border:1px solid #EF444440;padding:3px 5px;font-size:9px;color:#EF4444">Занято</td>`;
      }
      return `<td style="border:1px solid #2a2e38;padding:3px 5px"></td>`;
    }).join("");

    return `<tr>
      <td style="border:1px solid #2a2e38;padding:3px 8px;font-size:10px;color:#8A94AA;white-space:nowrap;font-weight:500">${hour}:00</td>
      ${cells}
    </tr>`;
  }).join("");

  const headerCells = weekDates.map((d, i) => {
    const dd = new Date(d + "T12:00:00");
    return `<th style="border:1px solid #2a2e38;padding:6px 5px;font-size:10px;color:#8A94AA;text-align:center;background:#13161E;font-weight:600;letter-spacing:0.5px">
      ${dayNames[i]}<br><span style="color:#F0F2F7;font-size:11px;font-weight:700">${dd.getDate()}.${String(dd.getMonth()+1).padStart(2,"0")}</span>
    </th>`;
  }).join("");

  const myBookingsRows = myBookings.map(b => {
    const zone = zones.find(z => z.id === b.zoneId);
    const d = new Date(b.date + "T12:00:00");
    return `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #1e2230;font-size:12px">${zone?.icon || "📍"} ${zone?.name || "Зона"}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #1e2230;font-size:12px">${d.toLocaleDateString("ru-RU",{weekday:"long",day:"numeric",month:"long"})}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #1e2230;font-size:12px">${b.startHour}:00 – ${b.startHour+b.duration}:00</td>
      <td style="padding:8px 12px;border-bottom:1px solid #1e2230;font-size:12px">${b.duration} ч.</td>
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Расписание — ${currentUser.nick} — Кибер-Арена ИТ.МОСКВА</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; background: #0D0F14; color: #F0F2F7; padding: 32px; }
    @media print {
      body { background: white; color: black; padding: 16px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #4169FF">
    <div style="background:#4169FF;border-radius:8px;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-weight:900;font-style:italic;font-size:18px;color:white">М</div>
    <div>
      <div style="font-size:20px;font-weight:800"><em style="color:#4169FF">ИТ.</em>МОСКВА — Кибер-Арена</div>
      <div style="font-size:12px;color:#8A94AA;margin-top:2px">Расписание бронирований · ${currentUser.nick} · ${new Date().toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"})}</div>
    </div>
    <button class="no-print" onclick="window.print()" style="margin-left:auto;background:#4169FF;color:white;border:none;border-radius:8px;padding:10px 20px;font-size:14px;font-weight:600;cursor:pointer">🖨️ Печать / PDF</button>
  </div>

  <h2 style="font-size:14px;color:#8A94AA;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px">Сетка недели</h2>
  <div style="overflow-x:auto;margin-bottom:32px">
    <table style="border-collapse:collapse;width:100%;min-width:600px">
      <thead>
        <tr>
          <th style="border:1px solid #2a2e38;padding:6px 8px;font-size:10px;color:#8A94AA;background:#13161E;text-align:left">Час</th>
          ${headerCells}
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>

  ${myBookings.length > 0 ? `
  <h2 style="font-size:14px;color:#8A94AA;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px">Мои бронирования (${myBookings.length})</h2>
  <table style="border-collapse:collapse;width:100%;background:#13161E;border-radius:10px;overflow:hidden;border:1px solid #1e2230">
    <thead>
      <tr style="border-bottom:1px solid #1e2230">
        <th style="padding:10px 12px;text-align:left;font-size:11px;color:#8A94AA;text-transform:uppercase;letter-spacing:1px">Зона</th>
        <th style="padding:10px 12px;text-align:left;font-size:11px;color:#8A94AA;text-transform:uppercase;letter-spacing:1px">Дата</th>
        <th style="padding:10px 12px;text-align:left;font-size:11px;color:#8A94AA;text-transform:uppercase;letter-spacing:1px">Время</th>
        <th style="padding:10px 12px;text-align:left;font-size:11px;color:#8A94AA;text-transform:uppercase;letter-spacing:1px">Длительность</th>
      </tr>
    </thead>
    <tbody>${myBookingsRows}</tbody>
  </table>` : `<div style="text-align:center;color:#8A94AA;padding:32px">Нет активных бронирований</div>`}

  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #1e2230;font-size:11px;color:#4A5268;text-align:center">
    Кибер-Арена · ГБПОУ г. Москвы «ИТ.МОСКВА» · Сформировано ${new Date().toLocaleString("ru-RU")}
  </div>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }
}
