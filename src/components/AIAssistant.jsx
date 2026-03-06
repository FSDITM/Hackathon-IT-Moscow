import { useState, useRef, useEffect } from "react";
import { getTodayStr, isClassHour, bookingOverlapsClass } from "../data.js";

// ── Системный промпт ──────────────────────────────────────────────
const SYSTEM_PROMPT = `Ты — умный помощник кибер-арены колледжа IT.МОСКВА. 
Твоя задача — помогать студентам бронировать игровые зоны.

Доступные зоны:
1. "Игровая зона" (id=1) — ПК с топовыми видеокартами, мониторы 144Hz, 20 мест
2. "Тренировочная зона" (id=2) — профессиональные тренировки, аналитика, 10 мест
3. "Командная зона" (id=3) — закрытая зона для команд, 6 мест

Правила:
- Рабочие часы арены: 8:00 – 24:00
- Нельзя бронировать во время учебных пар (Пн-Пт 9:00-17:00)
- Максимум 4 часа за раз
- Сегодняшняя дата будет передана в контексте

Когда пользователь описывает желание поиграть — предложи конкретный вариант бронирования.

ВАЖНО: если ты определил параметры бронирования, ОБЯЗАТЕЛЬНО верни в конце ответа JSON-блок в точно таком формате:
\`\`\`json
{
  "booking": {
    "zoneId": 1,
    "zoneName": "Игровая зона",
    "date": "2024-03-15",
    "startHour": 18,
    "duration": 2
  }
}
\`\`\`

Если не хватает информации — уточни вопросом, не возвращай JSON.
Общайся дружелюбно, используй игровой сленг иногда. Пиши кратко.`;

// ── Парсинг JSON из ответа ────────────────────────────────────────
function parseBookingSuggestion(text) {
  try {
    const match = text.match(/```json\s*([\s\S]*?)```/);
    if (match) return JSON.parse(match[1]).booking || null;
  } catch {}
  return null;
}

// ── Очистить текст от JSON-блока для отображения ─────────────────
function cleanText(text) {
  return text.replace(/```json[\s\S]*?```/g, "").trim();
}

// ── Форматирование даты на русском ───────────────────────────────
function formatDate(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });
}

