import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { loadData, saveData, loadUser, saveUser } from "./data.js";
import { styles } from "./styles.js";
import ToastContainer from "./components/Toast.jsx";
import PageSkeleton   from "./components/PageSkeleton.jsx";

// ── ⚡ Lazy loading — все страницы грузятся только при первом посещении ──
const AuthScreen       = lazy(() => import("./components/Auth.jsx"));
const UserDashboard    = lazy(() => import("./components/Dashboard.jsx"));
const BookingPage      = lazy(() => import("./components/BookingPage.jsx"));
const CalendarPage     = lazy(() => import("./components/CalendarPage.jsx"));
const ProfilePage      = lazy(() => import("./components/ProfilePage.jsx"));
const AchievementsPage = lazy(() => import("./components/AchievementsPage.jsx"));
const TournamentsPage  = lazy(() => import("./components/TournamentsPage.jsx"));
const TeamsPage        = lazy(() => import("./components/TeamsPage.jsx"));
const ActivityPage     = lazy(() => import("./components/ActivityPage.jsx"));

const AdminDashboard       = lazy(() => import("./components/admin/AdminDashboard.jsx"));
const AdminZonesPage       = lazy(() => import("./components/admin/AdminZonesPage.jsx"));
const AdminBookingsPage    = lazy(() => import("./components/admin/AdminBookingsPage.jsx"));
const AdminTournamentsPage = lazy(() => import("./components/admin/AdminTournamentsPage.jsx"));
const AdminUsersPage       = lazy(() => import("./components/admin/AdminUsersPage.jsx"));
const AdminStatsPage       = lazy(() => import("./components/admin/AdminStatsPage.jsx"));

// ── 🛡️ Admin-only route guard ────────────────────────────────
const ADMIN_PAGES = new Set(["zones","bookings_admin","tournaments_admin","users_admin","stats_admin"]);

// ── 🌓 Theme helpers ─────────────────────────────────────────
function getInitialTheme() {
  const saved = localStorage.getItem("cyber-arena-theme");
  if (saved) return saved;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("cyber-arena-theme", theme);
}

