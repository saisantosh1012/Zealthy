import AdminNav from "./AdminNav";

export default function AdminLayout({ children }) {
  return (
    <div className="shell admin-theme">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark admin">M</span>
          <div>
            <h1>Meridian Health</h1>
            <div className="eyebrow">mini-EMR — Staff view</div>
          </div>
        </div>
        <AdminNav />
      </header>
      <main className="content">{children}</main>
    </div>
  );
}
