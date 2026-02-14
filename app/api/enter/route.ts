import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ptDateString } from "@/lib/time";
import { generateDisplayName, generateDisplayState, normalizeEmail, stateCodeToName } from "@/lib/display";

export const runtime = "nodejs";

const BodySchema = z.object({
  email: z.string().email(),
  first_name: z.string().trim().min(1).max(40).optional().or(z.literal("")),
  state: z.string().trim().min(2).max(25).optional().or(z.literal("")),
  us_confirmed: z.boolean()
});

export async function POST(req: Request) {
  const sb = supabaseAdmin();
  const now = new Date();
  const today = ptDateString(now);

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

  const email = normalizeEmail(parsed.data.email);
  if (!parsed.data.us_confirmed) return NextResponse.json({ error: "US confirmation required" }, { status: 400 });

  // Optional: enforce open/closed
  const { data: item } = await sb.from("items").select("is_open").eq("date_pst", today).maybeSingle();
  if (item && item.is_open === false) return NextResponse.json({ error: "Today's drawing is closed" }, { status: 403 });

  const firstRaw = (parsed.data.first_name ?? "").trim();
  const stateRaw = (parsed.data.state ?? "").trim();

  const displayName = firstRaw ? firstRaw : generateDisplayName(email);
  const displayState = stateRaw ? (stateCodeToName(stateRaw) ?? stateRaw) : generateDisplayState(email);

  // Upsert subscriber list (optional)
  await sb.from("subscribers").upsert({ email }, { onConflict: "email" });

  // Insert entry (unique(date,email) prevents duplicates)
  const { error } = await sb.from("entries").insert({
    date_pst: today,
    email,
    first_name: firstRaw || null,
    state: stateRaw || null,
    display_name: displayName,
    display_state: displayState
  });

  if (error) {
    // unique violation
    if (String(error.code) === "23505") {
      return NextResponse.json({ ok: true, already_entered: true, display_name: displayName, display_state: displayState });
    }
    return NextResponse.json({ error: "DB error", details: error.message }, { status: 500 });
  }

  const { count } = await sb.from("entries").select("*", { count: "exact", head: true }).eq("date_pst", today);

  return NextResponse.json({ ok: true, already_entered: false, entries_today_count: count ?? 0 });
}
