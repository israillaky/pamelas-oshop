<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

return new class extends Migration {
    public function up(): void
    {
        // products: frequent search by name/sku/barcode
        Schema::table('products', function (Blueprint $table) {
            $table->index(['name']);
            $table->index(['sku']);
            $table->index(['barcode']);
            $table->index(['created_at']);
        });

        // stock_ins: filter by product and date
        Schema::table('stock_ins', function (Blueprint $table) {
            $table->index(['product_id']);
            $table->index(['created_at']);
            $table->index(['product_id', 'created_at']);
        });

        // stock_outs: filter by product and date
        Schema::table('stock_outs', function (Blueprint $table) {
            $table->index(['product_id']);
            $table->index(['created_at']);
            $table->index(['product_id', 'created_at']);
        });

        // product_price_snapshots: lookup by stock_out_id / stock_in_id
        Schema::table('product_price_snapshots', function (Blueprint $table) {
            $table->index(['stock_out_id']);
            $table->index(['stock_in_id']);
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['name']);
            $table->dropIndex(['sku']);
            $table->dropIndex(['barcode']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('stock_ins', function (Blueprint $table) {
            $table->dropIndex(['product_id']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['product_id', 'created_at']);
        });

        Schema::table('stock_outs', function (Blueprint $table) {
            $table->dropIndex(['product_id']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['product_id', 'created_at']);
        });

        Schema::table('product_price_snapshots', function (Blueprint $table) {
            $table->dropIndex(['stock_out_id']);
            $table->dropIndex(['stock_in_id']);
        });
    }
};
