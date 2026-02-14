"use client";

import { useEffect, useState } from "react";

type Item = {
  date_pst: string;
  title: string;
  description: string;
  image_urls: string[];
  is_open: boolean;
};

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string>("");
  const [isOpen, setIsOpen] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const k = window.localStorage.getItem("nocatch_admin_key");
    if (k) { setKey(k); setSaved(true); }
  }, []);

  function saveKey() {
    window.localStorage.setItem("nocatch_admin_key", key);
    setSaved(true);
    setMsg("Admin key saved on this device.");
  }

  async function upsertItem() {
    setMsg(null);
    const image_urls = images.split(/\s+/).map(s => s.trim()).filter(Boolean);
    const res = await fetch("/api/admin/item", {
      method: "POST",
      headers: { "Content-Type":"application/json", "x-admin-key": key },
      body: JSON.stringify({ title, description, image_urls, is_open: isOpen })
    });
    const data = await res.json();
    if (!res.ok) { setMsg(data?.error || "Error"); return; }
    setMsg("Saved today’s item ✅");
  }

  async function toggle(open: boolean) {
    setMsg(null);
    const res = await fetch("/api/admin/toggle-open", {
      method: "POST",
      headers: { "Content-Type":"application/json", "x-admin-key": key },
      body: JSON.stringify({ is_open: open })
    });
    const data = await res.json();
    if (!res.ok) { setMsg(data?.error || "Error"); return; }
    setIsOpen(open);
    setMsg(open ? "Opened ✅" : "Closed ✅");
  }

  async function pickWinner() {
    setMsg(null);
    const res = await fetch("/api/admin/pick-winner", {
      method: "POST",
      headers: { "Content-Type":"application/json", "x-admin-key": key },
      body: JSON.stringify({})
    });
    const data = await res.json();
    if (!res.ok) { setMsg(data?.error || "Error"); return; }
    if (data.already_picked) setMsg("Winner already picked for that date.");
    else setMsg(`Winner picked: ${data.winner_public?.name} — ${data.winner_public?.state}`);
  }

  return (
    <main className="container grid">
      <h1 className="h1" style={{fontSize:34}}>Admin</h1>

      <div className="card grid">
        <div className="h2">Admin key</div>
        <div className="row">
          <input className="input" value={key} onChange={e=>setKey(e.target.value)} placeholder="ADMIN_KEY" />
          <button className="btn" onClick={saveKey}>Save</button>
        </div>
        <div className="small">Stored only in your browser localStorage.</div>
      </div>

      <div className="card grid">
        <div className="h2">Today’s item</div>
        <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" />
        <textarea className="input" value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" rows={5} />
        <textarea className="input" value={images} onChange={e=>setImages(e.target.value)} placeholder="Image URLs (space-separated)" rows={3} />
        <div className="row">
          <button className="btn" onClick={upsertItem}>Save item</button>
          <button className="btn" onClick={() => toggle(true)}>Open</button>
          <button className="btn" onClick={() => toggle(false)}>Close</button>
          <button className="btn" onClick={pickWinner}>Pick winner now</button>
          <span className="badge">{isOpen ? "OPEN" : "CLOSED"}</span>
        </div>
      </div>

      {msg && <div className="notice">{msg}</div>}
      <div className="small">Tip: upload images to Supabase Storage later; for v1 you can paste URLs from anywhere.</div>
    </main>
  );
}
