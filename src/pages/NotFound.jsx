import { Link } from "react-router-dom";
import { LayoutDashboard, Package, ArrowLeft, ShieldAlert } from "lucide-react";
import { useI18n } from "../i18n/I18nContext";

/**
 * 404 Page Not Found — Admin Dashboard
 * Responsive, dark & light mode support, clean admin aesthetic
 */
export default function NotFound() {
  const { t } = useI18n();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full text-center bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-8 shadow-xs animate-fade-in-up">
        {/* Icon & 404 Pill */}
        <div className="w-16 h-16 rounded-2xl bg-pink-50 dark:bg-pink-950/40 border border-pink-100 dark:border-pink-900/60 flex items-center justify-center text-pink-600 dark:text-pink-400 mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-300 border border-pink-200/60 dark:border-pink-900/50 mb-3">
          Error 404
        </span>

        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {t("notFound.title") || "រកមិនឃើញទំព័រនេះទេ"}
        </h1>

        <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {t("notFound.desc") ||
            "ទំព័រគ្រប់គ្រងដែលអ្នកចង់បើកមិនមានក្នុងប្រព័ន្ធ Admin ឡើយ ឬត្រូវបានប្តូរឈ្មោះ។"}
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs sm:text-sm shadow-sm shadow-pink-500/25 transition-all duration-200 active:scale-95"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{t("notFound.backDashboard") || "ទៅកាន់ផ្ទាំងគ្រប់គ្រង"}</span>
          </Link>

          <Link
            to="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all duration-200 active:scale-95"
          >
            <Package className="w-4 h-4" />
            <span>{t("notFound.viewProducts") || "មើលបញ្ជីផលិតផល"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
