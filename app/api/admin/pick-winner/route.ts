import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { assertAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ptDateString } from "@/lib/time";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

const Body = z.object({
  date_pst: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

export async function POST(req: Request) {
  if (!assertAdmin(req).ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = supabaseAdmin();

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const date = parsed.data.date_pst ?? ptDateString(new Date(Date.now() - 2*3600*1000)); // default to "today" in PT

  // Already picked?
  const { data: existing } = await sb.from("winners").select("id").eq("date_pst", date).maybeSingle();
  if (existing) return NextResponse.json({ ok: true, already_picked: true });

  const { data: item } = await sb.from("items").select("id,title").eq("date_pst", date).maybeSingle();

  const { data: entries, error } = await sb
    .from("entries")
    .select("email, display_name, display_state")
    .eq("date_pst", date);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!entries || entries.length === 0) return NextResponse.json({ ok: false, error: "No entries for that date" }, { status: 400 });

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

  // Close item if exists
  if (item?.id) await sb.from("items").update({ is_open: false }).eq("date_pst", date);

  // Notify winner (basic)
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

  return NextResponse.json({ ok: true, date_pst: date, picked_index: idx, total_entries: entries.length, winner_public: { name: winner.display_name, state: winner.display_state }});
}
