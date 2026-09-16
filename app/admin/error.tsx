"use client";

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="login-page">
      <div className="login-card">
        <p className="admin-kicker">Fehler</p>
        <h1>Das hat nicht funktioniert.</h1>
        <p>{error.message || "Die Änderung konnte nicht gespeichert werden."}</p>
        <button className="admin-button primary" type="button" onClick={reset}>Erneut versuchen</button>
      </div>
    </main>
  );
}