export default function App() {
  const [data, setData]               = useState(loadData);
  const [currentUser, setCurrentUser] = useState(loadUser);
  const [page, setPage]               = useState("dashboard");
  const [toasts, setToasts]           = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme]             = useState(getInitialTheme);
  const [pageKey, setPageKey]         = useState(0); // ← triggers transition animation

  // ── Apply theme to <html> ─────────────────────────────────
  useEffect(() => { applyTheme(theme); }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  // ── Persist ───────────────────────────────────────────────
  useEffect(() => { saveData(data); }, [data]);
  useEffect(() => { saveUser(currentUser); }, [currentUser]);

  const user = currentUser
    ? data.users.find(u => u.id === currentUser.id) || currentUser
    : null;

  // ── 🍞 Toasts ─────────────────────────────────────────────
  const notify = useCallback((msg, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
  }, []);
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const updateData = useCallback((updater) => {
    setData(prev => ({ ...prev, ...updater(prev) }));
  }, []);

  const handleLogin = (u) => { setCurrentUser(u); setPage("dashboard"); };

  const logout = () => {
    setCurrentUser(null);
    saveUser(null);
    setPage("dashboard");
  };

  // ── 🛡️ Route guard + ✨ page transition trigger ───────────
  const navigateTo = useCallback((targetPage) => {
    if (ADMIN_PAGES.has(targetPage) && user?.role !== "admin") {
      notify("⛔ Доступ запрещён — только для администраторов", "error");
      return;
    }
    setPage(targetPage);
    setPageKey(k => k + 1); // increment → re-mounts with animation
    setSidebarOpen(false);
  }, [user, notify]);

  // ── Nav items ─────────────────────────────────────────────
  const navItems = user?.role === "admin" ? [
    { id: "dashboard",         icon: "📊", label: "Дашборд" },
    { id: "zones",             icon: "🗂️",  label: "Зоны и расписание" },
    { id: "bookings_admin",    icon: "📋", label: "Бронирования" },
    { id: "tournaments_admin", icon: "🏆", label: "Турниры" },
    { id: "users_admin",       icon: "👤", label: "Пользователи" },
    { id: "stats_admin",       icon: "📈", label: "Статистика" },
  ] : [
    { id: "dashboard",    icon: "🏠", label: "Главная" },
    { id: "booking",      icon: "📅", label: "Бронирование" },
    { id: "calendar",     icon: "🗓️",  label: "Расписание" },
    { id: "profile",      icon: "👤", label: "Профиль" },
    { id: "achievements", icon: "🎖️",  label: "Достижения" },
    { id: "tournaments",  icon: "🏆", label: "Турниры" },
    { id: "teams",        icon: "👥", label: "Команды" },
    { id: "activity",     icon: "📡", label: "Лента" },
  ];

  const pageMap = {
    dashboard:           user?.role === "admin" ? AdminDashboard : UserDashboard,
    booking:             BookingPage,
    calendar:            CalendarPage,
    profile:             ProfilePage,
    achievements:        AchievementsPage,
    tournaments:         TournamentsPage,
    teams:               TeamsPage,
    activity:            ActivityPage,
    zones:               AdminZonesPage,
    bookings_admin:      AdminBookingsPage,
    tournaments_admin:   AdminTournamentsPage,
    users_admin:         AdminUsersPage,
    stats_admin:         AdminStatsPage,
  };

  // 🛡️ Runtime guard
  const resolvedPage = (ADMIN_PAGES.has(page) && user?.role !== "admin") ? "dashboard" : page;
  const PageComponent = pageMap[resolvedPage] || (user?.role === "admin" ? AdminDashboard : UserDashboard);

  const pageProps = { data, updateData, currentUser: user, notify, setPage: navigateTo };

  // ── Auth screen ───────────────────────────────────────────
  if (!user) {
    return (
      <>
        <style>{styles}</style>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <Suspense fallback={<div style={{ background: "var(--bg)", minHeight: "100vh" }} />}>
          <AuthScreen data={data} updateData={updateData} onLogin={handleLogin} notify={notify} />
        </Suspense>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <style>{`
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
            transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
            z-index: 200;
          }
          .sidebar.open {
            transform: translateX(0);
            box-shadow: 8px 0 40px rgba(0,0,0,0.4);
          }
          .main { margin-left: 0 !important; }
          .mobile-overlay {
            display: block; position: fixed; inset: 0;
            background: rgba(0,0,0,0.5); z-index: 199;
            backdrop-filter: blur(2px);
          }
        }
        @media (min-width: 769px) {
          .hamburger { display: none !important; }
          .mobile-overlay { display: none !important; }
        }
      `}</style>

      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {sidebarOpen && <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className="app">
        {/* ── Sidebar ─────────────────────────────────── */}
        <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div style={{ padding: "18px 20px 16px", borderBottom: "1px solid var(--border2)" }}>
            <img src="/logo_full_white.svg" alt="ИТ.МОСКВА" style={{ height: 20, display: "block" }} />
            <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 16, height: 1, background: "var(--blue)", borderRadius: 1 }} />
              <span style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 600 }}>
                Кибер-Арена
              </span>
            </div>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section">{user.role === "admin" ? "УПРАВЛЕНИЕ" : "НАВИГАЦИЯ"}</div>
            {navItems.map(item => (
              <div
                key={item.id}
                className={`nav-item ${resolvedPage === item.id ? "active" : ""}`}
                onClick={() => navigateTo(item.id)}
              >
                <span className="icon">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </nav>

          <div className="sidebar-user" onClick={() => user.role !== "admin" && navigateTo("profile")}>
            <div className="user-avatar-sm">{user.avatar}</div>
            <div className="user-info-sm">
              <div className="name">{user.nick}</div>
              <div className="role">{user.role === "admin" ? "Администратор" : `Ур. ${user.level}`}</div>
            </div>
          </div>
        </div>

        {/* ── Main ────────────────────────────────────── */}
        <div className="main">
          <div className="topbar">
            {/* 📱 Hamburger */}
            <button
              className="hamburger"
              onClick={() => setSidebarOpen(o => !o)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 6, display: "flex", flexDirection: "column", gap: 5 }}
            >
              {[0,1,2].map(i => (
                <span key={i} style={{
                  display: "block", width: 22, height: 2,
                  background: "var(--text2)", borderRadius: 1, transition: "all 0.2s",
                  transform: sidebarOpen
                    ? i === 0 ? "rotate(45deg) translate(5px,5px)"
                    : i === 2 ? "rotate(-45deg) translate(5px,-5px)" : "scaleX(0)"
                    : "none",
                  opacity: sidebarOpen && i === 1 ? 0 : 1,
                }} />
              ))}
            </button>

            <span className="topbar-title">
              {navItems.find(n => n.id === resolvedPage)?.label?.toUpperCase() || "ГЛАВНАЯ"}
            </span>

            <div className="topbar-right">
              {user.role !== "admin" && (
                <div className="coins-badge">🪙 {user.coins}</div>
              )}

              {/* 🌓 Theme toggle */}
              <button className="theme-toggle" onClick={toggleTheme} title={theme === "dark" ? "Светлая тема" : "Тёмная тема"}>
                {theme === "dark" ? "☀️" : "🌙"}
              </button>

              <button className="logout-btn" onClick={logout}>Выйти</button>
            </div>
          </div>

          {/* ── ✨ Page with transition animation ── */}
          <div className="content">
            <Suspense fallback={<PageSkeleton />}>
              <div key={pageKey} className="page-enter">
                <PageComponent {...pageProps} />
              </div>
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
