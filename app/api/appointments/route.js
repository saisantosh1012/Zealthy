import { NextResponse } from "next/server";
import { mutateDB } from "../../../lib/store";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { patient_id, provider, datetime, repeat, repeat_until } = body;

  if (!patient_id || !provider || !datetime) {
    return NextResponse.json(
      { error: "Provider and date/time are required." },
      { status: 400 }
    );
  }

  let created = null;
  let error = null;
  await mutateDB((db) => {
    const patient = db.patients.find(
      (p) => String(p.id) === String(patient_id)
    );
    if (!patient) {
      error = "Patient not found.";
      return;
    }
    const id = db.nextIds.appointment++;
    created = {
      id,
      provider,
      datetime,
      repeat: repeat || "none",
      repeat_until: repeat_until || null,
    };
    patient.appointments.push(created);
  });

  if (error) return NextResponse.json({ error }, { status: 404 });
  return NextResponse.json({ appointment: created }, { status: 201 });
}
