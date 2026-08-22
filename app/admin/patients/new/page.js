"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewPatientPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    dob: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function set(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Couldn't create patient.");
      return;
    }
    router.push(`/admin/patients/${data.patient.id}`);
  }

  return (
    <div>
      <Link href="/admin" className="back-link">
        ← All patients
      </Link>
      <div className="page-head">
        <div>
          <h2>New patient</h2>
          <p>Create a chart and portal login for a new patient.</p>
        </div>
      </div>

      <div className="card card-pad" style={{ maxWidth: 560 }}>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" required value={form.name} onChange={set("name")} placeholder="Jane Doe" />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="dob">Date of birth</label>
              <input id="dob" type="date" value={form.dob} onChange={set("dob")} />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" value={form.phone} onChange={set("phone")} placeholder="(555) 000-0000" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={set("email")}
              placeholder="jane@example.com"
            />
            <span className="hint">Used to log in to the patient portal.</span>
          </div>
          <div className="field">
            <label htmlFor="password">Portal password</label>
            <input
              id="password"
              required
              value={form.password}
              onChange={set("password")}
              placeholder="Set an initial password"
            />
            <span className="hint">Stored in plain text for this exercise's test setup only.</span>
          </div>
          <button type="submit" className="btn btn-primary admin-theme" disabled={saving}>
            {saving ? "Creating…" : "Create patient"}
          </button>
        </form>
      </div>
    </div>
  );
}
