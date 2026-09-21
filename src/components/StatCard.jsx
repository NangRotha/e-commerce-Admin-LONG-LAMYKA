export default function StatCard({ icon, label, value, accent = "pink" }) {
  const accents = {
    pink: "bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 border border-pink-200/70 dark:border-pink-900/50",
    emerald: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-900/50",
    blue: "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/70 dark:border-blue-900/50",
    amber: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/70 dark:border-amber-900/50",
    rose: "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/70 dark:border-rose-900/50",
  };

  return (
    <div className="bg-white dark:bg-[#160f1c] rounded-3xl border border-pink-100/80 dark:border-pink-950/50 p-5 flex items-center gap-4 shadow-xs transition-all duration-300 hover:shadow-lift hover:-translate-y-0.5">
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${accents[accent] || accents.pink}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-pink-200/60">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-white truncate mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
}
