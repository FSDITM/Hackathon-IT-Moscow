import { useState, useEffect, useCallback } from "react";
import { hashPassword, verifyPassword, isHashed } from "../crypto.js";

// ── 🛡️ Rate limiting helpers (общается с proxy-сервером) ─────
async function checkRateLimit() {
  try {
    const r = await fetch("/api/auth/check", { method: "POST" });
    return await r.json();
  } catch { return { blocked: false, remaining: 5, retryAfter: 0 }; }
}

async function recordAttempt(success) {
  try {
    await fetch("/api/auth/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success }),
    });
  } catch {}
}

// ── Форматирование обратного отсчёта ─────────────────────────
function formatCountdown(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m} мин ${s} сек` : `${s} сек`;
}

export default function AuthScreen({ data, updateData, onLogin, notify }) {
  const [tab, setTab]         = useState("login");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]       = useState("");
  const [nick, setNick]       = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  // 🛡️ Rate limit state
  const [blocked, setBlocked]       = useState(false);
  const [countdown, setCountdown]   = useState(0);
  const [remaining, setRemaining]   = useState(5);

  // ── Проверяем лимит при загрузке ────────────────────────────
  useEffect(() => {
    checkRateLimit().then(({ blocked: b, remaining: r, retryAfter }) => {
      setBlocked(b);
      setRemaining(r ?? 5);
      if (b) setCountdown(retryAfter);
    });
  }, []);

  // ── Таймер обратного отсчёта блокировки ─────────────────────
  useEffect(() => {
    if (!blocked || countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          setBlocked(false);
          setRemaining(5);
          setError("");
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [blocked, countdown]);

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  // ── Общая логика после попытки входа ─────────────────────────
  const handleAttemptResult = async (success) => {
    const res = await fetch("/api/auth/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success }),
    }).then(r => r.json()).catch(() => ({}));

    if (!success) {
      if (res.blocked) {
        setBlocked(true);
        setCountdown(res.retryAfter);
        setError(`🔒 Слишком много попыток. Заблокировано на ${formatCountdown(res.retryAfter)}.`);
      } else {
        setRemaining(res.remaining ?? remaining - 1);
      }
    } else {
      setBlocked(false);
      setRemaining(5);
    }
  };

  // ── Вход ─────────────────────────────────────────────────────
  const login = async () => {
    setError("");
    if (blocked) return;
    if (!email || !password) { setError("Заполните все поля"); return; }
    if (!validateEmail(email)) { setError("Некорректный формат email"); return; }

    setLoading(true);
    try {
      const userRaw = data.users.find(u => u.email === email);
      if (!userRaw) {
        await handleAttemptResult(false);
        setError(`Пользователь не найден${remaining <= 3 ? ` (осталось попыток: ${remaining - 1})` : ""}`);
        return;
      }

      let ok = false;
      if (isHashed(userRaw.password)) {
        ok = await verifyPassword(password, userRaw.password);
      } else {
        ok = userRaw.password === password;
        if (ok) {
          const hashed = await hashPassword(password);
          updateData(prev => ({
            users: prev.users.map(u => u.id === userRaw.id ? { ...u, password: hashed } : u)
          }));
        }
      }

      if (!ok) {
        await handleAttemptResult(false);
        const rem = remaining - 1;
        setError(rem <= 0
          ? "🔒 Вход заблокирован на 15 минут."
          : `Неверный пароль. Осталось попыток: ${rem}`
        );
        return;
      }

      await handleAttemptResult(true);
      onLogin(userRaw);
      notify(`Добро пожаловать, ${userRaw.nick}!`, "success");
    } finally {
      setLoading(false);
    }
  };

  // ── Регистрация ───────────────────────────────────────────────
  const register = async () => {
    setError("");
    if (blocked) return;
    if (!name.trim() || !nick.trim() || !email || !password) { setError("Заполните все поля"); return; }
    if (!validateEmail(email)) { setError("Некорректный формат email"); return; }
    if (password.length < 6)   { setError("Пароль — минимум 6 символов"); return; }
    if (nick.length < 3)       { setError("Никнейм — минимум 3 символа"); return; }
    if (data.users.find(u => u.email === email)) { setError("Email уже зарегистрирован"); return; }
    if (data.users.find(u => u.nick.toLowerCase() === nick.toLowerCase())) { setError("Никнейм уже занят"); return; }

    setLoading(true);
    try {
      const hashed = await hashPassword(password);
      const newUser = {
        id: Date.now(), name: name.trim(), nick: nick.trim(),
        email, password: hashed, role: "user",
        coins: 50, level: 1, xp: 0, xpMax: 200, avatar: "🎮",
        teamId: null, badges: [], visits: 0, hours: 0,
      };
      updateData(prev => ({ users: [...prev.users, newUser] }));
      onLogin(newUser);
      notify("Аккаунт создан! Добро пожаловать!", "success");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter" && !blocked) tab === "login" ? login() : register(); };

  const isDisabled = loading || blocked;

  return (
    <div className="auth-screen">
      <div className="auth-bg" />
      <div className="auth-card" onKeyDown={handleKey}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <img src="/logo_full_white.svg" alt="ИТ.МОСКВА"
            style={{ height: 28, display: "inline-block", marginBottom: 14 }} />
          <div className="auth-title">Кибер-Арена</div>
          <div className="auth-sub">Платформа бронирования зон колледжа</div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <div className={`tab ${tab === "login" ? "active" : ""}`}
            onClick={() => { setTab("login"); setError(""); }}>Вход</div>
          <div className={`tab ${tab === "register" ? "active" : ""}`}
            onClick={() => { setTab("register"); setError(""); }}>Регистрация</div>
        </div>

        {/* 🛡️ Rate limit banner */}
        {blocked && (
          <div className="alert alert-error" style={{ textAlign: "center" }}>
            🔒 <strong>Вход заблокирован</strong><br />
            <span style={{ fontSize: 13, opacity: 0.85 }}>Повторите через </span>
            <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 15 }}>
              {formatCountdown(countdown)}
            </span>
          </div>
        )}

        {/* Remaining attempts warning */}
        {!blocked && remaining <= 3 && remaining > 0 && (
          <div className="alert alert-warning" style={{ fontSize: 12 }}>
            ⚠️ Осталось попыток входа: <strong>{remaining}</strong>. После — блокировка на 15 мин.
          </div>
        )}

        {error && !blocked && <div className="alert alert-error">{error}</div>}

        {tab === "login" ? (
          <>
            <div className="form-group">
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="student@college.ru"
                value={email} onChange={e => setEmail(e.target.value)}
                disabled={isDisabled} autoFocus />
            </div>
            <div className="form-group">
              <label className="label">Пароль</label>
              <input className="input" type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                disabled={isDisabled} />
            </div>
            <button className="btn btn-primary btn-full" onClick={login} disabled={isDisabled}>
              {loading ? "Вход..." : blocked ? `🔒 ${formatCountdown(countdown)}` : "Войти"}
            </button>

            <div className="alert alert-info" style={{ marginTop: 14, fontSize: 12 }}>
              <strong>Тест:</strong> alexey@college.ru / 123456 &nbsp;|&nbsp; admin@college.ru / admin
            </div>
          </>
        ) : (
          <>
            <div className="grid-2" style={{ gap: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="label">Имя</label>
                <input className="input" placeholder="Иван Иванов"
                  value={name} onChange={e => setName(e.target.value)}
                  disabled={isDisabled} autoFocus />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="label">Никнейм</label>
                <input className="input" placeholder="pro_gamer"
                  value={nick} onChange={e => setNick(e.target.value)}
                  disabled={isDisabled} />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 12 }}>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="student@college.ru"
                value={email} onChange={e => setEmail(e.target.value)} disabled={isDisabled} />
            </div>
            <div className="form-group">
              <label className="label">
                Пароль <span style={{ color: "var(--muted)", fontWeight: 400 }}>(мин. 6 символов)</span>
              </label>
              <input className="input" type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} disabled={isDisabled} />
            </div>
            <button className="btn btn-primary btn-full" onClick={register} disabled={isDisabled}>
              {loading ? "Создаём аккаунт..." : "Создать аккаунт"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
