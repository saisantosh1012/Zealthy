"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="topnav">
      <Link href="/admin" className={pathname === "/admin" ? "active" : ""}>
        Patients
      </Link>
      <Link
        href="/admin/patients/new"
        className={pathname === "/admin/patients/new" ? "active" : ""}
      >
        New patient
      </Link>
      <Link href="/" className="signout">
        Patient portal →
      </Link>
    </nav>
  );
}
