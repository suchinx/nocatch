export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase-admin";
import { getTodayDatePst, getCloseTimeIso, getSecondsRemaining } from "@/lib/time";

export async function GET() {
  const supabase = getAdminClient();

  const now_iso = new Date().toISOString();
  const today_date_pst = getTodayDatePst();

  // Fetch today's item (if any)
  const { data: item } = await supabase
    .from("items")
    .select("*")
    .eq("date_pst", today_date_pst)
    .maybeSingle();

  // Count today's entries
  const { count: entries_today_count } = await supabase
    .from("entries")
    .select("*", { count: "exact", head: true })
    .eq("date_pst", today_date_pst);

  // Yesterday's winner (for display)
  const yesterday_date_pst = getTodayDatePst(-1);
  const { data: yesterday_winner } = await supabase
    .from("winners_view")
    .select("*")
    .eq("date_pst", yesterday_date_pst)
    .maybeSingle();

  const close_time_iso = getCloseTimeIso();
  const seconds_remaining = getSecondsRemaining();

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
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
  }
);} 
