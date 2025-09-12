"use client";

import { useState, useMemo, useCallback } from "react";
import type { DateRange } from "react-day-picker";
import subDays from "date-fns/subDays";
import { PageWrapper } from "@/components/PageWrapper";
import { PageHeading } from "@/components/Typography";
import { useOrgAccess } from "@/hooks/useOrgAccess";
import { RuleStatsChart } from "@/components/RuleStatsChart";
import { CardBasic } from "@/components/ui/card";
import { Title } from "@tremor/react";
import { ActionBar } from "@/app/(app)/[emailAccountId]/stats/ActionBar";

const selectOptions = [
  { label: "Last week", value: "7" },
  { label: "Last month", value: "30" },
  { label: "Last 3 months", value: "90" },
  { label: "Last year", value: "365" },
  { label: "All", value: "0" },
];
const defaultSelected = selectOptions[1];

export default function RuleStatsPage() {
  const { accountInfo, isAccountOwner } = useOrgAccess();
  const [dateDropdown, setDateDropdown] = useState<string>(
    defaultSelected.label,
  );

  const now = useMemo(() => new Date(), []);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(now, Number.parseInt(defaultSelected.value)),
    to: now,
  });

  const onSetDateDropdown = useCallback(
    (option: { label: string; value: string }) => {
      setDateDropdown(option.label);
    },
    [],
  );

  // Convert dateRange to string format for API
  const apiDateRange = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) {
      return { fromDate: undefined, toDate: undefined };
    }
    return {
      fromDate: dateRange.from.toISOString().split("T")[0],
      toDate: dateRange.to.toISOString().split("T")[0],
    };
  }, [dateRange]);

  return (
    <PageWrapper>
      <PageHeading>
        {accountInfo?.name
          ? `Rule Analytics for ${accountInfo.name}`
          : "Rule Analytics"}
      </PageHeading>

      <div className="flex items-center justify-between mt-2 sm:mt-0">
        <div />
        <div className="flex flex-wrap gap-1">
          <ActionBar
            selectOptions={selectOptions}
            dateDropdown={dateDropdown}
            setDateDropdown={onSetDateDropdown}
            dateRange={dateRange}
            setDateRange={setDateRange}
            isMobile={false}
          />
        </div>
      </div>

      <div className="grid gap-2 sm:gap-4 mt-2 sm:mt-4">
        {/* Rule Stats Chart */}
        <RuleStatsChart
          fromDate={apiDateRange.fromDate}
          toDate={apiDateRange.toDate}
          title="Types of emails handled for you"
        />

        {/* Info for non-owners */}
        {!isAccountOwner && (
          <CardBasic>
            <Title>Note</Title>
            <p className="text-sm text-muted-foreground mt-2">
              You are viewing executed rules analytics for this member. Some
              data may be limited based on your access permissions.
            </p>
          </CardBasic>
        )}
      </div>
    </PageWrapper>
  );
}
