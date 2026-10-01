export default function StatCard({
  icon,
  label,
  value,
  accent = "purple",
  trend,
  subtext,
}) {
  // Support both legacy accents (blue, amber, rose, emerald, pink) and image clay accents (purple, pink, mint, yellow)
  const clayVariants = {
    purple: {
      cardCls: "clay-card-purple",
      labelCls: "text-slate-600 dark:text-purple-200/80",
      trendCls: "text-purple-600 dark:text-purple-300",
    },
    pink: {
      cardCls: "clay-card-pink",
      labelCls: "text-slate-600 dark:text-pink-200/80",
      trendCls: "text-rose-500 dark:text-rose-300",
    },
    rose: {
      cardCls: "clay-card-pink",
      labelCls: "text-slate-600 dark:text-pink-200/80",
      trendCls: "text-rose-500 dark:text-rose-300",
    },
    mint: {
      cardCls: "clay-card-mint",
      labelCls: "text-slate-600 dark:text-emerald-200/80",
      trendCls: "text-emerald-600 dark:text-emerald-300",
    },
    emerald: {
      cardCls: "clay-card-mint",
      labelCls: "text-slate-600 dark:text-emerald-200/80",
      trendCls: "text-emerald-600 dark:text-emerald-300",
    },
    yellow: {
      cardCls: "clay-card-yellow",
      labelCls: "text-slate-600 dark:text-amber-200/80",
      trendCls: "text-amber-600 dark:text-amber-300",
    },
    amber: {
      cardCls: "clay-card-yellow",
      labelCls: "text-slate-600 dark:text-amber-200/80",
      trendCls: "text-amber-600 dark:text-amber-300",
    },
    blue: {
      cardCls: "clay-card-blue",
      labelCls: "text-slate-600 dark:text-blue-200/80",
      trendCls: "text-blue-600 dark:text-blue-300",
    },
  };

  const v = clayVariants[accent] || clayVariants.purple;

  return (
    <div
      className={`${v.cardCls} p-4 sm:p-5 flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 relative overflow-hidden group cursor-default shadow-xs hover:shadow-marshmallow`}
    >
      {/* Ambient hover light glow */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/25 dark:bg-white/5 blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

      {/* Left: 3D Clay Icon with subtle float */}
      <div className="shrink-0 transition-transform duration-300 group-hover:scale-115 group-hover:rotate-3 animate-float">
        {icon}
      </div>

      {/* Right / Center: Content */}
      <div className="min-w-0 flex-1 relative z-10">
        <p className={`text-xs font-semibold ${v.labelCls} truncate leading-tight`}>
          {label}
        </p>
        <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white truncate mt-0.5 tracking-tight group-hover:text-pink-600 dark:group-hover:text-pink-300 transition-colors">
          {value}
        </p>
        {(trend || subtext) && (
          <p className={`text-[11px] font-bold ${v.trendCls} mt-0.5 truncate flex items-center gap-1`}>
            {trend || subtext}
          </p>
        )}
      </div>
    </div>
  );
}
