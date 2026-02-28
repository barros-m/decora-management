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

  // Seed inquiries with different statuses
  const statuses: Array<"NEW" | "IN_REVIEW" | "WAITING_ON_CLIENT" | "QUOTING" | "QUOTED_WAITING" | "ACCEPTED_NOT_BOOKED" | "BOOKED" | "LOST" | "DISQUALIFIED" | "EXPIRED"> = [
    "NEW",
    "IN_REVIEW",
    "WAITING_ON_CLIENT",
    "QUOTING",
    "QUOTED_WAITING",
    "ACCEPTED_NOT_BOOKED",
    "BOOKED",
    "LOST",
    "DISQUALIFIED",
    "EXPIRED",
  ];

  const inquiries = await Promise.all(
    statuses.map((status, index) =>
      prisma.inquiry.upsert({
        where: { id: `inquiry-${status.toLowerCase()}` },
        create: {
          id: `inquiry-${status.toLowerCase()}`,
          contactName: `Test Contact - ${status}`,
          contactEmail: `contact-${status.toLowerCase()}@test.com`,
          contactPhone: "+1 (555) 123-4567",
          eventType: "Wedding Reception",
          eventDate: new Date(2025, 5, 15 + index), // June 2025
          city: "San Francisco",
          state: "CA",
          zipCode: "94105",
          address1: "123 Market Street",
          guestCountAdults: 50 + index * 5,
          guestCountChildren: 10 + index * 2,
          visionNotes: `This is a test inquiry in ${status} status for testing the inquiry management system.`,
          source: "Website",
          status,
          assignedToId: user.id,
        },
        update: {
          status,
          assignedToId: user.id,
        },
        select: { id: true, contactName: true, status: true },
      })
    )
  );

  console.log(`\nSeeded ${inquiries.length} inquiries with different statuses:`);
  inquiries.forEach((inq) => {
    console.log(`  - ${inq.contactName} (${inq.status})`);
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
