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
    update: {
      label: "Van 2 • Drawer 3",
      active: true,
      boxItems: {
        deleteMany: {},
        create: [{ itemId: item1.id }],
      },
    },
    create: {
      token: "X7kP29dL",
      label: "Van 2 • Drawer 3",
      boxItems: { create: [{ itemId: item1.id }] },
    },
  });

  await prisma.box.upsert({
    where: { token: "A1B2C3D4" },
    update: {
      label: "Stores • Shelf A • Box 4",
      active: true,
      boxItems: {
        deleteMany: {},
        create: [{ itemId: item2.id }],
      },
    },
    create: {
      token: "A1B2C3D4",
      label: "Stores • Shelf A • Box 4",
      boxItems: { create: [{ itemId: item2.id }] },
    },
  });

  await prisma.appConfig.upsert({
    where: { id: "default" },
    create: { id: "default", editWindowMinutes: 10 },
    update: {},
  });

  const adminEmail = "admin@stockpod.co.uk";
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
