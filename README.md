# ☀️ Solar Tracker

![Docker Build](https://github.com/efmaster/solar-tracker/actions/workflows/docker-build.yml/badge.svg)
![License](https://img.shields.io/badge/license-GPL--v3-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.2-black)
![Docker](https://img.shields.io/badge/docker-ready-blue)

A modern web application for monitoring and analyzing your daily solar energy yield with comprehensive visualizations and export functionality.

## 📸 Screenshots

> *Add your app screenshots here*

## ✨ Features

### 📊 Data Visualization
- **Interactive Calendar** - Monthly view with color-coded yields
- **Yearly Heatmap** - GitHub-style visualization of the entire year
- **Multiple Chart Types** - Yearly, monthly, and daily views
- **Year Comparison** - Compare different years side by side

### 💰 Financial Analysis
- **Cost Calculation** - Monthly advance payment and feed-in tariff
- **Balance Display** - Income vs. prepayment with color coding
- **Monthly Comparison** - Compare months across multiple years

### 🌱 Environmental Tracking
- **CO₂ Savings** - Calculate your CO₂ reduction
- **Tree Equivalent** - How many trees does your savings equal?

### 📤 Export & Import
- **CSV Export** - For Excel and other tools
- **PDF Export** - Printable reports with summary
- **CSV Import** - Easy data import

### 🔍 Data Quality
- **Missing Days** - Automatic detection and warnings
- **Data Validation** - Highlighting of unusual values
- **Calendar Highlights** - Visual indicators for issues

### 📱 Progressive Web App (PWA)
- **Offline Usage** - Works without internet connection
- **Installable** - Install as app on smartphone/desktop
- **Touch Optimized** - Perfect for mobile devices
- **Dark Mode** - Automatic light/dark theme switching

## 🚀 Quick Start

### With Docker (Recommended)

```bash
docker run -d \
  --name solar-tracker \
  -p 3000:3000 \
  -v solar-data:/app/prisma \
  -e DATABASE_URL=file:./prisma/dev.db \
  ghcr.io/efmaster/solar-tracker:latest
```

Open: `http://localhost:3000`

### With Docker Compose

```yaml
version: '3.8'

services:
  solar-tracker:
    image: ghcr.io/efmaster/solar-tracker:latest
    ports:
      - "3000:3000"
    volumes:
      - solar-data:/app/prisma
    environment:
      - DATABASE_URL=file:./prisma/dev.db
    restart: unless-stopped

volumes:
  solar-data:
```

### Local Development

```bash
# Clone repository
git clone https://github.com/efmaster/solar-tracker.git
cd solar-tracker

# Install dependencies
npm install

# Initialize database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

Open: `http://localhost:3000`

## 🛠️ Tech Stack

- **Framework**: Next.js 16.2 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Database**: SQLite with Prisma ORM
- **PWA**: Service Worker, Manifest
- **Deployment**: Docker, Multi-Stage Build

## 📦 Deployment

### Docker

The application is available as a Docker image:

```bash
docker pull ghcr.io/efmaster/solar-tracker:latest
```

### Other Platforms

- **Vercel**: `vercel deploy`
- **Railway**: One-Click Deploy
- **Any Docker Host**: See Docker instructions above

For detailed deployment instructions, see [GITHUB-DOCKER-SETUP.md](./GITHUB-DOCKER-SETUP.md)

## 🔧 Configuration

### Environment Variables

```env
NODE_ENV=production
DATABASE_URL=file:./prisma/dev.db
```

### Persistent Data

Data is stored in SQLite at `/app/prisma/dev.db`

**Important**: Mount a volume for data persistence!

```bash
-v solar-data:/app/prisma
```

## 📊 Usage

### Adding Data

1. Click on a day in the calendar
2. Enter the kWh value
3. Save

### CSV Import

1. Click "Import"
2. Select CSV file (Format: `DD.MM.YYYY,KWH`)
3. Start import

### Export

1. Click "Export"
2. Choose format (CSV or PDF)
3. File will be downloaded

### Year Comparison

1. Click "Jahresvergleich"
2. Enter advance payment and feed-in tariff
3. View comparison table and charts

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Roadmap

- [ ] Multi-user support
- [ ] API for external data sources
- [ ] Automatic import from inverters
- [ ] Mobile app (React Native)
- [ ] Notifications for missing data
- [ ] Weather integration
- [ ] Forecast functionality

## 🐛 Bug Reports

Please open an [Issue](https://github.com/efmaster/solar-tracker/issues) with:
- Description of the problem
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots (if relevant)
- Browser/system info

## 📄 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

### What does this mean?

- ✅ You can use, modify, and distribute this software
- ✅ You can use it commercially
- ⚠️ If you distribute modified versions, you MUST:
  - Make the source code available
  - License it under GPL v3
  - Document your changes
- ❌ You cannot make it proprietary/closed-source

This ensures all improvements remain open source for everyone!

## 👤 Author

**Phillip Wadecki**
- GitHub: [@efmaster](https://github.com/efmaster)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- shadcn for the UI components
- All contributors

## 📞 Support

- 📧 Email: knolle_formular_0q@icloud.com
- 💬 Discussions: [GitHub Discussions](https://github.com/efmaster/solar-tracker/discussions)
- 🐛 Issues: [GitHub Issues](https://github.com/efmaster/solar-tracker/issues)

---

**⭐ If you like this project, give it a star!**
