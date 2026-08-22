import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDB } from "../../../lib/store";
import { COOKIE_NAME } from "../../../lib/auth";

export async function GET() {
  const id = cookies().get(COOKIE_NAME)?.value;
  if (!id) return NextResponse.json({ patient: null });

  const db = await getDB();
  const patient = db.patients.find((p) => String(p.id) === String(id));
  if (!patient) return NextResponse.json({ patient: null });

  return NextResponse.json({
    patient: { id: patient.id, name: patient.name, email: patient.email },
  });
}
