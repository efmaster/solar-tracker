# 🚀 Quick Start - Solarertrag Tracker

## Wichtig: Prisma Client generieren

Die Anwendung benötigt den Prisma Client. Bitte führe **in einem separaten Terminal** folgende Befehle aus:

### Schritt 1: Prisma Client generieren
```bash
npx prisma generate
```

### Schritt 2: .env Datei prüfen
Stelle sicher, dass die `.env` Datei folgenden Inhalt hat:
```
DATABASE_URL="file:./prisma/dev.db"
```

### Schritt 3: Anwendung starten
```bash
npm run dev
```

### Schritt 4: Browser öffnen
Öffne: `http://localhost:3000`

---

## ✅ Was bereits fertig ist:

- ✅ Datenbank existiert unter `prisma/dev.db`
- ✅ Alle Dependencies installiert
- ✅ Dark Mode mit Toggle-Button (Sonne/Mond Icon)
- ✅ Komplettes Dashboard mit:
  - Tageseingabe mit Edit-Modus
  - Monatsübersicht mit Farbcodierung (Rot=niedrig, Gelb=mittel, Grün=hoch)
  - Tagesertrag Liniendiagramm
  - Monatsertrag Balkendiagramm
  - Jahresübersicht mit allen Monaten
- ✅ Responsive Design
- ✅ API Routes für CRUD Operationen

---

## 🎨 Features:

### Dark Mode
- Klicke auf das Sonne/Mond Icon oben rechts
- Wechselt elegant zwischen Hell- und Dunkel-Modus
- Einstellung wird im Browser gespeichert

### Dateneingabe
1. Wähle ein Datum (heute ist vorausgewählt)
2. Klicke auf "Bearbeiten"
3. Gib den kW/h Wert ein
4. Klicke auf "Speichern"

### Monatsnavigation
- Pfeile links/rechts zum Wechseln der Monate
- Klicke auf einen Tag im Kalender, um ihn auszuwählen

### Farbcodierung
- **Rot**: Niedriger Ertrag (0-20% des Monatsmaximums)
- **Orange**: Unterdurchschnittlich (20-40%)
- **Gelb**: Durchschnittlich (40-60%)
- **Hellgrün**: Überdurchschnittlich (60-80%)
- **Grün**: Hoher Ertrag (80-100%)

---

## 🔧 Troubleshooting:

### Fehler: "@prisma/client did not initialize yet"
**Lösung**: Führe `npx prisma generate` aus

### Fehler: "HTTP error! status: 500"
**Lösung**: Prisma Client muss generiert werden (siehe oben)

### Dark Mode funktioniert nicht
**Lösung**: Browser-Cache leeren und neu laden

---

## 📊 Technologie:

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: TailwindCSS v4, shadcn/ui
- **Diagramme**: Recharts
- **Datenbank**: SQLite mit Prisma ORM
- **Icons**: Lucide React
