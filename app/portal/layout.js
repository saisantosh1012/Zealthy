import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDB } from "../../lib/store";
import { COOKIE_NAME } from "../../lib/auth";
import PortalNav from "./PortalNav";

export default async function PortalLayout({ children }) {
  const id = cookies().get(COOKIE_NAME)?.value;
  if (!id) redirect("/");

  const db = await getDB();
  const patient = db.patients.find((p) => String(p.id) === String(id));
  if (!patient) redirect("/");

  return (
    <div className="shell portal-theme">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark portal">M</span>
          <div>
            <h1>Meridian Health</h1>
            <div className="eyebrow">Patient Portal</div>
          </div>
        </div>
        <PortalNav patientName={patient.name} />
      </header>
      <main className="content">{children}</main>
    </div>
  );
}
