import { NextResponse } from "next/server";
import { getDB } from "../../../lib/store";
import { sessionCookie } from "../../../lib/auth";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Enter both email and password." },
      { status: 400 }
    );
  }

  const db = await getDB();
  const patient = db.patients.find(
    (p) => p.email.toLowerCase() === email
  );

  if (!patient || patient.password !== password) {
    return NextResponse.json(
      { error: "That email and password don't match our records." },
      { status: 401 }
    );
  }

  const res = NextResponse.json({
    id: patient.id,
    name: patient.name,
    email: patient.email,
  });
  const cookie = sessionCookie(patient.id);
  res.cookies.set(cookie.name, cookie.value, cookie);
  return res;
}
