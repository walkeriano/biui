import "@/lib/fontawesome";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "BIUI",
  description: "Software BIUI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
