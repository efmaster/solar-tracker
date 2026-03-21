Write-Host "Setting up Solarertrag Tracker Database..." -ForegroundColor Green

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    'DATABASE_URL="file:./dev.db"' | Out-File -FilePath ".env" -Encoding utf8
}

# Generate Prisma Client
Write-Host "Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

# Push database schema
Write-Host "Creating database schema..." -ForegroundColor Yellow
npx prisma db push --accept-data-loss

Write-Host "Database setup complete!" -ForegroundColor Green
Write-Host "Run 'npm run dev' to start the application" -ForegroundColor Cyan
