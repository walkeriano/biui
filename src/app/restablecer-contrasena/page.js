import { Suspense } from "react";
import ResetPassword from "@/components/auth/ResetPassword/ResetPassword";

export const metadata = { title: "Restablecer contraseña | BIUI", robots: { index: false, follow: false } };

export default function ResetPasswordPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4 py-12">
      <Suspense fallback={<p>Validando enlace...</p>}><ResetPassword /></Suspense>
    </main>
  );
}
