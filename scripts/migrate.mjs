// Run: node scripts/migrate.mjs
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = neon(process.env.DATABASE_URL);
const schema = readFileSync(join(__dirname, "schema.sql"), "utf8");

console.log("Running migration...");
await sql(schema);
console.log("Done.");
