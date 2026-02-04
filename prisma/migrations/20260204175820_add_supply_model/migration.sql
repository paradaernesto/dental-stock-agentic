-- CreateTable
CREATE TABLE "Supply" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "minStock" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Supply_code_key" ON "Supply"("code");

-- CreateIndex
CREATE INDEX "Supply_name_idx" ON "Supply"("name");

-- CreateIndex
CREATE INDEX "Supply_code_idx" ON "Supply"("code");
