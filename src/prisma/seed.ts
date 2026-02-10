import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";

async function main() {
  const item1 =
    (await prisma.item.findFirst({ where: { name: "15mm Elbow" } })) ??
    (await prisma.item.create({
      data: { name: "15mm Elbow", unit: "EACH", currentStock: 100, },
    }));

  const item2 =
    (await prisma.item.findFirst({ where: { name: "22mm Copper Pipe" } })) ??
    (await prisma.item.create({
      data: { name: "22mm Copper Pipe", unit: "METRE" },
    }));

  await prisma.box.upsert({
    where: { token: "X7kP29dL" },
    update: { label: "Van 2 • Drawer 3", itemId: item1.id, active: true },
    create: { token: "X7kP29dL", label: "Van 2 • Drawer 3", itemId: item1.id },
  });

  await prisma.box.upsert({
    where: { token: "A1B2C3D4" },
    update: { label: "Stores • Shelf A • Box 4", itemId: item2.id, active: true },
    create: { token: "A1B2C3D4", label: "Stores • Shelf A • Box 4", itemId: item2.id },
  });

  const adminEmail = "admin@example.com";
  const adminPassword = "ChangeMe123!";

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Admin login:", adminEmail, adminPassword);

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
