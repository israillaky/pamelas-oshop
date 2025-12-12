<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            if (Schema::hasColumn('categories', 'name')) {
                $table->index(['name']);
            }
            if (Schema::hasColumn('categories', 'created_at')) {
                $table->index(['created_at']);
            }
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndex(['categories_name_index']);
            $table->dropIndex(['categories_created_at_index']);
        });
    }
};
