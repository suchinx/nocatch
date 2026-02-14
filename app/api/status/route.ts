export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ptDateString, secondsUntilNextMidnightPT, nextMidnightPT } from "@/lib/time";

export const runtime = "nodejs";

export async function GET() {
  const sb = supabaseAdmin();
  const now = new Date();
  const today = ptDateString(now);

  const { data: item } = await sb
    .from("items")
    .select("*")
    .eq("date_pst", today)
    .maybeSingle();

  // If no item exists, still allow site to function (admin can add later)
  const { count: entriesCount } = await sb
    .from("entries")
    .select("*", { count: "exact", head: true })
    .eq("date_pst", today);

  // Yesterday's winner
  const yesterday = new Date(now.getTime() - 26 * 3600 * 1000); // safe
  const ydate = ptDateString(yesterday);

  const { data: ywin } = await sb
    .from("winners")
    .select("date_pst, display_name, display_state, item_id")
    .eq("date_pst", ydate)
    .maybeSingle();

  const closeAt = nextMidnightPT(now);
  const secondsRemaining = secondsUntilNextMidnightPT(now);

  return Response.json({
  now_iso,
  today_date_pst,
  item,
  is_open,
  entries_today_count,
  close_time_iso,
  seconds_remaining,
  yesterday_winner
}, {
  headers: {
    "Cache-Control": "no-store, max-age=0"
  }
});
