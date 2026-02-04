import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sampleSupplies = [
  {
    name: "Nitrile Gloves",
    code: "SUP-001",
    description: "Blue nitrile examination gloves, powder-free",
    quantity: 500,
    minStock: 100,
  },
  {
    name: "Latex Gloves",
    code: "SUP-002",
    description: "Latex examination gloves, powder-free",
    quantity: 300,
    minStock: 50,
  },
  {
    name: "Dental Masks",
    code: "SUP-003",
    description: "Surgical masks with ear loops, 3-ply",
    quantity: 1000,
    minStock: 200,
  },
  {
    name: "Dental Bibs",
    code: "SUP-004",
    description: "Patient bibs, 2-ply paper + 1-ply poly",
    quantity: 2000,
    minStock: 500,
  },
  {
    name: "Cotton Rolls",
    code: "SUP-005",
    description: "Sterile cotton rolls for dental procedures",
    quantity: 150,
    minStock: 50,
  },
  {
    name: "Composite Resin",
    code: "SUP-006",
    description: "Universal composite resin, shade A2",
    quantity: 25,
    minStock: 10,
  },
  {
    name: "Dental Floss",
    code: "SUP-007",
    description: "Waxed dental floss, mint flavor",
    quantity: 100,
    minStock: 30,
  },
  {
    name: "Sterilization Pouches",
    code: "SUP-008",
    description: "Self-sealing sterilization pouches, 3.5\" x 10\"",
    quantity: 500,
    minStock: 100,
  },
  {
    name: "Dental Mirrors",
    code: "SUP-009",
    description: "Stainless steel dental mirrors, #5",
    quantity: 50,
    minStock: 20,
  },
  {
    name: "Explorers",
    code: "SUP-010",
    description: "Dental explorers, sharp point",
    quantity: 40,
    minStock: 15,
  },
  {
    name: "Anesthetic Cartridges",
    code: "SUP-011",
    description: "Lidocaine 2% with epinephrine 1:100,000",
    quantity: 200,
    minStock: 50,
  },
  {
    name: "Disposable Syringes",
    code: "SUP-012",
    description: "3cc disposable syringes without needle",
    quantity: 300,
    minStock: 100,
  },
  {
    name: "Needles 27G",
    code: "SUP-013",
    description: "27 gauge dental needles, short",
    quantity: 250,
    minStock: 75,
  },
  {
    name: "Needles 30G",
    code: "SUP-014",
    description: "30 gauge dental needles, short",
    quantity: 200,
    minStock: 60,
  },
  {
    name: "Articulating Paper",
    code: "SUP-015",
    description: "Blue articulating paper strips",
    quantity: 150,
    minStock: 40,
  },
  {
    name: "Impression Material",
    code: "SUP-016",
    description: "Alginate impression material, fast set",
    quantity: 30,
    minStock: 10,
  },
  {
    name: "Temporary Cement",
    code: "SUP-017",
    description: "Zinc oxide eugenol temporary cement",
    quantity: 20,
    minStock: 5,
  },
  {
    name: "Dental Dam",
    code: "SUP-018",
    description: "Latex dental dam, medium gauge",
    quantity: 80,
    minStock: 25,
  },
  {
    name: "Rubber Dam Clamps",
    code: "SUP-019",
    description: "Assorted rubber dam clamps",
    quantity: 45,
    minStock: 15,
  },
  {
    name: "Suction Tips",
    code: "SUP-020",
    description: "Disposable saliva ejectors, clear",
    quantity: 1000,
    minStock: 300,
  },
];

async function main() {
  console.log("Seeding database with sample supplies...");

  // Clear existing data
  await prisma.supply.deleteMany();
  console.log("Cleared existing supplies");

  // Insert sample data
  for (const supply of sampleSupplies) {
    await prisma.supply.create({
      data: supply,
    });
  }

  console.log(`Seeded ${sampleSupplies.length} supplies`);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
