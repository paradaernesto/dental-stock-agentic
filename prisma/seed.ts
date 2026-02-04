import { prisma } from "@/lib/db";

const sampleSupplies = [
  {
    name: "Nitrile Gloves",
    category: "PPE",
    unit: "box",
    stock: 500,
    minimumStock: 100,
  },
  {
    name: "Latex Gloves",
    category: "PPE",
    unit: "box",
    stock: 300,
    minimumStock: 50,
  },
  {
    name: "Dental Masks",
    category: "PPE",
    unit: "box",
    stock: 1000,
    minimumStock: 200,
  },
  {
    name: "Dental Bibs",
    category: "Consumables",
    unit: "pack",
    stock: 2000,
    minimumStock: 500,
  },
  {
    name: "Cotton Rolls",
    category: "Consumables",
    unit: "pack",
    stock: 150,
    minimumStock: 50,
  },
  {
    name: "Composite Resin",
    category: "Materials",
    unit: "syringe",
    stock: 25,
    minimumStock: 10,
  },
  {
    name: "Dental Floss",
    category: "Consumables",
    unit: "box",
    stock: 100,
    minimumStock: 30,
  },
  {
    name: "Sterilization Pouches",
    category: "Sterilization",
    unit: "box",
    stock: 500,
    minimumStock: 100,
  },
  {
    name: "Dental Mirrors",
    category: "Instruments",
    unit: "piece",
    stock: 50,
    minimumStock: 20,
  },
  {
    name: "Explorers",
    category: "Instruments",
    unit: "piece",
    stock: 40,
    minimumStock: 15,
  },
  {
    name: "Anesthetic Cartridges",
    category: "Medications",
    unit: "box",
    stock: 200,
    minimumStock: 50,
  },
  {
    name: "Disposable Syringes",
    category: "Consumables",
    unit: "box",
    stock: 300,
    minimumStock: 100,
  },
  {
    name: "Needles 27G",
    category: "Consumables",
    unit: "box",
    stock: 250,
    minimumStock: 75,
  },
  {
    name: "Needles 30G",
    category: "Consumables",
    unit: "box",
    stock: 200,
    minimumStock: 60,
  },
  {
    name: "Articulating Paper",
    category: "Consumables",
    unit: "pack",
    stock: 150,
    minimumStock: 40,
  },
  {
    name: "Impression Material",
    category: "Materials",
    unit: "pack",
    stock: 30,
    minimumStock: 10,
  },
  {
    name: "Temporary Cement",
    category: "Materials",
    unit: "tube",
    stock: 20,
    minimumStock: 5,
  },
  {
    name: "Dental Dam",
    category: "Consumables",
    unit: "box",
    stock: 80,
    minimumStock: 25,
  },
  {
    name: "Rubber Dam Clamps",
    category: "Instruments",
    unit: "set",
    stock: 45,
    minimumStock: 15,
  },
  {
    name: "Suction Tips",
    category: "Consumables",
    unit: "bag",
    stock: 1000,
    minimumStock: 300,
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
