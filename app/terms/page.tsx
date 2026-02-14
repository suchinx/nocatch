import Link from "next/link";

export default function Terms() {
  return (
    <main className="container grid">
      <div className="row" style={{justifyContent:"space-between"}}>
        <h1 className="h1" style={{fontSize:34}}>Terms</h1>
        <Link className="btn" href="/">Back</Link>
      </div>
      <div className="card grid">
        <p className="p">
          No Catch is a free daily drawing. No purchase is required.
          Eligibility is limited to U.S. residents.
        </p>
        <p className="p">
          Items are provided “as-is.” We’ll cover standard shipping within the U.S.
          We reserve the right to forfeit a winner if we cannot confirm a deliverable address within a reasonable time.
        </p>
        <p className="p">
          We may modify or discontinue the service at any time.
        </p>
        <p className="small">Last updated: {new Date().toISOString().slice(0,10)}</p>
      </div>
    </main>
  );
}
