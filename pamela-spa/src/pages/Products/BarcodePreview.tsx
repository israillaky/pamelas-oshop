// src/pages/Products/BarcodePreview.tsx
import React, { useCallback } from "react";
import html2canvas from "html2canvas";
import type { Product } from "./types";
import Button from "../../components/ui/Button";

type BarcodePreviewProps = {
  product: Product;
};

export const BarcodePreview: React.FC<BarcodePreviewProps> = ({ product }) => {
  const png = product.barcode_png;
  const code = product.barcode;
  const labelId = `barcode-label-${product.id}`;

  const handleDownload = useCallback(async () => {
    const el = document.getElementById(labelId);
    if (!el) return;

    try {
      const canvas = await html2canvas(el, {
        backgroundColor: "#ffffff",
        scale: 3,
        useCORS: true,
      });

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");

      const baseName =
        product.sku || product.barcode || product.name || "barcode";
      link.download = `${baseName}-barcode.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("Failed to capture barcode label", e);
    }
  }, [labelId, product]);

  if (!png) return null;

  return (
    <div className="mt-4">
      <div
        id={labelId}
        className="mx-auto w-full max-w-xs rounded-lg border border-gray-200 bg-white px-4 py-3 text-center"
      >
        {/* Product + brand/category text */}
        <div className="mb-2">
          <div className="text-md font-semibold text-gray-900">
            {product.name}
          </div>
          <div className="mt-0.5 text-[11px] text-gray-600">
            {product.brand?.name && (
              <>
                {product.brand.name}
                {" · "}
              </>
            )}
            {product.category?.name}
            {product.child_category?.name && (
              <>
                {" / "}
                <span className="text-gray-500">
                  {product.child_category.name}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Barcode PNG */}
        <div className="flex items-center justify-center">
          <img
            src={png}
            alt={code || "Product barcode"}
            className="max-h-20 object-contain"
          />
        </div>

        {/* Code text */}
        {code && (
          <div className="mt-2 text-[11px] font-mono text-gray-800">
            {code}
          </div>
        )}
      </div>

      {/* Download button */}
      <div className="mt-4 flex justify-center">
        <Button
          variant="secondary"
          type="button"
          className="px-4 py-1.5 text-md"
          onClick={handleDownload}
        >
          Download Barcode
        </Button>
      </div>
    </div>
  );
};
