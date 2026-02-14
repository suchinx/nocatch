"use client";

import { useEffect, useState } from "react";
import { US_STATES } from "@/lib/display";

type Props = {
  isOpen: boolean;
  initialEmail?: string | null;
  onEntered?: (newCount?: number) => void;
};

export default function EntryForm({ isOpen, initialEmail, onEntered }: Props) {
  const [email, setEmail] = useState(initialEmail ?? "");
  const [first, setFirst] = useState("");
  const [state, setState] = useState("");
  const [us, setUs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("nocatch_email");
    if (saved && !email) setEmail(saved);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit() {
    setMsg(null);
    if (!isOpen) { setMsg("Today's drawing is closed."); return; }
    if (!email) { setMsg("Email is required."); return; }
    if (!us) { setMsg("Please confirm you're in the U.S."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/enter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, first_name: first, state, us_confirmed: us })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to enter");
      window.localStorage.setItem("nocatch_email", email.trim().toLowerCase());
      if (data.already_entered) setMsg("You’re already entered for today ✅");
      else setMsg("You’re entered for today ✅");
      if (typeof data.entries_today_count === "number") onEntered?.(data.entries_today_count);
    } catch (e: any) {
      setMsg(e?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card grid">
      <div className="row" style={{justifyContent:"space-between"}}>
        <div>
          <div className="h2">Enter today’s drawing</div>
          <p className="p">Email required. No accounts.</p>
        </div>
        <span className="badge">{isOpen ? "OPEN" : "CLOSED"}</span>
      </div>

      <div className="grid" style={{gridTemplateColumns:"1fr 1fr", gap:12}}>
        <div style={{gridColumn:"1 / -1"}}>
          <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com" />
        </div>
        <input className="input" value={first} onChange={e=>setFirst(e.target.value)} placeholder="First name (optional)" />
        <select className="select" value={state} onChange={e=>setState(e.target.value)}>
          <option value="">State (optional)</option>
          {US_STATES.map(([abbr,name]) => <option key={abbr} value={abbr}>{name}</option>)}
        </select>
        <label className="row" style={{gridColumn:"1 / -1", color:"var(--muted)", fontSize:13}}>
          <input type="checkbox" checked={us} onChange={e=>setUs(e.target.checked)} />
          I live in the U.S.
        </label>
      </div>

      <button className="btn" onClick={submit} disabled={loading || !isOpen}>
        {loading ? "Entering..." : "Enter Today"}
      </button>

      {msg && <div className="notice">{msg}</div>}
      <div className="small">Tip: we’ll remember your email on this device so tomorrow takes ~1 second.</div>
    </div>
  );
}
