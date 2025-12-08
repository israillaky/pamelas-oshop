<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Make brand_id nullable
            $table->unsignedBigInteger('brand_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Rollback: make brand_id NOT NULL again (if needed)
            $table->unsignedBigInteger('brand_id')->nullable(false)->change();
        });
    }
};
