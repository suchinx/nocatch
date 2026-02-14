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

  return NextResponse.json({
    now_iso: now.toISOString(),
    today_date_pst: today,
    item: item ?? null,
    is_open: item ? item.is_open : true,
    entries_today_count: entriesCount ?? 0,
    close_time_iso: closeAt.toISOString(),
    seconds_remaining: secondsRemaining,
    yesterday_winner: ywin ?? null
  });
}
