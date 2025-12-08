// src/pages/Dashboard/StockMovementChart.tsx
import React from "react";
import type { DashboardGraphPoint } from "./types";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";

type Props = {
  data: DashboardGraphPoint[];
  loading: boolean;
};

const formatShortDate = (iso: string) => {
  // "2025-12-02" -> "Dec 2"
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export const StockMovementChart: React.FC<Props> = ({ data, loading }) => {
  if (loading && data.length === 0) {
    return (
      <section className="bg-white rounded-xl border shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-800">
            Stock Movement
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
          Stock Movement
        </h2>
        <EmptyState 
          message="Stock in and stock out activity will appear here."
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
            Stock Movement
          </h2>
          <p className="text-xs text-gray-500">
            Stock in vs stock out by day
          </p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="stock_in_qty"
              name="Stock In"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="stock_out_qty"
              name="Stock Out"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
