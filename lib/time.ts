/**
 * Time helpers in America/Los_Angeles without external deps.
 * We compute:
 * - today's date in PT (YYYY-MM-DD)
 * - next midnight PT as a Date (UTC-based)
 */
export const PT_TZ = "America/Los_Angeles";

export function getPTParts(d: Date) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: PT_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = dtf.formatToParts(d);
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? "";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    second: Number(get("second")),
  };
}

export function ptDateString(d: Date): string {
  const p = getPTParts(d);
  const mm = String(p.month).padStart(2, "0");
  const dd = String(p.day).padStart(2, "0");
  return `${p.year}-${mm}-${dd}`;
}

export function nextMidnightPT(from: Date): Date {
  // Construct "tomorrow 00:00:00 PT" by taking PT date parts and advancing by 1 day.
  const p = getPTParts(from);
  // Create a Date from PT parts by formatting in PT and parsing as if local is UTC (workaround):
  // We compute the UTC timestamp for PT midnight via Intl by building an ISO-like string and using Date.UTC
  // Then adjust using the offset between PT-local representation and UTC representation.
  // Simpler: compute tomorrow's PT date parts, then find the UTC instant that formats to 00:00:00 in PT.
  const today = new Date(from.getTime());
  const todayPT = ptDateString(today);

  const [y, m, d] = todayPT.split("-").map(Number);
  // naive next day
  const next = new Date(Date.UTC(y, m - 1, d, 12, 0, 0)); // noon UTC to avoid DST issues on date roll
  next.setUTCDate(next.getUTCDate() + 1);

  const nextPT = ptDateString(next);
  const [ny, nm, nd] = nextPT.split("-").map(Number);

  // Find the UTC instant that corresponds to 00:00:00 PT on ny-nm-nd.
  // We'll binary search around an initial guess.
  const guess = new Date(Date.UTC(ny, nm - 1, nd, 8, 0, 0)); // ~ midnight PT is usually 08:00 UTC (varies with DST)
  let lo = new Date(guess.getTime() - 36 * 3600 * 1000);
  let hi = new Date(guess.getTime() + 36 * 3600 * 1000);

  for (let i = 0; i < 50; i++) {
    const mid = new Date((lo.getTime() + hi.getTime()) / 2);
    const mp = getPTParts(mid);
    const midPT = `${mp.year}-${String(mp.month).padStart(2,"0")}-${String(mp.day).padStart(2,"0")} ${String(mp.hour).padStart(2,"0")}:${String(mp.minute).padStart(2,"0")}:${String(mp.second).padStart(2,"0")}`;
    const target = `${ny}-${String(nm).padStart(2,"0")}-${String(nd).padStart(2,"0")} 00:00:00`;
    if (midPT < target) lo = mid; else hi = mid;
  }
  // hi should be at/after midnight; snap to the exact second by stepping back until we hit 00:00:00 PT
  let t = hi;
  for (let j = 0; j < 120; j++) {
    const tp = getPTParts(t);
    if (tp.year === ny && tp.month === nm && tp.day === nd && tp.hour === 0 && tp.minute === 0 && tp.second === 0) return t;
    t = new Date(t.getTime() - 1000);
  }
  return hi;
}

export function secondsUntilNextMidnightPT(now: Date): number {
  const nm = nextMidnightPT(now);
  return Math.max(0, Math.floor((nm.getTime() - now.getTime()) / 1000));
}
