import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ptDateString } from "@/lib/time";

export const runtime = "nodejs";

const Body = z.object({
  date_pst: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  title: z.string().min(1).max(120),
  description: z.string().min(0).max(2000).optional().or(z.literal("")),
  image_urls: z.array(z.string().url()).min(0).max(10).optional(),
  is_open: z.boolean().optional()
});

export async function POST(req: Request) {
  if (!assertAdmin(req).ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = supabaseAdmin();
  const now = new Date();
  const today = ptDateString(now);

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

  const date = parsed.data.date_pst ?? today;

  const payload: any = {
    date_pst: date,
    title: parsed.data.title,
    description: (parsed.data.description ?? "").trim(),
    image_urls: parsed.data.image_urls ?? [],
  };
  if (typeof parsed.data.is_open === "boolean") payload.is_open = parsed.data.is_open;

  const { data, error } = await sb.from("items").upsert(payload, { onConflict: "date_pst" }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, item: data });
}
