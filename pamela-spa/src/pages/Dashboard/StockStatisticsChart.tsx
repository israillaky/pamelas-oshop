// src/pages/Dashboard/StockStatisticsChart.tsx
import React from "react";
import type { DashboardGraphPoint } from "./types";
import {
  ResponsiveContainer,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
} from "recharts";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";

type Props = {
  data: DashboardGraphPoint[];
  loading: boolean;
};

const formatShortDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export const StockStatisticsChart: React.FC<Props> = ({
  data,
  loading,
}) => {
  if (loading && data.length === 0) {
    return (
      <section className="bg-white rounded-xl border shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-800">
            Statistics
          </h2>
        </div>
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      </section>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <section className="bg-white rounded-xl border shadow-sm p-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-2">
          Statistics
        </h2>
        <EmptyState
          message="Statistics will appear as stock movement is recorded."
        />
      </section>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    label: formatShortDate(d.date),
  }));

  return (
    <section className="bg-white rounded-xl border shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">
            Statistics
          </h2>
          <p className="text-xs text-gray-500">
            Daily stock in and out trend
          </p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="stock_in_qty"
              name="Stock In"
              fillOpacity={0.3}
            />
            <Area
              type="monotone"
              dataKey="stock_out_qty"
              name="Stock Out"
              fillOpacity={0.15}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
