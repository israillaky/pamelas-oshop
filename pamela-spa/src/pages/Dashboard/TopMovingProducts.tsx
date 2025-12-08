// src/pages/Dashboard/TopMovingProducts.tsx
import React from "react";
import type { MovingProduct } from "./types";
import {
  Table,
  type TableColumn,
} from "../../components/ui/Table";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";

type TopMovingProductsProps = {
  items: MovingProduct[];
  loading: boolean;
  error: string | null;
};

export const TopMovingProducts: React.FC<TopMovingProductsProps> = ({
  items,
  loading,
  error,
}) => {
  const columns: TableColumn<MovingProduct & { rank: number }>[] = [
    {
      key: "rank",
      label: "#", 
      align: "center",
      render: (row) => <span>{row.rank}</span>,
    },
    {
      key: "name",
      label: "Product",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{row.name}</span>
          <span className="text-xs text-gray-500">{row.sku}</span>
        </div>
      ),
    },
    {
      key: "total_out",
      label: "Total Stock Out",
      align: "right",
      render: (row) => (
        <span className="font-semibold text-gray-800">
          {row.total_out}
        </span>
      ),
    },
  ];

  if (loading && items.length === 0) {
    return (
      <section className="bg-white rounded-xl border shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-800">
            Top Moving Products
          </h2>
        </div>
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      </section>
    );
  }

  if (error && items.length === 0) {
    return (
      <section className="bg-white rounded-xl border shadow-sm p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-2">
          Top Moving Products
        </h2>
        <p className="text-sm text-red-600">{error}</p>
      </section>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <section className="bg-white rounded-xl border shadow-sm p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-2">
          Top Moving Products
        </h2>
        <EmptyState 
          message="Top moving products will appear here once stock out transactions are recorded."
        />
      </section>
    );
  }

  const rowsWithRank = items.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));

  return (
    <section className="bg-white rounded-xl border shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-800">
          Top Moving Products
        </h2>
      </div>
      <Table
        columns={columns}
        rows={rowsWithRank} 
      />
    </section>
  );
};
