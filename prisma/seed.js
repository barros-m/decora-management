/* eslint-disable @typescript-eslint/no-require-imports */
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcryptjs");

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.SEED_USER_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_USER_PASSWORD?.trim();
  const name = process.env.SEED_USER_NAME?.trim();
  const role = process.env.SEED_USER_ROLE?.trim().toUpperCase();

  const missing = [];
  if (!email) missing.push("SEED_USER_EMAIL");
  if (!password) missing.push("SEED_USER_PASSWORD");
  if (!name) missing.push("SEED_USER_NAME");
  if (!role) missing.push("SEED_USER_ROLE");

  if (missing.length > 0) {
    throw new Error(
      `Missing required env vars for seeding: ${missing.join(", ")}`,
    );
  }

  if (password.length < 8) {
    throw new Error("SEED_USER_PASSWORD must be at least 8 characters.");
  }

  if (role !== "OWNER" && role !== "ADMIN" && role !== "USER") {
    throw new Error("SEED_USER_ROLE must be one of: OWNER, ADMIN, USER.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name,
      role,
      isActive: true,
      passwordHash,
    },
    update: {
      name,
      role,
      isActive: true,
      passwordHash,
    },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!user?.id) throw new Error("Seed user upsert failed.");
  console.log(`Seeded user: ${user.email} (${user.role})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
