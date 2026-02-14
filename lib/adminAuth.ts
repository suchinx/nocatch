export function assertAdmin(req: Request) {
  const key = process.env.ADMIN_KEY;
  const got = req.headers.get("x-admin-key") || "";
  if (!key || got !== key) {
    return { ok: false as const };
  }
  return { ok: true as const };
}
