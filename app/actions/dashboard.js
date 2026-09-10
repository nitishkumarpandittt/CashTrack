"use server";

import { loadFinancialData } from "@/utils/financialSnapshot";
import { requireEmail, run } from "./_shared";

/** Everything the dashboard home renders, in one round trip. */
export async function getDashboardData() {
  return run(async () => loadFinancialData(await requireEmail()));
}
