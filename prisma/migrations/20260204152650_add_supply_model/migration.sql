-- CreateTable
CREATE TABLE "Supply" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "unitPrice" REAL NOT NULL,
    "supplier" TEXT,
    "category" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Supply_code_key" ON "Supply"("code");

-- CreateIndex
CREATE INDEX "Supply_code_idx" ON "Supply"("code");

-- CreateIndex
CREATE INDEX "Supply_name_idx" ON "Supply"("name");

-- CreateIndex
CREATE INDEX "Supply_category_idx" ON "Supply"("category");
