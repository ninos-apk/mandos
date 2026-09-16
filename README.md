# Mando's im Bürgerhaus Waldmohr

Responsive Next.js-Webseite mit Supabase-Datenbank, Supabase Storage und einem geschützten Administrationsbereich.

## Voraussetzungen

- Node.js 22 (`nvm use`)
- Ein Supabase-Projekt
- Später optional ein Vercel-Projekt

## Lokale Einrichtung

```bash
nvm use
npm install
```

In Supabase im SQL Editor den Inhalt von `supabase/migrations/001_initial_schema.sql` ausführen. Danach die Werte in `.env.local` eintragen:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
INITIAL_ADMIN_EMAIL=...
INITIAL_ADMIN_PASSWORD=...
```

Die öffentliche Anon-ID steht in Supabase unter den API-Einstellungen. Der Service-Role-Key ist geheim und darf niemals im Browser oder in Git landen.

## Initialisierung

Zuerst den Administrator und anschließend die vorhandenen Inhalte anlegen:

```bash
npm run seed:admin
npm run seed:content
```

`seed:content` lädt alle Bilder aus `assets/Speisen` und `assets/Rooms`, Logo, Titelbild und Speisekarten-PDF in Supabase Storage. Der erfolgreiche Lauf wird in `seed_runs` gespeichert. Ein erneuter Import ist nur bewusst möglich:

```bash
npm run seed:content -- --force
```

Der erzwungene Import kann zuvor über den Admin gelöschte Seed-Bilder wiederherstellen.

## Entwicklung

```bash
npm run dev
```

- Webseite: `http://localhost:3000`
- Administration: `http://localhost:3000/admin`

Ohne Supabase-Konfiguration zeigt die öffentliche Seite automatisch die lokalen Assets und initialen Restaurantinformationen. Der Admin-Bereich benötigt Supabase.

## Prüfungen

```bash
npm run lint
npm run typecheck
npm run build
```

## Vercel

In Vercel werden nur diese Variablen benötigt:

```dotenv
NEXT_PUBLIC_SITE_URL=https://ihre-domain.de
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

`SUPABASE_SERVICE_ROLE_KEY` und die initialen Admin-Zugangsdaten werden nur lokal für die Seed-Skripte gebraucht und sollten nicht bei Vercel hinterlegt werden. Die Domain wird anschließend im Vercel-Projekt verbunden.

## Sicherheit

`.env.local` ist über `.gitignore` ausgeschlossen. Das initiale Passwort bleibt dort auf ausdrücklichen Wunsch lokal gespeichert. Eine zusätzliche Ablage in einem Passwortmanager ist sicherer. Supabase selbst speichert das Passwort nur gehasht.

Die mitgelieferte Datenschutzerklärung ist ein technischer Platzhalter und muss vor Veröffentlichung rechtlich geprüft und an das konkrete Hosting sowie die tatsächlichen Verarbeitungsprozesse angepasst werden.