export default function AIAssistant({ data, updateData, currentUser, notify, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: `Привет, ${currentUser.nick}! 🎮 Я помогу забронировать зону. Скажи, например: «хочу поиграть в пятницу вечером часа 3» — и я всё сам подберу!`,
      suggestion: null,
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ── Проверка: можно ли реально забронировать предложенный слот ─
  const validateSuggestion = (s) => {
    if (!s) return { ok: false, reason: "Нет данных" };
    const zone = data.zones.find(z => z.id === s.zoneId);
    if (!zone || !zone.available) return { ok: false, reason: "Зона недоступна" };
    if (s.startHour < 8 || s.startHour + s.duration > 24) return { ok: false, reason: "Вне рабочих часов (8:00–24:00)" };
    if (bookingOverlapsClass(s.date, s.startHour, s.duration, data.settings)) {
      const sch = data.settings?.classSchedule;
      return { ok: false, reason: `Пересечение с учебными парами (${sch?.startHour}:00–${sch?.endHour}:00)` };
    }
    for (let h = s.startHour; h < s.startHour + s.duration; h++) {
      const clash = data.bookings.some(b =>
        b.zoneId === s.zoneId && b.date === s.date && b.status === "active" &&
        h >= b.startHour && h < b.startHour + b.duration
      );
      if (clash) return { ok: false, reason: `${h}:00 уже занято` };
    }
    const myClash = data.bookings.some(b =>
      b.userId === currentUser.id && b.date === s.date && b.status === "active" &&
      !(s.startHour >= b.startHour + b.duration || s.startHour + s.duration <= b.startHour)
    );
    if (myClash) return { ok: false, reason: "У вас уже есть бронь на это время" };
    return { ok: true };
  };

  // ── Отправить сообщение в GigaChat ───────────────────────────────
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Строим историю для API
    const today = getTodayStr();
    const apiMessages = [
      { role: "system", content: SYSTEM_PROMPT + `\n\nСегодня: ${today} (${new Date(today + "T12:00:00").toLocaleDateString("ru-RU", { weekday: "long" })}).` },
      ...messages
        .filter(m => m.role !== "assistant" || !m.suggestion) // не дублируем служебное
        .map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text })),
      { role: "user", content: text },
    ];

    try {
      const res = await fetch("/api/ai-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Ошибка ${res.status}`);
      }

      const data2 = await res.json();
      const raw = data2.choices?.[0]?.message?.content || "Не удалось получить ответ.";
      const suggestion = parseBookingSuggestion(raw);
      const displayText = cleanText(raw);

      setMessages(prev => [...prev, { role: "assistant", text: displayText, suggestion }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        text: `⚠️ Не могу связаться с GigaChat: ${err.message}. Проверьте, запущен ли сервер (\`npm run dev\`) и задан ли \`GIGACHAT_AUTH_KEY\` в \`.env\`.`,
        suggestion: null,
        isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  // ── Подтвердить бронирование из предложения ИИ ────────────────
  const confirmBooking = (suggestion) => {
    const zone = data.zones.find(z => z.id === suggestion.zoneId);
    const newBooking = {
      id: Date.now(),
      userId: currentUser.id,
      zoneId: suggestion.zoneId,
      date: suggestion.date,
      startHour: suggestion.startHour,
      duration: suggestion.duration,
      status: "active",
      seat: Math.floor(Math.random() * (zone?.seats || 10)) + 1,
    };
    updateData(prev => ({
      bookings: [...prev.bookings, newBooking],
      users: prev.users.map(u => u.id === currentUser.id ? {
        ...u,
        visits: u.visits + 1,
        hours: u.hours + suggestion.duration,
        xp: Math.min(u.xp + suggestion.duration * 50, u.xpMax),
        badges: !u.badges.includes("first_book") ? [...u.badges, "first_book"] : u.badges,
      } : u),
      activityFeed: [{
        id: Date.now(), type: "booking", userId: currentUser.id,
        zoneId: suggestion.zoneId, time: "только что",
        text: `забронировал ${zone?.name} через AI-ассистента`,
      }, ...prev.activityFeed],
    }));
    setConfirmed(true);
    notify(`🤖 ИИ забронировал ${zone?.name} на ${formatDate(suggestion.date)}, ${suggestion.startHour}:00!`);
    setTimeout(onClose, 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width: 560, maxHeight: "85vh", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg, var(--blue-dim), rgba(65,105,255,0.06))" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, var(--blue), var(--blue-light))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "0 0 20px rgba(65,105,255,0.35)" }}>🤖</div>
            <div>
              <div style={{ fontFamily: "Orbitron", fontSize: 13, color: "var(--blue-light)", letterSpacing: 1 }}>AI-АССИСТЕНТ</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>GigaChat · Кибер-Арена</div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} style={{ float: "none" }}>✕</button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start", gap: 8 }}>
              <div style={{
                maxWidth: "82%",
                padding: "10px 14px",
                borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                background: msg.role === "user"
                  ? "linear-gradient(135deg, rgba(65,105,255,0.12), rgba(65,105,255,0.06))"
                  : msg.isError ? "rgba(239,68,68,0.08)" : "var(--blue-dim)",
                border: `1px solid ${msg.role === "user" ? "var(--blue-border)" : msg.isError ? "rgba(239,68,68,0.2)" : "rgba(65,105,255,0.18)"}`,
                fontSize: 13,
                lineHeight: 1.6,
                color: "var(--text)",
                whiteSpace: "pre-wrap",
              }}>
                {msg.text}
              </div>

              {/* Карточка предложения бронирования */}
              {msg.suggestion && (() => {
                const s = msg.suggestion;
                const zone = data.zones.find(z => z.id === s.zoneId);
                const validation = validateSuggestion(s);
                return (
                  <div style={{ maxWidth: "82%", width: "100%", background: validation.ok ? "rgba(0,245,255,0.05)" : "rgba(239,68,68,0.05)", border: `1px solid ${validation.ok ? "rgba(65,105,255,0.25)" : "rgba(239,68,68,0.3)"}`, borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                      {validation.ok ? "🎯 Предложение бронирования" : "⚠️ Слот недоступен"}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                      {[
                        { label: "Зона", value: `${zone?.icon} ${s.zoneName}` },
                        { label: "Дата", value: formatDate(s.date) },
                        { label: "Время", value: `${s.startHour}:00 – ${s.startHour + s.duration}:00` },
                        { label: "Длительность", value: `${s.duration} ч.` },
                      ].map(row => (
                        <div key={row.label}>
                          <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>{row.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{row.value}</div>
                        </div>
                      ))}
                    </div>
                    {validation.ok ? (
                      confirmed ? (
                        <div style={{ textAlign: "center", color: "#10b981", fontWeight: 700, fontSize: 14 }}>✅ Забронировано!</div>
                      ) : (
                        <button className="btn btn-primary btn-full" onClick={() => confirmBooking(s)} style={{ fontSize: 13 }}>
                          ✅ Подтвердить бронирование
                        </button>
                      )
                    ) : (
                      <div style={{ fontSize: 12, color: "#ef4444" }}>❌ {validation.reason}</div>
                    )}
                  </div>
                );
              })()}
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--blue)", animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>GigaChat думает...</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        <div style={{ padding: "8px 20px", borderTop: "1px solid var(--border2)", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[
            "Хочу поиграть сегодня вечером 2 часа",
            "Нужна командная зона на выходных",
            "Свободно ли что-нибудь завтра после 18:00?",
          ].map(prompt => (
            <button key={prompt} className="btn btn-sm btn-secondary" style={{ fontSize: 11 }}
              onClick={() => { setInput(prompt); }}>
              {prompt}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", gap: 10 }}>
          <input
            className="input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Напишите, когда хотите поиграть..."
            disabled={loading || confirmed}
            style={{ flex: 1 }}
            autoFocus
          />
          <button className="btn btn-primary" onClick={sendMessage} disabled={loading || !input.trim() || confirmed}
            style={{ padding: "10px 16px", fontSize: 16 }}>
            ➤
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
