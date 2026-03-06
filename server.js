// ================================================================
// GigaChat Proxy Server
// Использует undici вместо нативного fetch — поддерживает агент
// с отключённой проверкой SSL (нужно для GigaChat)
// ================================================================
import express from "express";
import cors from "cors";
import { fetch, Agent } from "undici";

const app = express();
app.use(cors());
app.use(express.json());

const AUTH_KEY  = process.env.GIGACHAT_AUTH_KEY || "";
const TOKEN_URL = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth";
const CHAT_URL  = "https://gigachat.devices.sberbank.ru/api/v1/chat/completions";

// Агент без проверки SSL — GigaChat использует самоподписанный сертификат
const agent = new Agent({ connect: { rejectUnauthorized: false } });

// ── Кэш токена (живёт 29 минут) ─────────────────────────────────
let cachedToken = null;
let tokenExpiry  = 0;

async function getToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
  if (!AUTH_KEY) throw new Error("GIGACHAT_AUTH_KEY не задан в .env");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${AUTH_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "RqUID": crypto.randomUUID(),
    },
    body: "scope=GIGACHAT_API_PERS",
    dispatcher: agent,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`GigaChat auth failed ${res.status}: ${txt}`);
  }
  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry  = Date.now() + 29 * 60 * 1000;
  console.log("[proxy] Токен GigaChat получен ✓");
  return cachedToken;
}


// ── 🛡️ Rate Limiter — защита от брутфорса авторизации ────────
// Хранит попытки в памяти. При перезапуске сервера сбрасывается.
const loginAttempts = new Map();
// { ip → { count, lockedUntil } }

const RATE_LIMIT = {
  maxAttempts: 5,          // попыток до блокировки
  windowMs:    60_000,     // окно: 1 минута
  lockoutMs:   15 * 60_000 // блокировка: 15 минут
};

function getRateLimit(ip) {
  const now = Date.now();
  const entry = loginAttempts.get(ip) || { count: 0, windowStart: now, lockedUntil: 0 };

  // Снять блокировку если время вышло
  if (entry.lockedUntil && now > entry.lockedUntil) {
    loginAttempts.delete(ip);
    return { blocked: false, remaining: RATE_LIMIT.maxAttempts, retryAfter: 0 };
  }
  if (entry.lockedUntil && now <= entry.lockedUntil) {
    return { blocked: true, remaining: 0, retryAfter: Math.ceil((entry.lockedUntil - now) / 1000) };
  }
  // Сбросить окно если истекло
  if (now - entry.windowStart > RATE_LIMIT.windowMs) {
    loginAttempts.delete(ip);
    return { blocked: false, remaining: RATE_LIMIT.maxAttempts, retryAfter: 0 };
  }

  const remaining = RATE_LIMIT.maxAttempts - entry.count;
  return { blocked: false, remaining, retryAfter: 0, entry };
}

function recordAttempt(ip, success) {
  const now = Date.now();
  if (success) { loginAttempts.delete(ip); return; }

  const entry = loginAttempts.get(ip) || { count: 0, windowStart: now, lockedUntil: 0 };
  entry.count += 1;
  if (entry.count >= RATE_LIMIT.maxAttempts) {
    entry.lockedUntil = now + RATE_LIMIT.lockoutMs;
    console.warn(`[rate-limit] 🔒 IP заблокирован: ${ip} на 15 мин (${entry.count} попыток)`);
  }
  loginAttempts.set(ip, entry);
}

// ── POST /api/auth/check ── Проверяет лимит перед отправкой формы ─
app.post("/api/auth/check", (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || "unknown";
  const { blocked, remaining, retryAfter } = getRateLimit(ip);
  res.json({ blocked, remaining, retryAfter });
});

// ── POST /api/auth/attempt ── Регистрирует попытку (success / fail) ─
app.post("/api/auth/attempt", (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || "unknown";
  const { success } = req.body;
  const { blocked } = getRateLimit(ip);

  if (blocked) {
    const info = getRateLimit(ip);
    return res.status(429).json({ blocked: true, retryAfter: info.retryAfter });
  }

  recordAttempt(ip, !!success);
  const info = getRateLimit(ip);
  res.json({ blocked: info.blocked, remaining: info.remaining, retryAfter: info.retryAfter });
});

// ── POST /api/ai-book ────────────────────────────────────────────
app.post("/api/ai-book", async (req, res) => {
  try {
    const token = await getToken();
    const { messages } = req.body;

    const response = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "GigaChat",
        messages,
        temperature: 0.3,
        max_tokens: 600,
      }),
      dispatcher: agent,
    });

    if (!response.ok) {
      const txt = await response.text();
      return res.status(response.status).json({ error: txt });
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("[proxy] Ошибка:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Health check ─────────────────────────────────────────────────
app.get("/api/health", (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[proxy] GigaChat proxy запущен → http://localhost:${PORT}`);
  if (!AUTH_KEY) console.warn("[proxy] ⚠️  GIGACHAT_AUTH_KEY не задан — запросы будут падать!");
  else console.log("[proxy] ✓ GIGACHAT_AUTH_KEY загружен");
});
