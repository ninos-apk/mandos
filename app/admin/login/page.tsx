import { loginAction } from "@/app/admin/actions";
import { LockKeyhole } from "lucide-react";
import Link from "next/link";

const errors: Record<string, string> = {
  config: "Supabase ist noch nicht konfiguriert. Tragen Sie zuerst die Umgebungsvariablen ein.",
  credentials: "E-Mail-Adresse oder Passwort ist nicht korrekt.",
  connection: "Die Anmeldung ist gerade nicht erreichbar. Bitte prüfen Sie die Verbindung zu Supabase und versuchen Sie es erneut.",
  auth: "Die Anmeldung konnte nicht abgeschlossen werden. Bitte prüfen Sie die Supabase-Konfiguration.",
  forbidden: "Dieses Konto besitzt keine Administratorrechte.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-icon"><LockKeyhole /></div>
        <p className="admin-kicker">Geschützter Bereich</p>
        <h1>Administration</h1>
        <p>Mit dem eingerichteten Administratorkonto anmelden.</p>
        {error && <div className="admin-alert error">{errors[error] ?? "Die Anmeldung ist fehlgeschlagen."}</div>}
        <form action={loginAction} className="admin-form">
          <label>E-Mail-Adresse<input type="email" name="email" autoComplete="username" required /></label>
          <label>Passwort<input type="password" name="password" autoComplete="current-password" required /></label>
          <button className="admin-button primary" type="submit">Anmelden</button>
        </form>
        <Link className="back-link" href="/">← Zur Webseite</Link>
      </div>
    </main>
  );
}
