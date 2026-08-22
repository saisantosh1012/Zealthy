import { NextResponse } from "next/server";
import { mutateDB } from "../../../lib/store";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { patient_id, medication, dosage, quantity, refill_on, refill_schedule } = body;

  if (!patient_id || !medication || !dosage || !refill_on) {
    return NextResponse.json(
      { error: "Medication, dosage, and refill date are required." },
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
    const id = db.nextIds.prescription++;
    created = {
      id,
      medication,
      dosage,
      quantity: Number(quantity) || 1,
      refill_on,
      refill_schedule: refill_schedule || "monthly",
    };
    patient.prescriptions.push(created);
  });

  if (error) return NextResponse.json({ error }, { status: 404 });
  return NextResponse.json({ prescription: created }, { status: 201 });
}
