import Link from "next/link";

export default function Privacy() {
  return (
    <main className="container grid">
      <div className="row" style={{justifyContent:"space-between"}}>
        <h1 className="h1" style={{fontSize:34}}>Privacy</h1>
        <Link className="btn" href="/">Back</Link>
      </div>
      <div className="card grid">
        <p className="p">
          No Catch collects your email to operate the daily drawing and contact you if you win.
          We do not sell your email.
        </p>
        <p className="p">
          If you provide a first name and/or state, we may display a winner name + state publicly.
          If you don’t provide them, we generate a playful display name/state tied to your email for consistency.
        </p>
        <p className="p">
          Operational emails may include entry confirmation (optional) and winner notifications.
        </p>
        <p className="small">Last updated: {new Date().toISOString().slice(0,10)}</p>
      </div>
    </main>
  );
}
