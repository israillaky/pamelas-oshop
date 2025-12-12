// src/pages/Dashboard/SummaryCards.tsx

import React, { useEffect, useRef, useState } from "react";
import type { DashboardSummary, DashboardGraphPoint } from "./types";
import { Spinner } from "../../components/ui/Spinner";

type SummaryCardsProps = {
  summary: DashboardSummary | null;
  loading: boolean;
  graphData: DashboardGraphPoint[];
};

type DeltaTone = "up" | "down" | "neutral";

type DashboardCardProps = {
  label: string;
  value: number;
  color?: "default" | "success" | "warning";
  icon: React.ReactNode;
  delta?: {
    text: string;
    tone: DeltaTone;
  };
};

/**
 * Smoothly animates a number from previous to next.
 */
function useAnimatedNumber(target: number, durationMs = 600): number {
  const [displayValue, setDisplayValue] = useState<number>(target);
  const startValueRef = useRef<number>(target);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }

    startValueRef.current = displayValue;
    startTimeRef.current = null;

    const step = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - (1 - progress) * (1 - progress); // ease-out

      const nextValue =
        startValueRef.current +
        (target - startValueRef.current) * eased;

      setDisplayValue(nextValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs]);

  return displayValue;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  label,
  value,
  color = "default",
  icon,
  delta,
}) => {
  const animatedValue = useAnimatedNumber(value);

  const valueColor =
    color === "success"
      ? "text-green-600"
      : color === "warning"
      ? "text-yellow-600"
      : "text-gray-900";

  let deltaClasses =
    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium";
  let arrow: React.ReactNode = null;

  if (delta) {
    if (delta.tone === "up") {
      deltaClasses += " bg-green-50 text-green-700";
      arrow = (
        <span aria-hidden="true" className="text-[10px]">
          ▲
        </span>
      );
    } else if (delta.tone === "down") {
      deltaClasses += " bg-red-50 text-red-700";
      arrow = (
        <span aria-hidden="true" className="text-[10px]">
          ▼
        </span>
      );
    } else {
      deltaClasses += " bg-gray-50 text-gray-600";
      arrow = (
        <span aria-hidden="true" className="text-[10px]">
          ●
        </span>
      );
    }
  }

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm flex flex-col items-left text-left gap-3 transform transition-transform duration-150 hover:scale-[1.02]">
      {/* Icon on top */}
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
        {icon}
      </div>

      {/* Text below */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-500">
          {label}
        </span>
         <div className="mb-4 flex  items-left justify-between gap-2 text-md text-gray-600 flex-row">
        
          <span className={`text-2xl font-semibold ${valueColor}`}>
            {Math.round(animatedValue).toLocaleString()}
          </span>

          {delta && (
            <span className={deltaClasses}>
              {arrow}
              <span>{delta.text}</span> 
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

function getDateKey(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function findByDate(
  data: DashboardGraphPoint[],
  dateKey: string
): DashboardGraphPoint | undefined {
  return data.find((p) => p.date === dateKey);
}

function buildDelta(
  today: number,
  yesterday: number
): { text: string; tone: DeltaTone } {
  const diff = today - yesterday;

  if (yesterday === 0 && today === 0) {
    return {
      text: "No change",
      tone: "neutral",
    };
  }

  if (yesterday === 0 && today !== 0) {
    return {
      text: `+${today.toLocaleString()} (new)`,
      tone: "up",
    };
  }

  const absDiff = Math.abs(diff);
  const pct = (absDiff / yesterday) * 100;
  const pctStr = `${pct.toFixed(1)}%`;

  if (diff > 0) {
    return {
      text: `+${absDiff.toLocaleString()} (${pctStr})`,
      tone: "up",
    };
  }
  if (diff < 0) {
    return {
      text: `-${absDiff.toLocaleString()} (${pctStr})`,
      tone: "down",
    };
  }

  return {
    text: "0 (0.0%)",
    tone: "neutral",
  };
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  loading,
  graphData,
}) => {
  if (loading && !summary) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  const totalProducts = summary?.total_products ?? 0;
  const lowStock = summary?.low_stock_products ?? 0;
  const totalInToday = summary?.total_stock_in_today ?? 0;
  const totalOutToday = summary?.total_stock_out_today ?? 0;

  const lowStockColor: "default" | "success" | "warning" =
    lowStock > 0 ? "warning" : "success";

  // Build yesterday comparison for stock in / out
  //const todayKey = getDateKey(0);
  const yesterdayKey = getDateKey(-1);

  //const todayPoint = findByDate(graphData, todayKey);
  const yesterdayPoint = findByDate(graphData, yesterdayKey);

  const yesterdayIn = yesterdayPoint?.stock_in_qty ?? 0;
  const yesterdayOut = yesterdayPoint?.stock_out_qty ?? 0;

  const stockInDelta = buildDelta(totalInToday, yesterdayIn);
  const stockOutDelta = buildDelta(totalOutToday, yesterdayOut);

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
      {/* Total Products (no delta, no history) */}
      <DashboardCard
        label="Total Products"
        value={totalProducts}
        icon={ 
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" 
            className="w-6 h-6 ">
            <path d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"></path>
            </svg>


        }
      />

      {/* Low Stock Items (no delta for now) */}
      <DashboardCard
        label="Low Stock Items"
        value={lowStock}
        color={lowStockColor}
        icon={
          <svg className="w-6 h-6 fill-yellow-600" viewBox="0 0 24 24">
            <path d="M12 2L2 22h20L12 2zm1 15h-2v-2h2v2zm0-4h-2v-4h2v4z" />
          </svg>
        }
      />

      {/* Stock In Today with delta */}
      <DashboardCard
        label="Stock In Today"
        value={totalInToday}
        icon={
          <svg className="w-6 h-6 fill-green-700" viewBox="0 0 24 24">
            <path d="M5 20h14v-2H5v2zm7-18l-7 7h4v6h6v-6h4l-7-7z" />
          </svg>
        }
        delta={stockInDelta}
      />

      {/* Stock Out Today with delta */}
      <DashboardCard
        label="Stock Out Today"
        value={totalOutToday}
        icon={
          <svg className="w-6 h-6 fill-red-600" viewBox="0 0 24 24">
            <path d="M19 9h-4V3h-6v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
          </svg>
        }
        delta={stockOutDelta}
      />
    </section>
  );
};
