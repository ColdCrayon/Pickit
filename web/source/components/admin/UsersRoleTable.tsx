import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { setUserRoles } from "../../lib/setRoles";

type UserRow = {
  id: string;
  email?: string;
  username?: string;
  isAdmin?: boolean;
  isPremium?: boolean;
};

export function UsersRoleTable() {
  const db = getFirestore();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  async function loadPage(reset = false) {
    setLoading(true);
    const base = query(
      collection(db, "users"),
      orderBy("email", "asc"),
      limit(25)
    );
    const q = !reset && cursor ? query(base, startAfter(cursor)) : base;
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserRow));
    setRows(reset ? data : [...rows, ...data]);
    setCursor(snap.docs[snap.docs.length - 1] ?? null);
    setLoading(false);
  }

  useEffect(() => {
    void loadPage(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggle(
    uid: string,
    key: "isAdmin" | "isPremium",
    val: boolean
  ) {
    const row = rows.find((r) => r.id === uid);
    if (!row) return;
    // optimistic UI
    setRows((prev) =>
      prev.map((r) => (r.id === uid ? { ...r, [key]: val } : r))
    );
    try {
      await setUserRoles({
        uid,
        isAdmin: key === "isAdmin" ? val : !!row.isAdmin,
        isPremium: key === "isPremium" ? val : !!row.isPremium,
      });
    } catch (e) {
      // revert on failure
      setRows((prev) =>
        prev.map((r) => (r.id === uid ? { ...r, [key]: !val } : r))
      );
      alert(`Failed to update roles: ${String(e)}`);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">User Roles</h1>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2 pr-4">Email</th>
            <th className="py-2 pr-4">Username</th>
            <th className="py-2 pr-4">Admin</th>
            <th className="py-2 pr-4">Premium</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="py-2 pr-4">{u.email ?? u.id}</td>
              <td className="py-2 pr-4">{u.username ?? "—"}</td>
              <td className="py-2 pr-4">
                <input
                  type="checkbox"
                  checked={!!u.isAdmin}
                  onChange={(e) => toggle(u.id, "isAdmin", e.target.checked)}
                />
              </td>
              <td className="py-2 pr-4">
                <input
                  type="checkbox"
                  checked={!!u.isPremium}
                  onChange={(e) => toggle(u.id, "isPremium", e.target.checked)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        className="px-4 py-2 rounded bg-black/80 text-white disabled:opacity-50"
        onClick={() => loadPage(false)}
        disabled={loading || !cursor}
      >
        {loading ? "Loading…" : cursor ? "Load more" : "No more"}
      </button>
    </div>
  );
}
