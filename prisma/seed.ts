import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

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

  const missing: string[] = [];
  if (!email) missing.push("SEED_USER_EMAIL");
  if (!password) missing.push("SEED_USER_PASSWORD");
  if (!name) missing.push("SEED_USER_NAME");
  if (!role) missing.push("SEED_USER_ROLE");

  if (missing.length > 0) {
    throw new Error(
      `Missing required env vars for seeding: ${missing.join(", ")}`,
    );
  }

  const safeEmail = email as string;
  const safePassword = password as string;
  const safeName = name as string;
  const safeRole = role as "OWNER" | "ADMIN" | "USER";

  if (safePassword.length < 8) {
    throw new Error("SEED_USER_PASSWORD must be at least 8 characters.");
  }

  if (safeRole !== "OWNER" && safeRole !== "ADMIN" && safeRole !== "USER") {
    throw new Error("SEED_USER_ROLE must be one of: OWNER, ADMIN, USER.");
  }

  const passwordHash = await bcrypt.hash(safePassword, 12);

  const user = await prisma.user.upsert({
    where: { email: safeEmail },
    create: {
      email: safeEmail,
      name: safeName,
      role: safeRole,
      isActive: true,
      passwordHash,
    },
    update: {
      name: safeName,
      role: safeRole,
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
