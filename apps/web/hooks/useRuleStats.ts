import useSWR from "swr";
import { useParams } from "next/navigation";
import { fetchWithAccount } from "@/utils/fetch";
import type { RuleStatsResponse } from "@/app/api/user/stats/rule-stats/route";

interface UseRuleStatsOptions {
  fromDate?: string;
  toDate?: string;
}

export function useRuleStats(options: UseRuleStatsOptions = {}) {
  const { fromDate, toDate } = options;
  const params = useParams<{ emailAccountId: string | undefined }>();
  const emailAccountId = params.emailAccountId;

  const searchParams = new URLSearchParams();
  if (fromDate) searchParams.set("fromDate", fromDate);
  if (toDate) searchParams.set("toDate", toDate);

  const url = `/api/user/stats/rule-stats${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  return useSWR<RuleStatsResponse>(
    emailAccountId ? url : null,
    async (url: string) => {
      const response = await fetchWithAccount({ url, emailAccountId });
      if (!response.ok) {
        throw new Error(`Failed to fetch rule stats: ${response.status}`);
      }
      return response.json();
    },
  );
}
