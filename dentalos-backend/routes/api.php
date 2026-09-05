<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\BillingController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\ClinicalController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SystemController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'registerPatient']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::apiResource('patients', PatientController::class);
    Route::get('/patients/{patient}/timeline', [PatientController::class, 'timeline']);

    Route::apiResource('appointments', AppointmentController::class);
    Route::post('/appointments/{appointment}/transition', [AppointmentController::class, 'transition']);

    Route::get('/patients/{patient}/odontogram', [ClinicalController::class, 'odontogram']);
    Route::post('/patients/{patient}/odontogram', [ClinicalController::class, 'saveTooth']);
    Route::get('/patients/{patient}/notes', [ClinicalController::class, 'notes']);
    Route::post('/patients/{patient}/notes', [ClinicalController::class, 'storeNote']);
    Route::get('/patients/{patient}/diagnoses', [ClinicalController::class, 'diagnoses']);
    Route::post('/patients/{patient}/diagnoses', [ClinicalController::class, 'storeDiagnosis']);
    Route::get('/patients/{patient}/treatment-plans', [ClinicalController::class, 'plans']);
    Route::post('/patients/{patient}/treatment-plans', [ClinicalController::class, 'storePlan']);
    Route::post('/treatment-plans/{plan}/status', [ClinicalController::class, 'updatePlanStatus']);
    Route::get('/patients/{patient}/prescriptions', [ClinicalController::class, 'prescriptions']);
    Route::post('/patients/{patient}/prescriptions', [ClinicalController::class, 'storePrescription']);

    Route::get('/invoices', [BillingController::class, 'invoices']);
    Route::post('/invoices', [BillingController::class, 'storeInvoice']);
    Route::get('/invoices/{invoice}', [BillingController::class, 'showInvoice']);
    Route::post('/invoices/{invoice}/pay', [BillingController::class, 'pay']);
    Route::post('/invoices/{invoice}/refund', [BillingController::class, 'refund']);

    Route::get('/procedures', [CatalogController::class, 'procedures']);
    Route::post('/procedures', [CatalogController::class, 'storeProcedure']);
    Route::get('/procedure-categories', [CatalogController::class, 'categories']);
    Route::get('/dentists', [CatalogController::class, 'dentists']);
    Route::get('/staff', [CatalogController::class, 'staff']);
    Route::post('/staff', [CatalogController::class, 'storeStaff']);
    Route::get('/clinics', [CatalogController::class, 'clinics']);
    Route::get('/branches', [CatalogController::class, 'branches']);
    Route::get('/rooms', [CatalogController::class, 'rooms']);

    Route::get('/inventory', [InventoryController::class, 'items']);
    Route::post('/inventory', [InventoryController::class, 'store']);
    Route::post('/inventory/{item}/adjust', [InventoryController::class, 'adjust']);
    Route::get('/suppliers', [InventoryController::class, 'suppliers']);
    Route::post('/suppliers', [InventoryController::class, 'storeSupplier']);
    Route::get('/purchase-orders', [InventoryController::class, 'purchaseOrders']);
    Route::post('/purchase-orders', [InventoryController::class, 'storePO']);
    Route::post('/purchase-orders/{po}/receive', [InventoryController::class, 'receivePO']);

    Route::get('/reports/dashboard', [ReportController::class, 'dashboard']);
    Route::get('/reports/financial', [ReportController::class, 'financial']);
    Route::get('/reports/appointments', [ReportController::class, 'appointments']);

    Route::get('/search', [SystemController::class, 'search']);
    Route::get('/notifications', [SystemController::class, 'notifications']);
    Route::post('/notifications/{notification}/read', [SystemController::class, 'readNotification']);
    Route::get('/audit-logs', [SystemController::class, 'auditLogs']);
    Route::get('/settings', [SystemController::class, 'settings']);
    Route::post('/settings', [SystemController::class, 'saveSettings']);
});
