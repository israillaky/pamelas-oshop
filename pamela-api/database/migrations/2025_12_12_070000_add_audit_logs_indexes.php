<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('audit_logs', 'module')) {
                // Skip if table differs; migration assumes existing schema
                return;
            }

            $table->index(['module']);
            $table->index(['action']);
            $table->index(['user_id']);
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropIndex(['audit_logs_module_index']);
            $table->dropIndex(['audit_logs_action_index']);
            $table->dropIndex(['audit_logs_user_id_index']);
            $table->dropIndex(['audit_logs_created_at_index']);
        });
    }
};
