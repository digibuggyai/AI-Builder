import { db } from "../src/context";
import { syncSheet } from "../src/sheet/sync";

const result = await syncSheet(db, "script");
console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
