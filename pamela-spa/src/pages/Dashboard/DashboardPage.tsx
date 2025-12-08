// src/pages/Dashboard/DashboardPage.tsx
import React from "react";
import {AppLayout} from "../../layouts/AppLayout";
import { useDashboardPage } from "./useDashboardPage";
import { SummaryCards } from "./SummaryCards";
import { StockMovementChart } from "./StockMovementChart";
import { StockStatisticsChart } from "./StockStatisticsChart";

const DashboardPage: React.FC = () => {
  const {
    loading,
    error,
    summary,
    graphData,
    reload,
    
    //formatDateTime, // not used yet, but kept for future
  } = useDashboardPage();

  return (
    <AppLayout title="Dashboard">
      <div className="flex flex-col gap-6">
        {/* Top summary cards (similar to Customers / Orders in screenshot) */}
       
        <SummaryCards summary={summary} loading={loading} graphData={graphData} />
        {/* Global error banner */}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}{" "}
            <button
              type="button"
              className="ml-2 underline"
              onClick={reload}
            >
              Retry
            </button>
          </div>
        )}

        {/* Row with bar chart + (optional) other widgets later */}
        <div className="grid gap-6 xl:grid-cols-3">
          {/* Big chart (2/3 width on desktop) */}
          <div className="xl:col-span-2">
            <StockMovementChart data={graphData} loading={loading} />
          </div>

          {/* Right column could be a “target” or KPIs card later.
              For now we reuse Statistics small chart, so layout is similar to your reference. */}
          <div className="xl:col-span-1">
            <StockStatisticsChart data={graphData} loading={loading} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
