import { NextResponse } from "next/server";
import { getDB, mutateDB } from "../../../../lib/store";

export async function GET(request, { params }) {
  const db = await getDB();
  const patient = db.patients.find((p) => String(p.id) === String(params.id));
  if (!patient) {
    return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  }
  return NextResponse.json({ patient });
}

export async function PUT(request, { params }) {
  const body = await request.json().catch(() => ({}));
  let updated = null;
  let error = null;

  await mutateDB((db) => {
    const patient = db.patients.find(
      (p) => String(p.id) === String(params.id)
    );
    if (!patient) {
      error = "Patient not found.";
      return;
    }
    if (body.name !== undefined) patient.name = body.name;
    if (body.email !== undefined) patient.email = body.email;
    if (body.phone !== undefined) patient.phone = body.phone;
    if (body.dob !== undefined) patient.dob = body.dob;
    if (body.password) patient.password = body.password;
    updated = patient;
  });

  if (error) return NextResponse.json({ error }, { status: 404 });
  return NextResponse.json({ patient: updated });
}
