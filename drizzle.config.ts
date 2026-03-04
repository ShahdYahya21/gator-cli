import { defineConfig } from "drizzle-kit";
import fs from "fs";

const { db_url: dbUrl } = JSON.parse(fs.readFileSync(".gatorconfig.json", "utf-8"));

export default defineConfig({
  schema: "src/db/schema.ts",
  out: "src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});