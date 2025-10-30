// src/components/UsersRoleTable.tsx
import { useEffect, useMemo, useState } from "react";
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
import { Toggle } from "../buttons/Toggle";

type UserRow = {
  id: string;
  email?: string;
  username?: string;
  isAdmin?: boolean;
  isPremium?: boolean;
};

type Props = {
  /** Reserved table row slots to keep height consistent. */
  minRowSlots?: number;
  /** Spacing above the card so it doesn't collide with the ticket form. */
  topSpacingPx?: number;
};

export function UsersRoleTable({ minRowSlots = 10, topSpacingPx = 32 }: Props) {
  const db = getFirestore();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [search, setSearch] = useState("");

  async function loadPage(reset = false) {
    setLoading(true);
    const base = query(
      collection(db, "users"),
      orderBy("email", "asc"),
      limit(50)
    );
    const q = !reset && cursor ? query(base, startAfter(cursor)) : base;
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserRow));
    setRows((prev) => (reset ? data : [...prev, ...data]));
    setCursor(snap.docs[snap.docs.length - 1] ?? null);
    setLoading(false);
  }

  useEffect(() => {
    void loadPage(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sort: admins first, then premiums, then by email/uid
  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const aAdmin = a.isAdmin ? 1 : 0;
      const bAdmin = b.isAdmin ? 1 : 0;
      if (aAdmin !== bAdmin) return bAdmin - aAdmin;
      const aPrem = a.isPremium ? 1 : 0;
      const bPrem = b.isPremium ? 1 : 0;
      if (aPrem !== bPrem) return bPrem - aPrem;
      const ae = (a.email ?? a.id).toLowerCase();
      const be = (b.email ?? b.id).toLowerCase();
      return ae.localeCompare(be);
    });
  }, [rows]);

  // Client-side search
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((u) => {
      const email = (u.email ?? u.id).toLowerCase();
      const username = (u.username ?? "").toLowerCase();
      return email.includes(q) || username.includes(q);
    });
  }, [sorted, search]);

  const fillerCount = Math.max(0, minRowSlots - filtered.length);

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
    <section className="ticket card" style={{ marginTop: topSpacingPx }}>
      {/* Header */}
      <div className="ticket__header header--row">
        <div className="ticket__title">User Roles</div>

        {/* Right-aligned actions */}
        <div className="header__actions">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email or username…"
            className="field__input header__search"
          />
          <button
            className="btn"
            type="button"
            onClick={() => loadPage(true)}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="ticket__body">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Username</th>
                <th>Admin</th>
                <th>Premium</th>
              </tr>
            </thead>
            <tbody>
              {/* Real rows */}
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="row-inline">
                      {u.isAdmin && (
                        <span className="badge badge--green">ADMIN</span>
                      )}
                      {u.isPremium && !u.isAdmin && (
                        <span className="badge badge--amber">PREMIUM</span>
                      )}
                      <span>{u.email ?? u.id}</span>
                    </div>
                  </td>
                  <td>{u.username ?? "—"}</td>
                  <td>
                    <Toggle
                      checked={!!u.isAdmin}
                      onChange={(next) => toggle(u.id, "isAdmin", next)}
                      label="Admin toggle"
                    />
                  </td>
                  <td>
                    <Toggle
                      checked={!!u.isPremium}
                      onChange={(next) => toggle(u.id, "isPremium", next)}
                      label="Premium toggle"
                    />
                  </td>
                </tr>
              ))}

              {/* Filler rows to preserve height for minRowSlots */}
              {Array.from({ length: fillerCount }, (_, i) => (
                <tr key={`filler-${i}`} className="row-filler">
                  <td>—</td>
                  <td>—</td>
                  <td>
                    <div className="toggle-skeleton" />
                  </td>
                  <td>
                    <div className="toggle-skeleton" />
                  </td>
                </tr>
              ))}

              {/* Empty state inside reserved space */}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      textAlign: "center",
                      color: "#A1A1AA",
                      padding: "16px 0",
                    }}
                  >
                    No users match “{search}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="ticket__footer">
        <button
          className="btn"
          onClick={() => loadPage(false)}
          disabled={loading || !cursor}
          type="button"
        >
          {loading ? "Loading…" : cursor ? "Load more" : "No more"}
        </button>
        <div className="form-msg">
          Showing {Math.min(filtered.length, minRowSlots)} of {rows.length}
        </div>
      </div>

      {/* Local table styles that blend with your card system */}
      <style jsx>{`
        .table-wrap {
          width: 100%;
          overflow-x: auto;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }
        thead tr {
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        th,
        td {
          padding: 12px 16px;
          text-align: left;
          vertical-align: middle;
        }
        tbody tr {
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }
        tbody tr:hover {
          background: rgba(255, 255, 255, 0.03);
        }
        .row-inline {
          display: inline-flex;
          gap: 8px;
          align-items: center;
        }
        .badge {
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 999px;
          font-weight: 600;
        }
        .badge--green {
          background: rgba(16, 185, 129, 0.2);
          color: #86efac;
        }
        .badge--amber {
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
        }
        .row-filler td {
          color: #3f3f46;
          height: 48px;
        }
        .toggle-skeleton {
          width: 44px;
          height: 24px;
          border-radius: 999px;
          background: #2a2a2a;
        }
        .header--row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header__actions {
          margin-left: auto; /* 🔑 pushes actions to the right */
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .header__search {
          height: 46px;
          width: 300px;
          padding: 0 12px;
          font-size: 0.875rem;
        }

        /* Mobile: stack actions under the title, full width */
        @media (max-width: 640px) {
          .header--row {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }
          .header__actions {
            margin-left: 0;
            width: 100%;
            justify-content: space-between;
          }
          .header__search {
            flex: 1;
            max-width: none;
          }
        }
      `}</style>
    </section>
  );
}
