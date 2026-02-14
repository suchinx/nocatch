export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";

function getTodayDatePst(offsetDays = 0) {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(now);
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  const base = new Date(`${y}-${m}-${d}T00:00:00-08:00`);
  base.setDate(base.getDate() + offsetDays);
  const y2 = base.getFullYear();
  const m2 = String(base.getMonth() + 1).padStart(2, "0");
  const d2 = String(base.getDate()).padStart(2, "0");
  return `${y2}-${m2}-${d2}`;
}

function getCloseTimeIso() {
  // Close is NEXT midnight in America/Los_Angeles
  const tomorrow = getTodayDatePst(1);

  // Best-effort: handle DST by reading the LA offset (GMT-7 or GMT-8)
  const probe = new Date(); // "now"
  const tzName = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    timeZoneName: "shortOffset",
  })
    .formatToParts(probe)
    .find((p) => p.type === "timeZoneName")?.value || "GMT-8";

  // tzName looks like "GMT-8" or "GMT-7"
  const match = tzName.match(/GMT([+-]\d+)/);
  const offsetHours = match ? parseInt(match[1], 10) : -8;

  // LA midnight -> UTC is +8h in standard time, +7h in daylight time
  const utcHour = offsetHours === -7 ? 7 : 8;

  return new Date(`${tomorrow}T0${utcHour}:00:00.000Z`).toISOString();
}

export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const now_iso = new Date().toISOString();
  const today_date_pst = getTodayDatePst();
  const yesterday_date_pst = getTodayDatePst(-1);

  const { data: item } = await supabase
    .from("items")
    .select("*")
    .eq("date_pst", today_date_pst)
    .maybeSingle();

  const { count: entries_today_count } = await supabase
    .from("entries")
    .select("*", { count: "exact", head: true })
    .eq("date_pst", today_date_pst);

  const { data: yesterday_winner } = await supabase
    .from("winners_view")
    .select("*")
    .eq("date_pst", yesterday_date_pst)
    .maybeSingle();

  // Seconds remaining until close (best-effort display)
  const close_time_iso = getCloseTimeIso();
  const seconds_remaining = Math.max(
    0,
    Math.floor((new Date(close_time_iso).getTime() - Date.now()) / 1000)
  );

  return Response.json(
    {
      now_iso,
      today_date_pst,
      item: item ?? null,
      is_open: item?.is_open ?? true,
      entries_today_count: entries_today_count ?? 0,
      close_time_iso,
      seconds_remaining,
      yesterday_winner: yesterday_winner ?? null,
    },
    {
      headers: { "Cache-Control": "no-store, max-age=0" },
    }
  );
}
