import Countdown from "@/components/Countdown";
import EntryForm from "@/components/EntryForm";
import Link from "next/link";

async function getStatus() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/status`, { cache: "no-store" });
  return res.json();
}

export default async function Page() {
  const status = await getStatus();
  const item = status.item;

  return (
    <main className="container grid">
      <div className="grid">
        <div>
          <h1 className="h1">One random item.<br />Every day. Free.</h1>
          <p className="p">Enter today’s drawing. If you win, we ship it. <b>No catch.</b></p>
          <div className="row" style={{marginTop:12}}>
            <span className="badge">
              Entries today: <b>{status.entries_today_count ?? 0}</b>
            </span>
            <span className="badge">
              Closes in: <b><Countdown initialSeconds={status.seconds_remaining ?? 0} /></b> <span className="small">(PT)</span>
            </span>
          </div>
        </div>

        <div className="card grid">
          <div className="row" style={{justifyContent:"space-between"}}>
            <div className="h2">Today’s item</div>
            <span className="badge">{status.today_date_pst}</span>
          </div>

          {item?.image_urls?.length ? (
            <div className="imggrid">
              {item.image_urls.map((u: string) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={u} src={u} alt="Today's item photo" />
              ))}
            </div>
          ) : (
            <div className="notice">No item posted yet for today. Check back soon.</div>
          )}

          <div>
            <div style={{fontSize:22, fontWeight:700}}>{item?.title ?? "—"}</div>
            <p className="p" style={{marginTop:6, whiteSpace:"pre-wrap"}}>{item?.description ?? ""}</p>
          </div>
        </div>

        <EntryForm isOpen={Boolean(status.is_open)} />

        <div className="card grid">
          <div className="h2">How it works</div>
          <ol className="p" style={{margin:0, paddingLeft:18}}>
            <li>We post one item every day.</li>
            <li>You enter (email only — no account).</li>
            <li>At midnight PT, we pick one random winner.</li>
            <li>We ship it. Free.</li>
          </ol>
          <div className="hr" />
          <div className="row" style={{justifyContent:"space-between"}}>
            <div className="kpi">
              <span className="small">Yesterday’s winner</span>
              <b>{status.yesterday_winner ? `${status.yesterday_winner.display_name} — ${status.yesterday_winner.display_state}` : "—"}</b>
            </div>
            <Link className="btn" href="/winners">Past winners</Link>
          </div>
        </div>

      </div>

      <div className="footer">
        <span>© {new Date().getFullYear()} No Catch</span>
        <span className="row" style={{gap:14}}>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </span>
      </div>
    </main>
  );
}
