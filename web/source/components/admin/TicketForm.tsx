// web/src/components/TicketForm.tsx
import { useState } from "react";
import { createTicket, TicketInput } from "../../lib/tickets";

const initial: TicketInput = {
  sportsbook: "",
  league: "",
  market: "moneyline",
  selectionTeam: "",
  selectionSide: "",
  oddsAmerican: -110,
  externalUrl: "",
  description: "",
  pickType: "",
};

export default function TicketForm() {
  const [form, setForm] = useState<TicketInput>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const set = <K extends keyof TicketInput>(k: K, v: TicketInput[K]) =>
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
      const id = await createTicket(form);
      setMsg(`Ticket ${id} created`);
      setForm(initial);
    } catch (err: any) {
      setMsg(`${err?.message ?? "Failed to create ticket"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="ticket card ticket-form" onSubmit={onSubmit}>
      {/* header mimics your ticket display header */}
      <div className="ticket__header">
        <div className="ticket__title">Create Ticket</div>
        <div className="ticket__meta">
          <span>{new Date().toLocaleString()}</span>
        </div>
      </div>

      <div className="ticket__body grid-2">
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
          <span className="field__label">Side (e.g., Over, +1.5, Home)</span>
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
