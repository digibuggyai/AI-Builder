import { config } from "dotenv";
import postgres from "postgres";

config({ path: "../.env", quiet: true });

const url = process.env.DATABASE_URL;
if (!url) {
  console.log("DATABASE_URL is missing in .env");
  process.exit(1);
}

const u = new URL(url);
console.log(`Connecting to ${u.hostname}:${u.port} (password hidden)...`);

const sql = postgres(url, { connect_timeout: 10 });
try {
  const rows = await sql`select version()`;
  console.log("CONNECTED:", rows[0].version.slice(0, 40));
} catch (err) {
  console.log("ERROR:", err.code, "-", err.message);
} finally {
  await sql.end();
}
