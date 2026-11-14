import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load secrets from the .env file at the repo root
config({ path: "../../.env" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing. Add it to the .env file at the repo root.");
}

export default defineConfig({
  schema: "./src/schema/index.ts", // where our tables are defined
  out: "./drizzle",                // where migration SQL files are saved
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL },
});
