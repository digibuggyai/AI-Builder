import { integer, pgEnum, pgTable } from "drizzle-orm/pg-core";
import { partColumns } from "./_shared";

export const storageType = pgEnum("storage_type", ["NVMe", "SATA SSD", "HDD"]);

export const storage = pgTable("storage", {
  ...partColumns(),
  type: storageType("type").notNull(),         // NVMe needs an M.2 slot
  capacityGb: integer("capacity_gb").notNull(),
  pcieVersion: integer("pcie_version"),        // only for NVMe: 3, 4 or 5
  readMbps: integer("read_mbps"),
  writeMbps: integer("write_mbps"),
});
