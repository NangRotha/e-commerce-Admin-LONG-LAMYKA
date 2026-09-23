import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  Plus,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { api } from "../api/client";
import StatCard from "../components/StatCard";
import {
  CheckmarkBox3D,
  Calendar3D,
  Flag3D,
  Star3D,
  CheckCircle3D,
  Folder3D,
  ChatBubble3D,
  CloudUpload3D,
} from "../components/ClayIcons";
import { formatPrice } from "../lib/format";
import { useRealtime } from "../context/RealtimeContext";
import { useI18n } from "../i18n/I18nContext";

export default function Dashboard() {
  const { t } = useI18n();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [chartTimeframe, setChartTimeframe] = useState("This Week");

  // Interactive To-Do List state (persisted in localStorage)
  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem("admin_clay_todos");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: 1, text: "Design landing page 🎨", done: true },
      { id: 2, text: "Write project proposal 📝", done: false },
      { id: 3, text: "Team meeting 👥", done: false },
      { id: 4, text: "Review analytics 📊", done: false },
    ];
  });

  const [newTodoInput, setNewTodoInput] = useState("");
  const [showAddTodo, setShowAddTodo] = useState(false);

  // Calendar State
  const [calendarDate, setCalendarDate] = useState(() => new Date());

  const toggleTodo = (id) => {
    setTodos((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      );
      try {
        localStorage.setItem("admin_clay_todos", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (!newTodoInput.trim()) return;
    setTodos((prev) => {
      const updated = [
        ...prev,
        { id: Date.now(), text: newTodoInput.trim(), done: false },
      ];
      try {
        localStorage.setItem("admin_clay_todos", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setNewTodoInput("");
    setShowAddTodo(false);
  };

  const load = useCallback(() => {
    api
      .getStats()
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Real-time listeners
  useRealtime("orders_changed", load);
  useRealtime("products_changed", load);
  useRealtime("users_changed", load);

  // Calendar calculations
  const monthName = calendarDate.toLocaleString("default", { month: "long" });
  const year = calendarDate.getFullYear();
  const activeDay = calendarDate.getDate();

  const prevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  };

  // Generate calendar grid for current month
  const calendarGrid = useMemo(() => {
    const y = calendarDate.getFullYear();
    const m = calendarDate.getMonth();
    const firstDay = new Date(y, m, 1).getDay(); // 0 is Sunday
    // Convert to Monday = 0
    const startOffset = (firstDay + 6) % 7;
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const prevMonthDays = new Date(y, m, 0).getDate();

    const cells = [];
    // Previous month filler days
    for (let i = startOffset - 1; i >= 0; i--) {
      cells.push({ day: prevMonthDays - i, current: false });
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({ day: i, current: true, isToday: i === 15 || i === new Date().getDate() });
    }
    // Next month filler days to complete grid (up to 35 cells)
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      cells.push({ day: i, current: false });
    }
    return cells;
  }, [calendarDate]);

  // Fallback placeholder during loading or offline
  const totalProducts = stats?.total_products ?? 56;
  const totalOrders = stats?.total_orders ?? 24;
  const totalUsers = stats?.total_users ?? 8;
  const totalRevenue = stats?.total_revenue ? formatPrice(stats.total_revenue) : "18h";

  // Recent activity entries matching the image style
  const activityItems = [
    {
      id: 1,
      icon: CheckCircle3D,
      title: 'Completed "User Research"',
      time: "2h ago",
    },
    {
      id: 2,
      icon: Folder3D,
      title: 'Updated project "Website Redesign"',
      time: "5h ago",
    },
    {
      id: 3,
      icon: ChatBubble3D,
      title: "New message from Sarah",
      time: "1d ago",
    },
    {
      id: 4,
      icon: CloudUpload3D,
      title: "Uploaded report.pdf",
      time: "2d ago",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-7 animate-fade-in">
      {/* ===== Top Row: 4 Pastel Clay Stat Cards ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          icon={<CheckmarkBox3D className="w-12 h-12" />}
          label="Tasks Done"
          value={totalOrders}
          accent="purple"
          trend="+12% from yesterday"
        />
        <StatCard
          icon={<Calendar3D className="w-12 h-12" />}
          label="In Progress"
          value={totalUsers}
          accent="pink"
          trend="2 projects"
        />
        <StatCard
          icon={<Flag3D className="w-12 h-12" />}
          label="Completed"
          value={totalProducts}
          accent="mint"
          trend="This month"
        />
        <StatCard
          icon={<Star3D className="w-12 h-12" />}
          label="Focus Time"
          value={totalRevenue}
          accent="yellow"
          trend="+4h from last week"
        />
      </div>

      {/* ===== Main Grid Layout (Left 65% / Right 35%) ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Span 8): Productivity Overview & Recent Activity */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Productivity Overview Chart */}
          <div className="clay-card p-5 sm:p-7 relative overflow-hidden">
            {/* Header with Timeframe Dropdown */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-white tracking-tight">
                Productivity Overview
              </h2>
              <div className="relative">
                <select
                  value={chartTimeframe}
                  onChange={(e) => setChartTimeframe(e.target.value)}
                  className="appearance-none bg-slate-100/80 dark:bg-purple-950/40 hover:bg-slate-200/80 text-slate-700 dark:text-purple-200 text-xs font-bold py-1.5 pl-3.5 pr-7 rounded-full border border-purple-100 dark:border-purple-900/40 shadow-2xs cursor-pointer outline-none transition"
                >
                  <option value="This Week">This Week ▾</option>
                  <option value="Last Week">Last Week ▾</option>
                  <option value="This Month">This Month ▾</option>
                </select>
              </div>
            </div>

            {/* Smooth SVG Spline Chart */}
            <div className="relative w-full h-56 sm:h-64 pt-6 select-none">
              {/* Y-axis guideline levels */}
              <div className="absolute inset-y-6 left-0 w-8 flex flex-col justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500 text-right pr-2">
                <span>100</span>
                <span>75</span>
                <span>50</span>
                <span>25</span>
                <span>0</span>
              </div>

              {/* Chart Plot Area */}
              <div className="ml-9 mr-2 h-full relative">
                {/* Horizontal Guide Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="border-b border-purple-100/60 dark:border-purple-950/40 w-full" />
                  <div className="border-b border-purple-100/60 dark:border-purple-950/40 w-full" />
                  <div className="border-b border-purple-100/60 dark:border-purple-950/40 w-full" />
                  <div className="border-b border-purple-100/60 dark:border-purple-950/40 w-full" />
                  <div className="border-b border-purple-200/60 dark:border-purple-900/40 w-full" />
                </div>

                {/* SVG Curve & Dots */}
                <svg
                  viewBox="0 0 700 220"
                  className="w-full h-[calc(100%-24px)] overflow-visible"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9873e8" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#9873e8" stopOpacity="0.0" />
                    </linearGradient>
                    <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#8b5cf6" floodOpacity="0.4" />
                    </filter>
                  </defs>

                  {/* Area Fill */}
                  <path
                    d="M 50 160 Q 150 145, 170 110 T 290 65 T 410 95 T 530 50 T 650 50 L 650 210 L 50 210 Z"
                    fill="url(#chartGrad)"
                  />

                  {/* Main Line Curve */}
                  <path
                    d="M 50 160 Q 150 145, 170 110 T 290 65 T 410 95 T 530 50 T 650 50"
                    fill="none"
                    stroke="#9873e8"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data Points */}
                  {[
                    { cx: 50, cy: 160 },
                    { cx: 170, cy: 110 },
                    { cx: 290, cy: 65 },
                    { cx: 410, cy: 95 },
                    { cx: 530, cy: 50 },
                    { cx: 650, cy: 50 },
                  ].map((pt, i) => (
                    <circle
                      key={i}
                      cx={pt.cx}
                      cy={pt.cy}
                      r="5.5"
                      fill="#8b5cf6"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      filter="url(#nodeGlow)"
                      className="transition-transform duration-200 hover:scale-150 cursor-pointer"
                    />
                  ))}
                </svg>

                {/* Floating "Great job! 🎉" Speech Bubble Tooltip matching the image */}
                <div
                  className="absolute z-10 pointer-events-none"
                  style={{ left: "70%", top: "8%", transform: "translate(-50%, -100%)" }}
                >
                  <div className="relative bg-[#a78bfa] text-white text-[11px] font-bold px-3 py-1 rounded-xl shadow-md flex items-center gap-1">
                    <span>Great job!</span>
                    <span>🎉</span>
                    {/* Tooltip triangle tail */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-5 border-t-[#a78bfa]" />
                  </div>
                </div>

                {/* X-axis Day Labels */}
                <div className="absolute bottom-0 inset-x-0 flex justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500 px-4">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Recent Activity matching the image */}
          <div className="clay-card p-5 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-white tracking-tight">
                Recent Activity
              </h2>
              <Link
                to="/orders"
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                <span>Store Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-purple-100/60 dark:divide-purple-950/40">
              {activityItems.map((act) => {
                const IconComponent = act.icon;
                return (
                  <div
                    key={act.id}
                    className="py-3 sm:py-3.5 flex items-center justify-between gap-3 group hover:translate-x-1 transition-transform"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0 transition-transform duration-200 group-hover:scale-110">
                        <IconComponent className="w-7 h-7" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
                        {act.title}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 shrink-0">
                      {act.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (Span 4): To-Do List, Calendar, Motivation Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: To-Do List (Soft Pink Card) */}
          <div className="clay-card-pink p-5">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="font-black text-slate-800 dark:text-white text-base">
                To-Do List
              </h3>
              <button
                type="button"
                onClick={() => setShowAddTodo(!showAddTodo)}
                className="w-6 h-6 rounded-full bg-[#ff7b8f] text-white flex items-center justify-center font-bold text-sm shadow-2xs hover:scale-110 active:scale-95 transition"
                title="Add task"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Add Form */}
            {showAddTodo && (
              <form onSubmit={handleAddTodo} className="mb-3 flex gap-2">
                <input
                  type="text"
                  value={newTodoInput}
                  onChange={(e) => setNewTodoInput(e.target.value)}
                  placeholder="New task..."
                  className="flex-1 text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-pink-200 dark:border-pink-900 outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-bold text-white bg-[#ff7b8f] rounded-xl shadow-xs"
                >
                  Add
                </button>
              </form>
            )}

            {/* To-Do Items with custom clay checkboxes */}
            <div className="space-y-2.5">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  onClick={() => toggleTodo(todo.id)}
                  className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-white/40 dark:hover:bg-white/5 cursor-pointer transition select-none"
                >
                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                      todo.done
                        ? "bg-[#5ecb8b] text-white shadow-xs"
                        : "border-2 border-slate-300 dark:border-pink-300/40 bg-white dark:bg-pink-950/40"
                    }`}
                  >
                    {todo.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span
                    className={`text-xs font-bold transition-all truncate ${
                      todo.done
                        ? "text-slate-400 line-through"
                        : "text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {todo.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Calendar Widget (Soft Blue Card) */}
          <div className="clay-card-blue p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-slate-800 dark:text-white text-base">
                Calendar
              </h3>
              <button
                type="button"
                className="text-[11px] font-bold text-blue-600 dark:text-blue-300 bg-white/80 dark:bg-blue-950/60 hover:bg-white px-2.5 py-0.5 rounded-full shadow-2xs transition"
              >
                View all
              </button>
            </div>

            {/* Month Switcher */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 mb-2.5 px-1">
              <button
                onClick={prevMonth}
                className="p-1 hover:bg-white/60 dark:hover:bg-white/10 rounded-lg transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-black">
                {monthName} {year}
              </span>
              <button
                onClick={nextMonth}
                className="p-1 hover:bg-white/60 dark:hover:bg-white/10 rounded-lg transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 text-center text-[10px] font-black text-slate-400 dark:text-blue-300/70 mb-1.5">
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
              <span>S</span>
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-y-1.5 text-center text-[11px] font-bold">
              {calendarGrid.map((c, i) => (
                <div key={i} className="flex items-center justify-center">
                  <span
                    className={`w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                      c.isToday
                        ? "bg-[#8b5cf6] text-white font-black shadow-xs shadow-purple-500/40 scale-110"
                        : c.current
                        ? "text-slate-700 dark:text-slate-200 hover:bg-white/70"
                        : "text-slate-300 dark:text-blue-300/30"
                    }`}
                  >
                    {c.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Motivation Card with 3D Bunny holding heart */}
          <div className="clay-card-purple p-5 flex items-center justify-between gap-3 relative overflow-hidden group">
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-black text-purple-900 dark:text-purple-100 leading-tight">
                You're doing amazing!
              </h4>
              <p className="text-xs font-bold text-purple-600 dark:text-purple-300 mt-1 flex items-center gap-1">
                <span>Keep up the good work</span>
                <span>✨</span>
              </p>
            </div>
            <div className="w-18 h-18 shrink-0 rounded-2xl overflow-hidden shadow-xs border border-white/80 bg-white/40">
              <img
                src="/bunny_clay.jpg"
                alt="Clay Bunny Mascot"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
