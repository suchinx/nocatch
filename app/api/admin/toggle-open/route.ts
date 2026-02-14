import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ptDateString } from "@/lib/time";

export const runtime = "nodejs";

const Body = z.object({
  date_pst: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  is_open: z.boolean()
});

export async function POST(req: Request) {
  if (!assertAdmin(req).ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = supabaseAdmin();
  const today = ptDateString(new Date());

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  const date = parsed.data.date_pst ?? today;

  const { data, error } = await sb.from("items").update({ is_open: parsed.data.is_open }).eq("date_pst", date).select("*").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, item: data ?? null });
}
