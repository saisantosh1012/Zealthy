import { NextResponse } from "next/server";
import { mutateDB } from "../../../../lib/store";

function findPrescription(db, id) {
  for (const patient of db.patients) {
    const rx = (patient.prescriptions || []).find(
      (p) => String(p.id) === String(id)
    );
    if (rx) return { patient, rx };
  }
  return null;
}

export async function PUT(request, { params }) {
  const body = await request.json().catch(() => ({}));
  let updated = null;
  let error = null;

  await mutateDB((db) => {
    const found = findPrescription(db, params.id);
    if (!found) {
      error = "Prescription not found.";
      return;
    }
    const { rx } = found;
    if (body.medication !== undefined) rx.medication = body.medication;
    if (body.dosage !== undefined) rx.dosage = body.dosage;
    if (body.quantity !== undefined) rx.quantity = Number(body.quantity) || rx.quantity;
    if (body.refill_on !== undefined) rx.refill_on = body.refill_on;
    if (body.refill_schedule !== undefined) rx.refill_schedule = body.refill_schedule;
    updated = rx;
  });

  if (error) return NextResponse.json({ error }, { status: 404 });
  return NextResponse.json({ prescription: updated });
}

export async function DELETE(request, { params }) {
  let error = null;
  await mutateDB((db) => {
    const found = findPrescription(db, params.id);
    if (!found) {
      error = "Prescription not found.";
      return;
    }
    found.patient.prescriptions = found.patient.prescriptions.filter(
      (p) => String(p.id) !== String(params.id)
    );
  });

  if (error) return NextResponse.json({ error }, { status: 404 });
  return NextResponse.json({ ok: true });
}
