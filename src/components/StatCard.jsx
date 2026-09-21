export default function StatCard({ icon, label, value, accent = "pink", trend }) {
  const accentConfigs = {
    pink: {
      iconBg: "bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25",
      border: "border-pink-200/60 dark:border-pink-900/40",
      glow: "hover:shadow-pink-500/15",
    },
    blue: {
      iconBg: "bg-gradient-to-tr from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/25",
      border: "border-blue-200/60 dark:border-blue-900/40",
      glow: "hover:shadow-blue-500/15",
    },
    amber: {
      iconBg: "bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25",
      border: "border-amber-200/60 dark:border-amber-900/40",
      glow: "hover:shadow-amber-500/15",
    },
    emerald: {
      iconBg: "bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25",
      border: "border-emerald-200/60 dark:border-emerald-900/40",
      glow: "hover:shadow-emerald-500/15",
    },
    rose: {
      iconBg: "bg-gradient-to-tr from-rose-500 to-red-500 text-white shadow-md shadow-rose-500/25",
      border: "border-rose-200/60 dark:border-rose-900/40",
      glow: "hover:shadow-rose-500/15",
    },
  };

  const current = accentConfigs[accent] || accentConfigs.pink;

  return (
    <div
      className={`luxury-card rounded-[26px] p-5 sm:p-6 flex items-center justify-between gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${current.glow} relative overflow-hidden group`}
    >
      {/* Ambient background blur */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-pink-500/5 dark:bg-pink-500/10 blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-pink-300/70">
          {label}
        </p>
        <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white truncate mt-1 tracking-tight">
          {value}
        </p>
        {trend && (
          <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {trend}
          </p>
        )}
      </div>

      <div
        className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${current.iconBg}`}
      >
        {icon}
      </div>
    </div>
  );
}
