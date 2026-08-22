import { NextResponse } from "next/server";
import { clearedCookie } from "../../../lib/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  const cookie = clearedCookie();
  res.cookies.set(cookie.name, cookie.value, cookie);
  return res;
}
