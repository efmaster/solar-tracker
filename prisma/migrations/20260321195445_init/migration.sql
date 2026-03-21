-- CreateTable
CREATE TABLE "EnergyYield" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "kwh" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "EnergyYield_date_key" ON "EnergyYield"("date");

-- CreateIndex
CREATE INDEX "EnergyYield_date_idx" ON "EnergyYield"("date");
