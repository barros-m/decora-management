import fs from "node:fs";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

const outPath = process.argv[2];
if (!outPath) {
  console.error("Usage: node scripts/generate-admin-upsert-sql.mjs <out.sql>");
  process.exit(1);
}

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME ?? "Admin";

if (!email || !password) {
  console.error("Missing ADMIN_EMAIL or ADMIN_PASSWORD in environment.");
  process.exit(1);
}

const id = crypto.randomUUID();
const passwordHash = await bcrypt.hash(password, 12);

const sql = `INSERT INTO "User" ("id","email","name","passwordHash","role","updatedAt")
VALUES (${sqlString(id)}, ${sqlString(email)}, ${sqlString(name)}, ${sqlString(passwordHash)}, 'ADMIN', NOW())
ON CONFLICT ("email") DO UPDATE SET
  "name" = EXCLUDED."name",
  "passwordHash" = EXCLUDED."passwordHash",
  "role" = EXCLUDED."role",
  "updatedAt" = NOW();\n`;

fs.writeFileSync(outPath, sql);
console.log(`Wrote admin upsert SQL to ${outPath}`);

