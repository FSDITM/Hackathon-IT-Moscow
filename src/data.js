// ===================== HELPERS =====================
export function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}
export function getDateStr(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
}

// ===================== INITIAL DATA =====================
export const initialData = {
  users: [
    { id: 1, name: "Алексей Громов", nick: "GromovPRO", email: "alexey@college.ru", password: "123456", role: "user", coins: 250, level: 5, xp: 1200, xpMax: 2000, avatar: "🎮", teamId: 1, badges: ["first_book","streak_3","tournament_winner"], visits: 12, hours: 28 },
    { id: 2, name: "Мария Светлова", nick: "StarMaria", email: "maria@college.ru", password: "123456", role: "user", coins: 180, level: 3, xp: 600, xpMax: 1000, avatar: "⚡", teamId: 1, badges: ["first_book","team_player"], visits: 8, hours: 15 },
    { id: 3, name: "Администратор", nick: "Admin", email: "admin@college.ru", password: "admin", role: "admin", coins: 9999, level: 99, xp: 9999, xpMax: 10000, avatar: "🛡️", teamId: null, badges: [], visits: 0, hours: 0 },
    { id: 4, name: "Иван Петров", nick: "IvanP", email: "ivan@college.ru", password: "123456", role: "user", coins: 90, level: 2, xp: 300, xpMax: 500, avatar: "🔥", teamId: null, badges: ["first_book"], visits: 5, hours: 9 },
  ],
  zones: [
    { id: 1, name: "Игровая зона", type: "gaming", icon: "🎮", color: "#00f5ff", seats: 20, description: "ПК с топовыми видеокартами, мониторы 144Hz", available: true },
    { id: 2, name: "Тренировочная зона", type: "training", icon: "🏆", color: "#ff6b35", seats: 10, description: "Профессиональные тренировки, аналитика игр", available: true },
    { id: 3, name: "Командная зона", type: "team", icon: "👥", color: "#a855f7", seats: 6, description: "Закрытая зона для командных тренировок и стратегий", available: true },
  ],
  bookings: [
    { id: 1, userId: 1, zoneId: 1, date: getTodayStr(), startHour: 18, duration: 2, status: "active", seat: 3 },
    { id: 2, userId: 2, zoneId: 2, date: getTodayStr(), startHour: 19, duration: 1, status: "active", seat: 1 },
    { id: 3, userId: 4, zoneId: 1, date: getTodayStr(), startHour: 20, duration: 2, status: "active", seat: 7 },
  ],
  tournaments: [
    { id: 1, name: "CS2 Spring Cup", game: "CS2", status: "open", maxTeams: 8, teams: [1], prize: "500 монет", date: getDateStr(3), icon: "🏆" },
    { id: 2, name: "Valorant Weekly", game: "Valorant", status: "ongoing", maxTeams: 4, teams: [1, 2], prize: "300 монет", date: getTodayStr(), icon: "⚔️" },
    { id: 3, name: "Dota 2 Championship", game: "Dota 2", status: "finished", maxTeams: 4, teams: [], prize: "1000 монет", date: getDateStr(-7), icon: "🌟", winner: "Team Alpha" },
  ],
  teams: [
    { id: 1, name: "Team Alpha", tag: "ALPHA", captainId: 1, members: [1, 2], wins: 5, losses: 2, icon: "🔥", description: "Лучшая команда колледжа" },
    { id: 2, name: "Dark Knights", tag: "DRK", captainId: 4, members: [4], wins: 2, losses: 3, icon: "⚔️", description: "Ищем игроков!" },
  ],
  activityFeed: [
    { id: 1, type: "booking", userId: 1, zoneId: 1, time: "2 мин назад", text: "забронировал Игровую зону" },
    { id: 2, type: "achievement", userId: 2, badge: "team_player", time: "15 мин назад", text: "получила достижение «Командный игрок»" },
    { id: 3, type: "tournament", tournamentId: 1, time: "1 час назад", text: "открыт турнир CS2 Spring Cup — регистрация открыта!" },
    { id: 4, type: "team", teamId: 1, time: "3 часа назад", text: "команда Team Alpha зарегистрирована на турнир" },
  ],
  achievements: [
    { id: "first_book", name: "Первое бронирование", desc: "Забронировать зону впервые", icon: "🎯", rarity: "common" },
    { id: "streak_3", name: "3 дня подряд", desc: "Посетить арену 3 дня подряд", icon: "🔥", rarity: "rare" },
    { id: "tournament_winner", name: "Победитель турнира", desc: "Выиграть турнир", icon: "🏆", rarity: "epic" },
    { id: "team_player", name: "Командный игрок", desc: "Вступить в команду", icon: "👥", rarity: "common" },
    { id: "centurion", name: "Центурион", desc: "Провести 100 часов на арене", icon: "💯", rarity: "legendary" },
    { id: "night_owl", name: "Сова", desc: "Бронировать после 22:00", icon: "🦉", rarity: "rare" },
  ],
  // =================== НАСТРОЙКИ РАСПИСАНИЯ ===================
  settings: {
    // weekdays: 1=Пн, 2=Вт, 3=Ср, 4=Чт, 5=Пт, 6=Сб, 0=Вс
    classSchedule: {
      enabled: true,
      weekdays: [1, 2, 3, 4, 5],
      startHour: 9,
      endHour: 17,
      label: "Учебные пары (Пн–Пт, 09:00–17:00)"
    }
  }
};

// ===================== LOCALSTORAGE =====================
const STORAGE_KEY = "cyber-arena-data";
const USER_KEY = "cyber-arena-user";

export function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge settings from initialData in case new fields were added
      return { ...initialData, ...parsed, settings: { ...initialData.settings, ...parsed.settings } };
    }
  } catch {}
  return initialData;
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function loadUser() {
  try {
    const saved = localStorage.getItem(USER_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

export function saveUser(user) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {}
}

// ===================== CLASS SCHEDULE HELPERS =====================
export function isClassHour(date, hour, settings) {
  const schedule = settings?.classSchedule;
  if (!schedule?.enabled) return false;
  const d = new Date(date + "T12:00:00"); // noon to avoid TZ issues
  const dayOfWeek = d.getDay(); // 0=Sun, 6=Sat
  if (!schedule.weekdays.includes(dayOfWeek)) return false;
  return hour >= schedule.startHour && hour < schedule.endHour;
}

export function bookingOverlapsClass(date, startHour, duration, settings) {
  for (let h = startHour; h < startHour + duration; h++) {
    if (isClassHour(date, h, settings)) return true;
  }
  return false;
}
