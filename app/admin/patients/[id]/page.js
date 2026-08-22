"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function toLocalInputValue(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function PatientChartPage() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [meta, setMeta] = useState({ medications: [], dosages: [] });
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    const [pRes, mRes] = await Promise.all([
      fetch(`/api/patients/${id}`),
      fetch(`/api/meta`),
    ]);
    if (pRes.status === 404) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const pData = await pRes.json();
    const mData = await mRes.json();
    setPatient(pData.patient);
    setMeta(mData);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <div className="hint">Loading chart…</div>;
  if (notFound) return <div className="empty">Patient not found.</div>;

  return (
    <div>
      <Link href="/admin" className="back-link">
        ← All patients
      </Link>

      <PatientInfo patient={patient} onSaved={load} />

      <div className="grid-2" style={{ marginTop: 20, alignItems: "start" }}>
        <AppointmentsSection patient={patient} onChanged={load} />
        <PrescriptionsSection patient={patient} meta={meta} onChanged={load} />
      </div>
    </div>
  );
}

function PatientInfo({ patient, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: patient.name,
    email: patient.email,
    phone: patient.phone || "",
    dob: patient.dob || "",
    password: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function set(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    const res = await fetch(`/api/patients/${patient.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Couldn't save changes.");
      return;
    }
    setEditing(false);
    onSaved();
  }

  return (
    <div className="page-head">
      <div style={{ width: "100%" }}>
        {!editing ? (
          <>
            <div className="page-head" style={{ marginBottom: 4 }}>
              <div>
                <h2>{patient.name}</h2>
                <p className="mono">#{String(patient.id).padStart(4, "0")} · {patient.email}</p>
              </div>
              <button className="btn" onClick={() => setEditing(true)}>
                Edit patient
              </button>
            </div>
            <div className="grid-2" style={{ maxWidth: 480 }}>
              <div>
                <div className="hint">Phone</div>
                <div>{patient.phone || "—"}</div>
              </div>
              <div>
                <div className="hint">Date of birth</div>
                <div>{patient.dob || "—"}</div>
              </div>
            </div>
          </>
        ) : (
          <div className="card card-pad" style={{ maxWidth: 560 }}>
            {error && <div className="error-banner">{error}</div>}
            <form onSubmit={save}>
              <div className="field">
                <label>Full name</label>
                <input required value={form.name} onChange={set("name")} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Date of birth</label>
                  <input type="date" value={form.dob} onChange={set("dob")} />
                </div>
                <div className="field">
                  <label>Phone</label>
                  <input value={form.phone} onChange={set("phone")} />
                </div>
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" required value={form.email} onChange={set("email")} />
              </div>
              <div className="field">
                <label>Reset password</label>
                <input value={form.password} onChange={set("password")} placeholder="Leave blank to keep current password" />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn btn-primary admin-theme" disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function AppointmentsSection({ patient, onChanged }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const appts = [...(patient.appointments || [])].sort(
    (a, b) => new Date(a.datetime) - new Date(b.datetime)
  );

  async function stopRepeating(appt) {
    await fetch(`/api/appointments/${appt.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repeat_until: todayStr() }),
    });
    onChanged();
  }

  async function remove(apptId) {
    if (!confirm("Delete this appointment?")) return;
    await fetch(`/api/appointments/${apptId}`, { method: "DELETE" });
    onChanged();
  }

  return (
    <div className="card card-pad">
      <div className="section-title">
        <h3>Appointments</h3>
        <button className="btn btn-sm admin-theme btn-primary" onClick={() => { setAdding(true); setEditingId(null); }}>
          + Add
        </button>
      </div>

      {adding && (
        <AppointmentForm
          patientId={patient.id}
          onDone={() => { setAdding(false); onChanged(); }}
          onCancel={() => setAdding(false)}
        />
      )}

      {appts.length === 0 && !adding && <div className="empty">No appointments on file.</div>}

      {appts.map((a) =>
        editingId === a.id ? (
          <AppointmentForm
            key={a.id}
            patientId={patient.id}
            existing={a}
            onDone={() => { setEditingId(null); onChanged(); }}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <div className="list-item" key={a.id}>
            <div>
              <div className="title">{a.provider}</div>
              <div className="sub mono">
                {new Date(a.datetime).toLocaleString(undefined, {
                  month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                })}
                {a.repeat !== "none" && ` · repeats ${a.repeat}`}
                {a.repeat_until && ` (until ${a.repeat_until})`}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {a.repeat !== "none" && !a.repeat_until && (
                <button className="btn btn-sm" onClick={() => stopRepeating(a)}>
                  Stop repeating
                </button>
              )}
              <button className="btn btn-sm" onClick={() => { setEditingId(a.id); setAdding(false); }}>
                Edit
              </button>
              <button className="btn btn-sm btn-danger" onClick={() => remove(a.id)}>
                Delete
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}

function AppointmentForm({ patientId, existing, onDone, onCancel }) {
  const [provider, setProvider] = useState(existing?.provider || "");
  const [datetime, setDatetime] = useState(
    existing ? toLocalInputValue(existing.datetime) : ""
  );
  const [repeat, setRepeat] = useState(existing?.repeat || "none");
  const [repeatUntil, setRepeatUntil] = useState(existing?.repeat_until || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      patient_id: patientId,
      provider,
      datetime: new Date(datetime).toISOString(),
      repeat,
      repeat_until: repeatUntil || null,
    };
    const res = await fetch(
      existing ? `/api/appointments/${existing.id}` : "/api/appointments",
      {
        method: existing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Couldn't save appointment.");
      return;
    }
    onDone();
  }

  return (
    <form onSubmit={submit} className="card-pad" style={{ border: "1px dashed var(--line)", borderRadius: 8, marginBottom: 14 }}>
      {error && <div className="error-banner">{error}</div>}
      <div className="field">
        <label>Provider</label>
        <input required value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Dr Jane Lee" />
      </div>
      <div className="field-row">
        <div className="field">
          <label>Date &amp; time</label>
          <input type="datetime-local" required value={datetime} onChange={(e) => setDatetime(e.target.value)} />
        </div>
        <div className="field">
          <label>Repeats</label>
          <select value={repeat} onChange={(e) => setRepeat(e.target.value)}>
            <option value="none">Does not repeat</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>
      {repeat !== "none" && (
        <div className="field">
          <label>Ends on (optional)</label>
          <input type="date" value={repeatUntil} onChange={(e) => setRepeatUntil(e.target.value)} />
        </div>
      )}
      <div style={{ display: "flex", gap: 10 }}>
        <button type="submit" className="btn btn-primary admin-theme" disabled={saving}>
          {saving ? "Saving…" : existing ? "Save appointment" : "Add appointment"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function PrescriptionsSection({ patient, meta, onChanged }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const rx = [...(patient.prescriptions || [])].sort(
    (a, b) => new Date(a.refill_on) - new Date(b.refill_on)
  );

  async function remove(rxId) {
    if (!confirm("Delete this prescription?")) return;
    await fetch(`/api/prescriptions/${rxId}`, { method: "DELETE" });
    onChanged();
  }

  return (
    <div className="card card-pad">
      <div className="section-title">
        <h3>Prescriptions</h3>
        <button className="btn btn-sm admin-theme btn-primary" onClick={() => { setAdding(true); setEditingId(null); }}>
          + Add
        </button>
      </div>

      {adding && (
        <PrescriptionForm
          patientId={patient.id}
          meta={meta}
          onDone={() => { setAdding(false); onChanged(); }}
          onCancel={() => setAdding(false)}
        />
      )}

      {rx.length === 0 && !adding && <div className="empty">No prescriptions on file.</div>}

      {rx.map((r) =>
        editingId === r.id ? (
          <PrescriptionForm
            key={r.id}
            patientId={patient.id}
            meta={meta}
            existing={r}
            onDone={() => { setEditingId(null); onChanged(); }}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <div className="list-item" key={r.id}>
            <div>
              <div className="title">
                {r.medication} <span className="mono hint">{r.dosage}</span>
              </div>
              <div className="sub mono">
                Qty {r.quantity} · refill {r.refill_on} · {r.refill_schedule}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn btn-sm" onClick={() => { setEditingId(r.id); setAdding(false); }}>
                Edit
              </button>
              <button className="btn btn-sm btn-danger" onClick={() => remove(r.id)}>
                Delete
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}

function PrescriptionForm({ patientId, meta, existing, onDone, onCancel }) {
  const [medication, setMedication] = useState(existing?.medication || meta.medications[0] || "");
  const [dosage, setDosage] = useState(existing?.dosage || meta.dosages[0] || "");
  const [quantity, setQuantity] = useState(existing?.quantity || 1);
  const [refillOn, setRefillOn] = useState(existing?.refill_on || todayStr());
  const [refillSchedule, setRefillSchedule] = useState(existing?.refill_schedule || "monthly");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      patient_id: patientId,
      medication,
      dosage,
      quantity: Number(quantity),
      refill_on: refillOn,
      refill_schedule: refillSchedule,
    };
    const res = await fetch(
      existing ? `/api/prescriptions/${existing.id}` : "/api/prescriptions",
      {
        method: existing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Couldn't save prescription.");
      return;
    }
    onDone();
  }

  return (
    <form onSubmit={submit} className="card-pad" style={{ border: "1px dashed var(--line)", borderRadius: 8, marginBottom: 14 }}>
      {error && <div className="error-banner">{error}</div>}
      <div className="field-row">
        <div className="field">
          <label>Medication</label>
          <select value={medication} onChange={(e) => setMedication(e.target.value)}>
            {meta.medications.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Dosage</label>
          <select value={dosage} onChange={(e) => setDosage(e.target.value)}>
            {meta.dosages.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label>Quantity</label>
          <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </div>
        <div className="field">
          <label>Refill schedule</label>
          <select value={refillSchedule} onChange={(e) => setRefillSchedule(e.target.value)}>
            <option value="none">One-time</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>
      <div className="field">
        <label>Next refill date</label>
        <input type="date" required value={refillOn} onChange={(e) => setRefillOn(e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button type="submit" className="btn btn-primary admin-theme" disabled={saving}>
          {saving ? "Saving…" : existing ? "Save prescription" : "Add prescription"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
