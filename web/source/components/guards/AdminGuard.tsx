import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, getIdTokenResult } from "firebase/auth";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, async (u) => {
      if (!u) return setOk(false);
      const tok = await getIdTokenResult(u, true);
      setOk(!!tok.claims.isAdmin);
    });
  }, []);

  if (ok === null) return <div className="p-6">Checking admin…</div>;
  if (!ok) return <div className="p-6">Admins only.</div>;
  return <>{children}</>;
}
