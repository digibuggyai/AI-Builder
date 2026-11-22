import { CATEGORIES, USE_CASE_IDS } from "@pcb/shared";
import { z } from "zod";

export const category = z.enum(CATEGORIES);
export const useCase = z.enum(USE_CASE_IDS);
export const budget = z.number().int().min(10_000).max(2_000_000);

export const selection = z.partialRecord(category, z.string().min(1)).default({});
