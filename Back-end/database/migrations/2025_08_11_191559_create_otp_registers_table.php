<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
 public function up()
{
    Schema::create('otp_registers', function (Blueprint $table) {
        $table->id();
        $table->string('email')->nullable();
        $table->string('phone')->nullable();
        $table->string('username')->nullable();
        $table->string('password')->nullable();
        $table->string('name')->nullable();
        $table->string('diachi')->nullable();
        $table->string('role')->default('user');
        $table->boolean('is_blocked')->default(0);
        $table->string('otp');
        $table->timestamp('expires_at');
        $table->timestamps();
    });
}



    public function down(): void {
        Schema::dropIfExists('otp_registers');
    }
};
