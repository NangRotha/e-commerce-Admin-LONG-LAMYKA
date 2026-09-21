import { useCallback, useEffect, useMemo, useState } from "react";
import { ShieldCheck, User as UserIcon, Search, Trash2, Users as UsersIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../lib/format";
import Modal from "../components/Modal";
import { useRealtime } from "../context/RealtimeContext";

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    api
      .getUsers()
      .then(setUsers)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useRealtime("users_changed", load);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (users || []).filter(
      (u) =>
        !q ||
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q)
    );
  }, [users, search]);

  const changeRole = async (id, role) => {
    setUpdatingId(id);
    setError("");
    try {
      await api.updateUserRole(id, role);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirming) return;
    setDeleting(true);
    setError("");
    try {
      await api.deleteUser(confirming.id);
      setConfirming(null);
      await load();
    } catch (e) {
      setError(e.message);
      setConfirming(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/25 shrink-0">
            <UsersIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Registered Users
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {users ? `${users.length} accounts registered on store` : "Loading users..."}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users by name or email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-pink-100/80 dark:border-pink-950/70 bg-white dark:bg-[#150e1b] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 text-sm transition shadow-2xs"
        />
      </div>

      {users === null ? (
        <div className="luxury-card rounded-[28px] p-6 animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="luxury-card rounded-[28px] py-16 text-center text-slate-500 dark:text-slate-400">
          {users.length === 0 ? "No users registered yet." : "No users match your search."}
        </div>
      ) : (
        <div className="luxury-card rounded-[28px] overflow-hidden shadow-xs">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400 dark:text-pink-300/60 border-b border-pink-100/70 dark:border-pink-950/70 bg-pink-50/30 dark:bg-white/[0.02]">
                <th className="px-5 py-4 font-bold">User</th>
                <th className="px-4 py-4 font-bold">Email</th>
                <th className="px-4 py-4 font-bold">Role</th>
                <th className="px-4 py-4 font-bold">Verified</th>
                <th className="px-4 py-4 font-bold">Joined Date</th>
                <th className="px-5 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-100/60 dark:divide-pink-950/60">
              {filtered.map((u) => {
                const initial = (u.name?.[0] || u.email?.[0] || "U").toUpperCase();
                const isSelf = currentUser && currentUser.id === u.id;
                return (
                  <tr
                    key={u.id}
                    className="hover:bg-pink-50/20 dark:hover:bg-pink-950/20 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white font-black text-xs flex items-center justify-center shadow-2xs shrink-0">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {u.name || u.email.split("@")[0]}
                          </p>
                          {isSelf && (
                            <span className="text-[10px] font-bold text-pink-500 uppercase tracking-wide">
                              (You)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300 font-mono text-xs">
                      {u.email}
                    </td>

                    <td className="px-4 py-4">
                      {isSelf ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-pink-50 text-pink-700 dark:bg-pink-950/70 dark:text-pink-300 border border-pink-200/70 dark:border-pink-800/60 shadow-2xs">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Admin (Owner)</span>
                        </span>
                      ) : (
                        <select
                          value={u.role || "user"}
                          disabled={updatingId === u.id}
                          onChange={(e) => changeRole(u.id, e.target.value)}
                          className="px-3 py-1 rounded-xl text-xs font-bold border border-pink-100 dark:border-pink-950/70 bg-white dark:bg-[#181120] text-slate-700 dark:text-slate-200 cursor-pointer shadow-2xs focus:ring-2 focus:ring-pink-500/30"
                        >
                          <option value="user">Customer (User)</option>
                          <option value="admin">Administrator</option>
                        </select>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      {u.is_verified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Unverified</span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(u.created_at)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {!isSelf && (
                        <button
                          onClick={() => setConfirming(u)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete User Modal */}
      <Modal open={!!confirming} onClose={() => setConfirming(null)} title="Delete User">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to delete user{" "}
            <strong className="text-slate-900 dark:text-white">"{confirming?.email}"</strong>?
            This will permanently remove the user and their related account records.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={() => setConfirming(null)}
              className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete User"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
