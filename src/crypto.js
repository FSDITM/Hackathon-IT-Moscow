// ── Хеширование паролей через Web Crypto API ──────────────
// SHA-256 + соль. Работает нативно в браузере, без зависимостей.

const SALT = "cyber-arena-it-moscow-2025"; // статическая соль

export async function hashPassword(plain) {
  const input = SALT + plain;
  const encoded = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyPassword(plain, hash) {
  const computed = await hashPassword(plain);
  return computed === hash;
}

// ── Проверяем, захеширован ли уже пароль (hex-строка 64 символа) ──
export function isHashed(password) {
  return typeof password === "string" && /^[0-9a-f]{64}$/.test(password);
}
