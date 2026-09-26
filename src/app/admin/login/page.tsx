import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { isAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Ingresar", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin/");
  return (
    <div className="tp-login">
      <div className="tp-panel">
        <div className="tp-logo" style={{ marginBottom: 18 }}>
          <span className="tp-logo-dot" aria-hidden="true" />
          Tropicleta
        </div>
        <h1 className="tp-display tp-category-heading">Panel del taller</h1>
        <LoginForm />
      </div>
    </div>
  );
}
