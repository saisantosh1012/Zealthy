import "./globals.css";

export const metadata = {
  title: "Meridian Health — Patient Portal",
  description: "Mini-EMR and patient portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <footer className="app-footer">
          <span>Designed and developed by Chandan Bala Jangid</span>
        </footer>
      </body>
    </html>
  );
}
