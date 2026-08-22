import { NextResponse } from "next/server";
import { mutateDB } from "../../../lib/store";

export async function GET() {
  const { getDB } = require("../../../lib/store");
  const db = await getDB();
  const patients = db.patients.map((p) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    phone: p.phone || "",
    dob: p.dob || "",
    appointmentCount: (p.appointments || []).length,
    prescriptionCount: (p.prescriptions || []).length,
  }));
  return NextResponse.json({ patients });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { name, email, password, phone, dob } = body;

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email, and password are required." },
      { status: 400 }
    );
  }

  let created;
  try {
    await mutateDB((db) => {
      const emailTaken = db.patients.some(
        (p) => p.email.toLowerCase() === String(email).toLowerCase()
      );
      if (emailTaken) {
        throw new Error("A patient with that email already exists.");
      }
      const id = db.nextIds.patient++;
      created = {
        id,
        name,
        email,
        password,
        phone: phone || "",
        dob: dob || "",
        appointments: [],
        prescriptions: [],
      };
      db.patients.push(created);
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  return NextResponse.json({ patient: created }, { status: 201 });
}
