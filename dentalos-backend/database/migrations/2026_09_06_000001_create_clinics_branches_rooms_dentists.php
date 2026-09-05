<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('receptionist')->after('password');
            $table->string('phone')->nullable()->after('email');
            $table->string('avatar')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('clinic_id')->nullable()->after('id');
            $table->foreignId('branch_id')->nullable()->after('clinic_id');
            $table->softDeletes();
        });

        Schema::create('clinics', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('logo')->nullable();
            $table->string('currency', 8)->default('₱');
            $table->decimal('tax_rate', 5, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->json('settings')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index('code');
        });

        Schema::create('branches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->boolean('is_active')->default(true);
            $table->time('opens_at')->default('08:00');
            $table->time('closes_at')->default('18:00');
            $table->timestamps();
            $table->softDeletes();
            $table->index(['clinic_id', 'is_active']);
        });

        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->nullable();
            $table->string('type')->default('operatory');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index('branch_id');
        });

        Schema::create('dentists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->string('license_no')->nullable()->unique();
            $table->string('specialization')->default('General Dentistry');
            $table->decimal('commission_rate', 5, 2)->default(0);
            $table->text('bio')->nullable();
            $table->json('schedule')->nullable();
            $table->string('color', 16)->default('#0F766E');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            $table->index(['branch_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dentists');
        Schema::dropIfExists('rooms');
        Schema::dropIfExists('branches');
        Schema::dropIfExists('clinics');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'phone', 'avatar', 'is_active', 'clinic_id', 'branch_id', 'deleted_at']);
        });
    }
};
