import fs from "node:fs";

function stripOuterQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function toQuotedEnvValue(value) {
  return `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

const envPath = new URL("../.env", import.meta.url);
const env = fs.readFileSync(envPath, "utf8");

const match = env.match(/^DATABASE_URL\s*=\s*(.+)$/m);
if (!match) {
  console.error("No DATABASE_URL line found in .env");
  process.exit(1);
}

const originalRhs = match[1].trim();

let rhs = originalRhs;
rhs = stripOuterQuotes(rhs.trim());

if (rhs.startsWith("psql ")) {
  rhs = rhs.slice(5).trim();
  rhs = stripOuterQuotes(rhs);
}

const pgIndex = rhs.indexOf("postgresql://");
const pgAltIndex = rhs.indexOf("postgres://");
if (!rhs.startsWith("postgresql://") && !rhs.startsWith("postgres://")) {
  const index = pgIndex >= 0 ? pgIndex : pgAltIndex;
  if (index >= 0) rhs = rhs.slice(index).trim();
  rhs = stripOuterQuotes(rhs);
}

if (!rhs.startsWith("postgresql://") && !rhs.startsWith("postgres://")) {
  console.error(
    "DATABASE_URL does not look like a Postgres connection string after sanitizing.",
  );
  console.error("Original prefix:", originalRhs.slice(0, 32));
  process.exit(1);
}

const nextEnv = env.replace(
  /^DATABASE_URL\s*=\s*(.+)$/m,
  `DATABASE_URL=${toQuotedEnvValue(rhs)}`,
);

fs.writeFileSync(envPath, nextEnv);
console.log("Sanitized DATABASE_URL in .env");

