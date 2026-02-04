import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sampleSupplies = [
  { name: "Nitrile Gloves (Medium)", code: "GLV-NIT-M", stock: 500, minStock: 100 },
  { name: "Nitrile Gloves (Large)", code: "GLV-NIT-L", stock: 300, minStock: 80 },
  { name: "Latex Gloves (Medium)", code: "GLV-LAT-M", stock: 200, minStock: 50 },
  { name: "Surgical Masks", code: "MSK-SUR-001", stock: 1000, minStock: 200 },
  { name: "N95 Masks", code: "MSK-N95-001", stock: 150, minStock: 50 },
  { name: "Dental Floss", code: "FLO-001", stock: 80, minStock: 30 },
  { name: "Cotton Rolls (Pack)", code: "CTR-PACK", stock: 600, minStock: 150 },
  { name: "Local Anesthetic", code: "ANE-LOC-001", stock: 25, minStock: 10 },
  { name: "Dental Bibs", code: "BIB-DEN-001", stock: 400, minStock: 100 },
  { name: "Autoclave Pouches", code: "PCH-AUTO-001", stock: 250, minStock: 75 },
  { name: "Dental Mirror Heads", code: "MIR-HEAD-001", stock: 50, minStock: 20 },
  { name: "Probe (Explorer)", code: "PRB-EXP-001", stock: 30, minStock: 15 },
  { name: "Suction Tips", code: "SUC-TIP-001", stock: 300, minStock: 100 },
  { name: "Composite Resin", code: "RES-COMP-001", stock: 40, minStock: 15 },
  { name: "Dental Cement", code: "CEM-DEN-001", stock: 20, minStock: 8 },
];

async function main() {
  console.log("🌱 Starting database seed...");

  // Clean existing data
  await prisma.supply.deleteMany();
  console.log("✅ Cleaned existing supplies");

  // Create sample supplies
  for (const supply of sampleSupplies) {
    await prisma.supply.create({
      data: supply,
    });
  }

  console.log(`✅ Created ${sampleSupplies.length} sample supplies`);
  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
