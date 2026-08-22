import { cookies } from "next/headers";
import { getDB } from "../../../lib/store";
import { COOKIE_NAME } from "../../../lib/auth";
import { upcomingRefills } from "../../../lib/occurrences";

function formatDate(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export default async function PrescriptionsPage() {
  const id = cookies().get(COOKIE_NAME)?.value;
  const db = await getDB();
  const patient = db.patients.find((p) => String(p.id) === String(id));

  return (
    <div>
      <div className="page-head">
        <div>
          <h2>Your prescriptions</h2>
          <p>Current medications and their upcoming refills.</p>
        </div>
      </div>

      {(patient.prescriptions || []).length === 0 ? (
        <div className="card empty">No prescriptions on file.</div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {patient.prescriptions.map((rx) => {
            const now = new Date();
            const in3mo = new Date(now);
            in3mo.setMonth(in3mo.getMonth() + 3);
            const refills = upcomingRefills({ prescriptions: [rx] }, now, in3mo);

            return (
              <div className="card card-pad" key={rx.id}>
                <div className="section-title">
                  <h3>
                    {rx.medication}{" "}
                    <span className="mono hint" style={{ fontSize: 14 }}>
                      {rx.dosage}
                    </span>
                  </h3>
                  <span className="hint mono">Qty {rx.quantity} · {rx.refill_schedule}</span>
                </div>
                <div className="hint" style={{ marginBottom: 10 }}>
                  Upcoming refills
                </div>
                {refills.length === 0 ? (
                  <div className="empty">No refills scheduled in the next 3 months.</div>
                ) : (
                  refills.map((r) => (
                    <div className="list-item" key={r.occurrence_date}>
                      <div className="mono">{formatDate(r.occurrence_date)}</div>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
