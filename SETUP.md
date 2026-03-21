# Solarertrag Tracker - Setup Anleitung

## Datenbank Einrichtung

Die Anwendung verwendet **SQLite** mit Prisma ORM.

### Schritt 1: .env Datei prüfen

Die `.env` Datei sollte bereits existieren. Falls nicht, erstelle sie mit:

```
DATABASE_URL="file:./dev.db"
```

### Schritt 2: Prisma Client generieren

Öffne ein Terminal und führe aus:

```bash
npx prisma generate
```

### Schritt 3: Datenbank Schema erstellen

```bash
npx prisma db push
```

### Schritt 4: Anwendung starten

```bash
npm run dev
```

Die Anwendung läuft dann auf `http://localhost:3000`

## Features

✅ **Tageseingabe** - Trage tägliche kW/h Werte ein
✅ **Monatsübersicht** - Kalenderansicht mit Farbcodierung
✅ **Tagesertrag Diagramm** - Liniendiagramm für den aktuellen Monat
✅ **Monatsertrag Diagramm** - Balkendiagramm für das ganze Jahr
✅ **Jahresübersicht** - Alle Monate im Vergleich
✅ **Dark Mode** - Eleganter Wechsel zwischen Hell/Dunkel
✅ **Responsive Design** - Funktioniert auf Desktop und Mobile

## Technologie Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: TailwindCSS v4, shadcn/ui Komponenten
- **Diagramme**: Recharts
- **Datenbank**: SQLite mit Prisma ORM
- **Icons**: Lucide React

## Warum SQLite?

1. **Keine Installation nötig** - Datei-basierte Datenbank
2. **Perfekt für diese Anwendung** - 365 Einträge/Jahr sind überschaubar
3. **Einfache Backups** - Einfach die `dev.db` Datei kopieren
4. **Zero Configuration** - Läuft sofort nach Setup
5. **Gute Performance** - Mehr als ausreichend für diese Datenmenge

## Troubleshooting

### Fehler: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"

Dieser Fehler tritt auf, wenn Prisma noch nicht generiert wurde. Führe aus:

```bash
npx prisma generate
npx prisma db push
```

### Fehler: "PrismaClient is unable to run in the browser"

Stelle sicher, dass die API Routes (`/app/api/yields/route.ts`) serverseitig laufen und nicht im Browser.

### Dark Mode funktioniert nicht

Lösche den Browser-Cache und lade die Seite neu. Der Theme-Status wird im localStorage gespeichert.
