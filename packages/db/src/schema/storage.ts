import { integer, pgEnum, pgTable } from "drizzle-orm/pg-core";
import { partColumns } from "./_shared";

export const storageType = pgEnum("storage_type", ["NVMe", "SATA SSD", "HDD"]);

export const storage = pgTable("storage", {
  ...partColumns(),
  type: storageType("type").notNull(),
  capacityGb: integer("capacity_gb").notNull(),
  pcieVersion: integer("pcie_version"),
  readMbps: integer("read_mbps"),
  writeMbps: integer("write_mbps"),
});
