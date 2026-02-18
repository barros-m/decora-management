import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const adminName = process.env.SEED_ADMIN_NAME ?? "Admin";

  const managerEmail = process.env.SEED_MANAGER_EMAIL;
  const managerPassword = process.env.SEED_MANAGER_PASSWORD;
  const managerName = process.env.SEED_MANAGER_NAME ?? "Manager";

  if (
    !adminEmail &&
    !adminPassword &&
    !managerEmail &&
    !managerPassword
  ) {
    throw new Error(
      "Missing seeding env vars. Provide SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD or SEED_MANAGER_EMAIL/SEED_MANAGER_PASSWORD.",
    );
  }

  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { name: adminName, passwordHash, role: "ADMIN" },
      create: { email: adminEmail, name: adminName, passwordHash, role: "ADMIN" },
    });
    console.log(`Seeded admin user: ${adminEmail}`);
  }

  if (managerEmail && managerPassword) {
    const passwordHash = await bcrypt.hash(managerPassword, 12);
    await prisma.user.upsert({
      where: { email: managerEmail },
      update: { name: managerName, passwordHash, role: "MANAGER" },
      create: {
        email: managerEmail,
        name: managerName,
        passwordHash,
        role: "MANAGER",
      },
    });
    console.log(`Seeded manager user: ${managerEmail}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
