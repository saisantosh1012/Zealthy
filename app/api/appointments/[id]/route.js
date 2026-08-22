import { NextResponse } from "next/server";
import { mutateDB } from "../../../../lib/store";

function findAppointment(db, id) {
  for (const patient of db.patients) {
    const appt = (patient.appointments || []).find(
      (a) => String(a.id) === String(id)
    );
    if (appt) return { patient, appt };
  }
  return null;
}

export async function PUT(request, { params }) {
  const body = await request.json().catch(() => ({}));
  let updated = null;
  let error = null;

  await mutateDB((db) => {
    const found = findAppointment(db, params.id);
    if (!found) {
      error = "Appointment not found.";
      return;
    }
    const { appt } = found;
    if (body.provider !== undefined) appt.provider = body.provider;
    if (body.datetime !== undefined) appt.datetime = body.datetime;
    if (body.repeat !== undefined) appt.repeat = body.repeat;
    if (body.repeat_until !== undefined) appt.repeat_until = body.repeat_until;
    updated = appt;
  });

  if (error) return NextResponse.json({ error }, { status: 404 });
  return NextResponse.json({ appointment: updated });
}

export async function DELETE(request, { params }) {
  let error = null;
  await mutateDB((db) => {
    const found = findAppointment(db, params.id);
    if (!found) {
      error = "Appointment not found.";
      return;
    }
    found.patient.appointments = found.patient.appointments.filter(
      (a) => String(a.id) !== String(params.id)
    );
  });

  if (error) return NextResponse.json({ error }, { status: 404 });
  return NextResponse.json({ ok: true });
}
