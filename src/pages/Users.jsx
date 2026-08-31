import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, User as UserIcon, Search, Trash2 } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../lib/format";
import Modal from "../components/Modal";

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () =>
    api
      .getUsers()
      .then(setUsers)
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

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
        <h1 className="text-2xl font-extrabold text-slate-900">Users</h1>
        <p className="text-sm text-slate-500">
          {users ? `${users.length} registered users` : "Loading..."}
        </p>
      </div>

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
        />
      </div>

      {users === null ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-200 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-16 text-center text-slate-500">
          {users.length === 0 ? "No users yet." : "No users match your search."}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200">
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Verified</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {u.profile_image ? (
                        <img
                          src={u.profile_image}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                          {(u.name || u.email || "U").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-semibold text-slate-800">
                        {u.name}
                        {u.email === currentUser?.email && (
                          <span className="ml-2 text-xs font-medium text-slate-400">
                            (you)
                          </span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={u.role}
                        disabled={updatingId === u.id || u.email === currentUser?.email}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 ${
                          u.role === "admin"
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                        title={
                          u.email === currentUser?.email
                            ? "You cannot change your own role"
                            : "Change role"
                        }
                      >
                        <option value="user" className="text-slate-800">user</option>
                        <option value="admin" className="text-slate-800">admin</option>
                      </select>
                      {u.role === "admin" ? (
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <UserIcon className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {u.email_verified ? (
                      <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {formatDate(u.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => setConfirming(u)}
                        disabled={u.email === currentUser?.email || deleting}
                        title={
                          u.email === currentUser?.email
                            ? "You cannot delete your own account"
                            : "Delete user"
                        }
                        className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400"
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
        <p className="text-sm text-slate-600">
          Are you sure you want to delete{" "}
          <strong className="text-slate-900">
            {confirming?.name || confirming?.email}
          </strong>
          ? This will permanently remove the account
          {confirming?.email ? (
            <>
              {" "}
              (<span className="text-slate-900">{confirming.email}</span>)
            </>
          ) : null}{" "}
          along with their orders. This action cannot be undone.
        </p>
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={() => setConfirming(null)}
            disabled={deleting}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 transition text-sm disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete user"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
