import Link from "next/link";
import { getDB } from "../../lib/store";
import { upcomingAppointments, upcomingRefills } from "../../lib/occurrences";

export const dynamic = "force-dynamic";

function formatDateTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminPatientList() {
  const db = await getDB();
  const now = new Date();
  const horizon = new Date(now);
  horizon.setMonth(horizon.getMonth() + 6);

  const rows = db.patients.map((p) => {
    const nextAppt = upcomingAppointments(p, now, horizon)[0];
    const nextRefill = upcomingRefills(p, now, horizon)[0];
    return { patient: p, nextAppt, nextRefill };
  });

  return (
    <div>
      <div className="page-head">
        <div>
          <h2>Patients</h2>
          <p>{db.patients.length} patients on file. Click a row to open their chart.</p>
        </div>
        <Link href="/admin/patients/new" className="btn btn-primary admin-theme">
          + New patient
        </Link>
      </div>

      <div className="card">
        <table className="chart-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Contact</th>
              <th>Next appointment</th>
              <th>Next refill</th>
              <th>Rx / Appts</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ patient, nextAppt, nextRefill }) => (
              <tr key={patient.id} className="tab-row">
                <td>
                  <div style={{ fontWeight: 500 }}>{patient.name}</div>
                  <div className="hint mono">#{String(patient.id).padStart(4, "0")}</div>
                </td>
                <td>
                  <div className="hint">{patient.email}</div>
                  <div className="hint">{patient.phone || "—"}</div>
                </td>
                <td>
                  {nextAppt ? (
                    <span className="mono">{formatDateTime(nextAppt.occurrence_datetime)}</span>
                  ) : (
                    <span className="hint">None scheduled</span>
                  )}
                </td>
                <td>
                  {nextRefill ? (
                    <span className="mono">
                      {nextRefill.medication} · {nextRefill.occurrence_date}
                    </span>
                  ) : (
                    <span className="hint">None due</span>
                  )}
                </td>
                <td>
                  <span className="hint mono">
                    {(patient.prescriptions || []).length} / {(patient.appointments || []).length}
                  </span>
                </td>
                <td>
                  <Link href={`/admin/patients/${patient.id}`} className="btn btn-sm">
                    Open chart →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
