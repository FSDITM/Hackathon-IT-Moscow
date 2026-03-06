import { useEffect, useState } from "react";

// ── Иконки по типу ────────────────────────────────────────
const ICONS = {
  success: "✓",
  error:   "✕",
  info:    "ℹ",
  warning: "⚠",
};
const COLORS = {
  success: { bg: "rgba(34,197,94,0.10)",  border: "rgba(34,197,94,0.25)",  icon: "#22C55E", bar: "#22C55E" },
  error:   { bg: "rgba(239,68,68,0.10)",  border: "rgba(239,68,68,0.25)",  icon: "#EF4444", bar: "#EF4444" },
  info:    { bg: "var(--blue-dim)",       border: "var(--blue-border)",    icon: "var(--blue)", bar: "var(--blue)" },
  warning: { bg: "rgba(245,166,35,0.10)", border: "rgba(245,166,35,0.25)", icon: "#F5A623", bar: "#F5A623" },
};

function ToastItem({ id, msg, type = "success", onRemove }) {
  const [visible, setVisible] = useState(false);
  const c = COLORS[type] || COLORS.success;

  useEffect(() => {
    // Slide-in
    const t1 = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss after 3.5s
    const t2 = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(id), 350);
    }, 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div
      onClick={() => { setVisible(false); setTimeout(() => onRemove(id), 350); }}
      style={{
        display: "flex", alignItems: "flex-start", gap: 12,
        background: c.bg, border: `1px solid ${c.border}`,
        borderRadius: 10, padding: "13px 16px", minWidth: 300, maxWidth: 380,
        cursor: "pointer", position: "relative", overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
        transform: visible ? "translateX(0)" : "translateX(calc(100% + 24px))",
        opacity: visible ? 1 : 0,
        transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
      }}
    >
      {/* Icon */}
      <div style={{
        width: 28, height: 28, borderRadius: 7, flexShrink: 0,
        background: `${c.icon}22`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 700, fontSize: 14, color: c.icon,
      }}>
        {ICONS[type]}
      </div>

      {/* Text */}
      <div style={{ flex: 1, paddingTop: 3, fontSize: 13.5, color: "var(--text)", lineHeight: 1.4, fontWeight: 500 }}>
        {msg}
      </div>

      {/* Progress bar */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, height: 2,
        background: c.bar, borderRadius: "0 0 0 10px",
        animation: "toastProgress 3.5s linear forwards",
      }} />
    </div>
  );
}

// ── Toast Container — монтируется в корне ─────────────────
export default function ToastContainer({ toasts, removeToast }) {
  return (
    <>
      <style>{`
        @keyframes toastProgress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
      <div style={{
        position: "fixed", top: 20, right: 20,
        zIndex: 99999,
        display: "flex", flexDirection: "column", gap: 10,
        pointerEvents: "none",
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: "all" }}>
            <ToastItem {...t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </>
  );
}
