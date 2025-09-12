"use client";

import { BarChart, Card, Title } from "@tremor/react";
import { useRuleStats } from "@/hooks/useRuleStats";
import { LoadingContent } from "@/components/LoadingContent";
import { Skeleton } from "@/components/ui/skeleton";

interface RuleStatsChartProps {
  fromDate?: string;
  toDate?: string;
  title?: string;
}

export function RuleStatsChart({
  fromDate,
  toDate,
  title = "Executed Rules by Group",
}: RuleStatsChartProps) {
  const { data, isLoading, error } = useRuleStats({ fromDate, toDate });

  // Transform data for the bar chart
  const chartData =
    data?.groupStats.map((group) => ({
      group: group.groupName,
      "Executed Rules": group.executedCount,
    })) || [];

  return (
    <LoadingContent
      loading={isLoading}
      error={error}
      loadingComponent={<Skeleton className="h-64 w-full rounded" />}
    >
      {data && chartData.length > 0 && (
        <Card>
          <Title>{title}</Title>
          <BarChart
            className="mt-4 h-72"
            data={chartData}
            index="group"
            categories={["Executed Rules"]}
            colors={["blue"]}
            showLegend={false}
            showGridLines={true}
          />
        </Card>
      )}
      {data && chartData.length === 0 && (
        <Card>
          <Title>{title}</Title>
          <div className="mt-4 h-72 flex items-center justify-center text-muted-foreground">
            <p>No executed rules found for this period.</p>
          </div>
        </Card>
      )}
    </LoadingContent>
  );
}
