import { useState } from "react";
import { createTicket, TicketInput } from "../../lib/tickets";

const initial: TicketInput & { settleDate?: string | null } = {
  sportsbook: "",
  league: "",
  market: "moneyline",
  selectionTeam: "",
  selectionSide: "",
  oddsAmerican: -110,
  externalUrl: "",
  description: "",
  pickType: "",
  settleDate: null,
};

export default function TicketForm() {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);

    if (
      !form.sportsbook ||
      !form.league ||
      !form.market ||
      !form.oddsAmerican
    ) {
      setBusy(false);
      setMsg("Please fill sportsbook, league, market, and odds.");
      return;
    }

    try {
      const id = await createTicket({
        sportsbook: form.sportsbook,
        league: form.league,
        market: form.market,
        selectionTeam: form.selectionTeam,
        selectionSide: form.selectionSide,
        oddsAmerican: form.oddsAmerican,
        externalUrl: form.externalUrl,
        description: form.description,
        pickType: form.pickType,
        ...(form.settleDate ? { settleDate: form.settleDate } : {}),
      } as any);

      setMsg(`Ticket ${id} created`);
      setForm(initial);
    } catch (err: any) {
      setMsg(`${err?.message ?? "Failed to create ticket"}`);
    } finally {
      setBusy(false);
    }
  }

  function onDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value; // yyyy-mm-dd
    if (!val) return set("settleDate", null);
    const date = new Date(val);
    date.setHours(23, 59, 59, 0); // local 11:59:59 PM
    set("settleDate", date.toISOString());
  }

  return (
    <form className="ticket card ticket-form" onSubmit={onSubmit}>
      <div className="ticket__header">
        <div className="ticket__title">Create Ticket</div>
        <div className="ticket__meta">
          <span>{new Date().toLocaleString()}</span>
        </div>
      </div>

      <div className="ticket__body grid-2">
        {/* --- all the normal fields --- */}

        <label className="field">
          <span className="field__label">Sportsbook</span>
          <input
            className="field__input"
            value={form.sportsbook}
            onChange={(e) => set("sportsbook", e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span className="field__label">League</span>
          <input
            className="field__input"
            value={form.league}
            onChange={(e) => set("league", e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span className="field__label">Market</span>
          <select
            className="field__input"
            value={form.market}
            onChange={(e) => set("market", e.target.value as any)}
          >
            <option value="moneyline">Moneyline</option>
            <option value="spread">Spread</option>
            <option value="total">Total</option>
            <option value="prop">Prop</option>
          </select>
        </label>

        <label className="field">
          <span className="field__label">Team / Selection</span>
          <input
            className="field__input"
            value={form.selectionTeam ?? ""}
            onChange={(e) => set("selectionTeam", e.target.value)}
          />
        </label>

        <label className="field">
          <span className="field__label">Side (Over, +1.5, Home)</span>
          <input
            className="field__input"
            value={form.selectionSide ?? ""}
            onChange={(e) => set("selectionSide", e.target.value)}
          />
        </label>

        <label className="field">
          <span className="field__label">Odds (American)</span>
          <input
            className="field__input"
            type="number"
            value={form.oddsAmerican}
            onChange={(e) => set("oddsAmerican", Number(e.target.value))}
            required
          />
        </label>

        <label className="field grid-span-2">
          <span className="field__label">Sportsbook Link (optional)</span>
          <input
            className="field__input"
            value={form.externalUrl ?? ""}
            onChange={(e) => set("externalUrl", e.target.value)}
          />
        </label>

        <label className="field grid-span-2">
          <span className="field__label">Description (optional)</span>
          <textarea
            className="field__input"
            rows={3}
            value={form.description ?? ""}
            onChange={(e) => set("description", e.target.value)}
          />
        </label>

        <label className="field grid-span-2">
          <span className="field__label">Pick Type (optional)</span>
          <input
            className="field__input"
            placeholder="moneyline / spread / total / prop…"
            value={form.pickType ?? ""}
            onChange={(e) => set("pickType", e.target.value)}
          />
        </label>

        {/* --- new date field --- */}
        <label className="field grid-span-2">
          <span className="field__label">Settle Date</span>
          <input
            className="field__input"
            type="date"
            value={
              form.settleDate
                ? new Date(form.settleDate).toISOString().slice(0, 10)
                : ""
            }
            onChange={onDateChange}
          />
          <small className="field__hint">
            Automatically sets to 11:59 PM local time
          </small>
        </label>
      </div>

      <div className="ticket__footer">
        <button className="btn btn-primary" disabled={busy}>
          {busy ? "Saving…" : "Publish Ticket"}
        </button>
        {msg && <div className="form-msg">{msg}</div>}
      </div>
    </form>
  );
}
