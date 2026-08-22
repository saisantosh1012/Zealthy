import { cookies } from "next/headers";
import { getDB } from "../../../lib/store";
import { COOKIE_NAME } from "../../../lib/auth";
import { upcomingAppointments } from "../../../lib/occurrences";

function formatDateTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AppointmentsPage() {
  const id = cookies().get(COOKIE_NAME)?.value;
  const db = await getDB();
  const patient = db.patients.find((p) => String(p.id) === String(id));

  const now = new Date();
  const in3mo = new Date(now);
  in3mo.setMonth(in3mo.getMonth() + 3);

  const appts = upcomingAppointments(patient, now, in3mo);

  return (
    <div>
      <div className="page-head">
        <div>
          <h2>Your appointments</h2>
          <p>Everything on the books over the next 3 months.</p>
        </div>
      </div>

      <div className="card">
        {appts.length === 0 ? (
          <div className="empty">No appointments scheduled in this window.</div>
        ) : (
          <table className="chart-table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Date &amp; time</th>
                <th>Repeats</th>
              </tr>
            </thead>
            <tbody>
              {appts.map((a) => (
                <tr key={a.id + a.occurrence_datetime}>
                  <td>{a.provider}</td>
                  <td className="mono">{formatDateTime(a.occurrence_datetime)}</td>
                  <td style={{ textTransform: "capitalize" }}>{a.repeat === "none" ? "One-time" : a.repeat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
