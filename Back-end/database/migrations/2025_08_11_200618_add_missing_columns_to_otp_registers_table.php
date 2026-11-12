<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
  public function up()
{
    Schema::table('otp_registers', function (Blueprint $table) {
        $table->string('password')->nullable();
        $table->string('name')->nullable();
        $table->string('diachi')->nullable();
        $table->string('role')->default('user');
        $table->boolean('is_blocked')->default(0);
        $table->string('username')->nullable();
    });
}

public function down()
{
    Schema::table('otp_registers', function (Blueprint $table) {
        $table->dropColumn(['password', 'name', 'diachi', 'role', 'is_blocked', 'username']);
    });
}

};
