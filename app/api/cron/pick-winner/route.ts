import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ptDateString } from "@/lib/time";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret") || "";
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = supabaseAdmin();
  const now = new Date();
  const yesterday = new Date(now.getTime() - 2 * 3600 * 1000); // safe around midnight
  const date = ptDateString(yesterday);

  // Already picked?
  const { data: existing } = await sb.from("winners").select("id").eq("date_pst", date).maybeSingle();
  if (existing) return NextResponse.json({ ok: true, already_picked: true, date_pst: date });

  const { data: item } = await sb.from("items").select("id,title").eq("date_pst", date).maybeSingle();

  const { data: entries, error } = await sb
    .from("entries")
    .select("email, display_name, display_state")
    .eq("date_pst", date);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!entries || entries.length === 0) return NextResponse.json({ ok: true, date_pst: date, no_entries: true });

  const idx = crypto.randomInt(0, entries.length);
  const winner = entries[idx];

  const { error: werr } = await sb.from("winners").insert({
    date_pst: date,
    item_id: item?.id ?? null,
    email: winner.email,
    display_name: winner.display_name,
    display_state: winner.display_state,
    picked_at: new Date().toISOString()
  });

  if (werr) return NextResponse.json({ error: werr.message }, { status: 500 });

  // Close item
  await sb.from("items").update({ is_open: false }).eq("date_pst", date);

  // Notify winner
  try {
    await sendEmail({
      to: winner.email,
      subject: "You won today’s No Catch item",
      html: `<div style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height:1.5">
        <h2>You won today’s item 🎁</h2>
        <p>Reply to this email with your shipping address (US only) within 48 hours.</p>
        <p>— No Catch</p>
      </div>`
    });
  } catch (e: any) {
    console.error("Email send failed:", e?.message ?? e);
  }

  return NextResponse.json({ ok: true, date_pst: date, total_entries: entries.length, winner_public: { name: winner.display_name, state: winner.display_state }});
}
