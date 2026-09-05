<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->string('patient_no')->unique();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('gender', 12)->default('male');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('emergency_name')->nullable();
            $table->string('emergency_phone')->nullable();
            $table->string('blood_type', 8)->nullable();
            $table->string('status')->default('active');
            $table->foreignId('primary_dentist_id')->nullable()->constrained('dentists')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamp('last_visit_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['clinic_id', 'branch_id']);
            $table->index(['last_name', 'first_name']);
            $table->index('phone');
            $table->index('status');
        });

        Schema::create('patient_medical_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->json('allergies')->nullable();
            $table->json('conditions')->nullable();
            $table->json('medications')->nullable();
            $table->text('surgeries')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index('patient_id');
        });

        Schema::create('patient_dental_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->text('history')->nullable();
            $table->text('oral_hygiene_notes')->nullable();
            $table->text('previous_treatments')->nullable();
            $table->text('current_conditions')->nullable();
            $table->timestamps();
            $table->index('patient_id');
        });

        Schema::create('patient_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('category')->default('xray');
            $table->string('path');
            $table->string('mime')->nullable();
            $table->unsignedBigInteger('size')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['patient_id', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_files');
        Schema::dropIfExists('patient_dental_histories');
        Schema::dropIfExists('patient_medical_histories');
        Schema::dropIfExists('patients');
    }
};
