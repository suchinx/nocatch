import Link from "next/link";

async function getWinners() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/winners?limit=60`, { cache: "no-store" });
  return res.json();
}

export default async function WinnersPage() {
  const data = await getWinners();
  const winners = data.winners ?? [];

  return (
    <main className="container grid">
      <div className="row" style={{justifyContent:"space-between"}}>
        <div>
          <h1 className="h1" style={{fontSize:34}}>Past winners</h1>
          <p className="p">First name + state only.</p>
        </div>
        <Link className="btn" href="/">Back</Link>
      </div>

      <div className="grid">
        {winners.length === 0 ? (
          <div className="notice">No winners yet.</div>
        ) : winners.map((w: any) => (
          <div key={w.date_pst} className="card grid">
            <div className="row" style={{justifyContent:"space-between"}}>
              <span className="badge">{w.date_pst}</span>
              <span className="badge">{w.display_name} — {w.display_state}</span>
            </div>
            <div style={{fontSize:18, fontWeight:700}}>{w.item_title ?? "Item"}</div>
            {w.item_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={w.item_image_url} alt="Item" style={{width:"100%", height:220, objectFit:"cover", borderRadius:14, border:"1px solid var(--border)"}} />
            ) : null}
            {typeof w.entries_count === "number" ? <div className="small">Entries that day: {w.entries_count}</div> : null}
          </div>
        ))}
      </div>
    </main>
  );
}
