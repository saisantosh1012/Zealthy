import { cookies } from "next/headers";
import Link from "next/link";
import { getDB } from "../../lib/store";
import { COOKIE_NAME } from "../../lib/auth";
import { upcomingAppointments, upcomingRefills } from "../../lib/occurrences";

function formatDateTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default async function PortalDashboard() {
  const id = cookies().get(COOKIE_NAME)?.value;
  const db = await getDB();
  const patient = db.patients.find((p) => String(p.id) === String(id));

  const now = new Date();
  const in7 = new Date(now);
  in7.setDate(in7.getDate() + 7);

  const appts = upcomingAppointments(patient, now, in7);
  const refills = upcomingRefills(patient, now, in7);

  return (
    <div>
      <div className="page-head">
        <div>
          <h2>Welcome back, {patient.name.split(" ")[0]}</h2>
          <p>Here's what's coming up over the next 7 days.</p>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <div className="num">{appts.length}</div>
          <div className="label">Appointments this week</div>
        </div>
        <div className="summary-card">
          <div className="num">{refills.length}</div>
          <div className="label">Refills due this week</div>
        </div>
        <div className="summary-card">
          <div className="num">{(patient.prescriptions || []).length}</div>
          <div className="label">Active prescriptions</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card card-pad">
          <div className="section-title">
            <h3>Upcoming appointments</h3>
            <Link href="/portal/appointments" className="hint" style={{ color: "var(--portal)" }}>
              View all →
            </Link>
          </div>
          {appts.length === 0 ? (
            <div className="empty">Nothing scheduled in the next 7 days.</div>
          ) : (
            appts.map((a) => (
              <div className="list-item" key={a.id + a.occurrence_datetime}>
                <div>
                  <div className="title">{a.provider}</div>
                  <div className="sub mono">{formatDateTime(a.occurrence_datetime)}</div>
                </div>
                <span className="stamp soon">Soon</span>
              </div>
            ))
          )}
        </div>

        <div className="card card-pad">
          <div className="section-title">
            <h3>Refills due soon</h3>
            <Link href="/portal/prescriptions" className="hint" style={{ color: "var(--portal)" }}>
              View all →
            </Link>
          </div>
          {refills.length === 0 ? (
            <div className="empty">No refills due in the next 7 days.</div>
          ) : (
            refills.map((r) => (
              <div className="list-item" key={r.id + r.occurrence_date}>
                <div>
                  <div className="title">
                    {r.medication} <span className="mono hint">{r.dosage}</span>
                  </div>
                  <div className="sub mono">Due {formatDate(r.occurrence_date)}</div>
                </div>
                <span className="stamp soon">Due</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card card-pad" style={{ marginTop: 20 }}>
        <div className="section-title">
          <h3>Your info</h3>
        </div>
        <div className="grid-2">
          <div>
            <div className="hint">Name</div>
            <div>{patient.name}</div>
          </div>
          <div>
            <div className="hint">Email</div>
            <div>{patient.email}</div>
          </div>
          <div>
            <div className="hint">Phone</div>
            <div>{patient.phone || "—"}</div>
          </div>
          <div>
            <div className="hint">Date of birth</div>
            <div>{patient.dob || "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
