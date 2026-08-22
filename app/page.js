"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't sign you in.");
        setLoading(false);
        return;
      }
      router.push("/portal");
      router.refresh();
    } catch (err) {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="login-shell">
      <div className="card card-pad login-card">
        <span className="brand-mark portal">M</span>
        <h1 style={{ fontSize: 24, marginBottom: 4 }}>Meridian Health</h1>
        <p style={{ color: "var(--ink-soft)", fontSize: 14, marginTop: 0, marginBottom: 24 }}>
          Sign in to view your appointments and prescriptions.
        </p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary portal-theme"
            style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="hint" style={{ marginTop: 20 }}>
          Sample login: <span className="mono">mark@some-email-provider.net</span>{" "}
          / <span className="mono">Password123!</span>
        </p>
        <p className="hint" style={{ marginTop: 10 }}>
          Provider or staff?{" "}
          <a href="/admin" style={{ color: "var(--admin)", fontWeight: 500 }}>
            Open the EMR
          </a>
        </p>
      </div>
    </div>
  );
}
