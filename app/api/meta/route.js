import { NextResponse } from "next/server";
import { getDB } from "../../../lib/store";

export async function GET() {
  const db = await getDB();
  return NextResponse.json({
    medications: db.medications,
    dosages: db.dosages,
  });
}
