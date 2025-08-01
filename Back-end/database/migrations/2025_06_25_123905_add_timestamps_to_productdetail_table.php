// database/migrations/YYYY_MM_DD_HHMMSS_add_timestamps_to_productdetail_table.php

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('productdetail', function (Blueprint $table) {
            $table->timestamps(); // Thêm cả created_at và updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('productdetail', function (Blueprint $table) {
            $table->dropTimestamps(); // Xóa cả created_at và updated_at nếu rollback
        });
    }
};