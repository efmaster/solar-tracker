# 🖥️ Synology NAS Deployment Guide

## Option 1: Docker Container (Empfohlen) ⭐

### Voraussetzungen
- Synology NAS mit DSM 7.0+
- Docker Package installiert (Package Center → Docker)
- SSH-Zugriff aktiviert (optional, für Kommandozeile)

### Deployment-Schritte

#### 1. Projekt auf Synology übertragen

**Via File Station:**
1. Öffne File Station
2. Erstelle Ordner: `/docker/solar-tracker`
3. Lade alle Projektdateien hoch

**Via SSH/SFTP:**
```bash
# Auf lokalem PC
scp -r /path/to/suncloud admin@synology-ip:/volume1/docker/solar-tracker
```

#### 2. Docker Container erstellen

**Via Docker GUI:**
1. Öffne Docker App
2. Gehe zu "Image" → "Hinzufügen" → "Aus Datei hinzufügen"
3. Wähle `Dockerfile` aus `/docker/solar-tracker`
4. Image-Name: `solar-tracker:latest`
5. Build starten

**Via SSH:**
```bash
# SSH in Synology
ssh admin@synology-ip

# Zum Projektordner
cd /volume1/docker/solar-tracker

# Docker Image bauen
sudo docker build -t solar-tracker:latest .

# Container starten
sudo docker-compose up -d
```

#### 3. Container konfigurieren

**Ports:**
- Host: `3000` → Container: `3000`
- Zugriff: `http://synology-ip:3000`

**Volumes (wichtig für Datenpersistenz):**
- `/volume1/docker/solar-tracker/prisma` → `/app/prisma`

**Umgebungsvariablen:**
- `NODE_ENV=production`
- `DATABASE_URL=file:./prisma/dev.db`

#### 4. Container starten

**Via Docker GUI:**
1. Gehe zu "Container"
2. Wähle `solar-tracker`
3. Klicke "Aktion" → "Starten"

**Via SSH:**
```bash
sudo docker-compose up -d
```

#### 5. Zugriff testen

Öffne Browser: `http://synology-ip:3000`

---

## Option 2: Node.js direkt (Fortgeschritten)

### Voraussetzungen
- Node.js Package installiert (Package Center)
- SSH-Zugriff

### Schritte

```bash
# SSH in Synology
ssh admin@synology-ip

# Node.js Version prüfen
node --version  # Sollte 18+ sein

# Projekt-Ordner
cd /volume1/web/solar-tracker

# Dependencies installieren
npm ci

# Prisma generieren
npx prisma generate
npx prisma db push

# Build
npm run build

# PM2 installieren (für Prozess-Management)
sudo npm install -g pm2

# App starten
pm2 start npm --name "solar-tracker" -- start

# Auto-Start bei Neustart
pm2 startup
pm2 save
```

---

## Reverse Proxy Setup (Optional)

### Mit Synology Reverse Proxy

1. **DSM Systemsteuerung** → **Anwendungsportal** → **Reverse Proxy**
2. **Erstellen**:
   - Beschreibung: `Solar Tracker`
   - Quelle:
     - Protokoll: `HTTPS`
     - Hostname: `solar.deine-domain.de`
     - Port: `443`
   - Ziel:
     - Protokoll: `HTTP`
     - Hostname: `localhost`
     - Port: `3000`
3. **SSL-Zertifikat** zuweisen (Let's Encrypt empfohlen)

Zugriff dann über: `https://solar.deine-domain.de`

---

## Automatische Updates

### Docker-Compose mit Watchtower

Füge zu `docker-compose.yml` hinzu:

```yaml
services:
  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: --interval 86400  # Täglich prüfen
```

---

## Backup-Strategie

### Datenbank sichern

**Manuell:**
```bash
# Datenbank kopieren
docker cp solar-tracker:/app/prisma/dev.db ./backup/dev.db.$(date +%Y%m%d)
```

**Automatisch (Synology Hyper Backup):**
1. Hyper Backup öffnen
2. Datensicherung erstellen
3. Ordner hinzufügen: `/docker/solar-tracker/prisma`
4. Zeitplan: Täglich

---

## Troubleshooting

### Container startet nicht
```bash
# Logs anzeigen
sudo docker logs solar-tracker

# Container neu starten
sudo docker-compose down
sudo docker-compose up -d
```

### Datenbank-Fehler
```bash
# In Container einsteigen
sudo docker exec -it solar-tracker sh

# Prisma neu initialisieren
npx prisma db push
```

### Port bereits belegt
```bash
# Port in docker-compose.yml ändern
ports:
  - "3001:3000"  # Statt 3000:3000
```

---

## Performance-Tipps

1. **SSD-Cache** aktivieren (wenn verfügbar)
2. **RAM** mindestens 2GB für Container reservieren
3. **Netzwerk**: Bridge-Modus für beste Performance

---

## Zugriff von außerhalb

### DynDNS + Port-Forwarding

1. **DynDNS** einrichten (z.B. Synology DDNS)
2. **Router**: Port 3000 auf Synology weiterleiten
3. **Firewall**: Port 3000 freigeben
4. **Zugriff**: `http://deine-ddns-adresse.synology.me:3000`

**Sicherheitshinweis**: Besser Reverse Proxy mit HTTPS verwenden!

---

## Ressourcen-Anforderungen

- **CPU**: 1 Core (minimal)
- **RAM**: 512MB (minimal), 1GB (empfohlen)
- **Speicher**: ~500MB für App + Datenbank
- **Netzwerk**: 100 Mbit/s

---

## Support & Updates

- **Logs**: `/volume1/docker/solar-tracker/logs`
- **Datenbank**: `/volume1/docker/solar-tracker/prisma/dev.db`
- **Updates**: `docker-compose pull && docker-compose up -d`

---

**Viel Erfolg mit deinem Solarertrag Tracker auf Synology! ☀️**
