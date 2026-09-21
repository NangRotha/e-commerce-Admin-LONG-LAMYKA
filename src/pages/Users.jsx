import { useCallback, useEffect, useMemo, useState } from "react";
import { ShieldCheck, User as UserIcon, Search, Trash2 } from "lucide-react";
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

  // Real-time: User role ឬ Delete user ត្រូវបានកែប្រែ -> ផ្ទុកឡើងវិញភ្លាមៗ
  useRealtime("users_changed", load);


  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (users || []).filter(
      (u) =>
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
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
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Users</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {users ? `${users.length} registered users` : "Loading..."}
        </p>
      </div>

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 text-sm transition shadow-2xs"
        />
      </div>

      {users === null ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-pink-200 dark:border-slate-800 py-16 text-center text-slate-500 dark:text-slate-400">
          {users.length === 0 ? "No users yet." : "No users match your search."}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                <th className="px-5 py-3.5 font-bold">User</th>
                <th className="px-5 py-3.5 font-bold">Email</th>
                <th className="px-5 py-3.5 font-bold">Role</th>
                <th className="px-5 py-3.5 font-bold">Verified</th>
                <th className="px-5 py-3.5 font-bold">Joined</th>
                <th className="px-5 py-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-pink-50/20 dark:hover:bg-pink-950/10 transition">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {u.profile_image ? (
                        <img
                          src={u.profile_image}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover border border-pink-200 dark:border-pink-900/50 shrink-0"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-400 border border-pink-200/60 dark:border-pink-800/50 flex items-center justify-center font-bold shrink-0">
                          {(u.name || u.email || "U").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-semibold text-slate-800 dark:text-white">
                        {u.name}
                        {u.email === currentUser?.email && (
                          <span className="ml-2 text-xs font-semibold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/50 px-2 py-0.5 rounded-full border border-pink-200/50 dark:border-pink-900/50">
                            (you)
                          </span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <select
                        value={u.role}
                        disabled={updatingId === u.id || u.email === currentUser?.email}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-500/30 disabled:opacity-50 ${
                          u.role === "admin"
                            ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                        title={
                          u.email === currentUser?.email
                            ? "You cannot change your own role"
                            : "Change role"
                        }
                      >
                        <option value="user" className="text-slate-800 dark:bg-slate-800 dark:text-white">user</option>
                        <option value="admin" className="text-slate-800 dark:bg-slate-800 dark:text-white">admin</option>
                      </select>
                      {u.role === "admin" ? (
                        <ShieldCheck className="w-4 h-4 text-pink-500 dark:text-pink-400" />
                      ) : (
                        <UserIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {u.email_verified ? (
                      <span className="text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatDate(u.created_at)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => setConfirming(u)}
                        disabled={u.email === currentUser?.email || deleting}
                        title={
                          u.email === currentUser?.email
                            ? "You cannot delete your own account"
                            : "Delete user"
                        }
                        className="p-2 rounded-xl text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400"
                        aria-label="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!confirming}
        onClose={() => !deleting && setConfirming(null)}
        title="Delete user"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to delete{" "}
          <strong className="text-slate-900 dark:text-white">
            {confirming?.name || confirming?.email}
          </strong>
          ? This will permanently remove the account
          {confirming?.email ? (
            <>
              {" "}
              (<span className="text-pink-600 dark:text-pink-400 font-medium">{confirming.email}</span>)
            </>
          ) : null}{" "}
          along with their orders. This action cannot be undone.
        </p>
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={() => setConfirming(null)}
            disabled={deleting}
            className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm shadow-rose-600/25 active:scale-[0.98] transition-all text-sm disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete user"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
