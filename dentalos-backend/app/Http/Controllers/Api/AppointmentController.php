<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\Appointment;
use App\Models\AuditLog;
use App\Services\AppointmentService;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $q = Appointment::with(['patient','dentist.user','room','procedure'])->orderBy('date')->orderBy('start_time');
        if ($request->get('date')) $q->whereDate('date', $request->get('date'));
        if ($request->get('from') && $request->get('to')) $q->whereBetween('date', [$request->get('from') . ' 00:00', $request->get('to') . ' 23:59']);
        if ($request->get('dentist_id')) $q->where('dentist_id', $request->get('dentist_id'));
        if ($request->get('branch_id')) $q->where('branch_id', $request->get('branch_id'));
        if ($request->get('status')) $q->where('status', $request->get('status'));
        if ($request->get('patient_id')) $q->where('patient_id', $request->get('patient_id'));
        return response()->json($q->paginate(min(100, (int) $request->get('per_page', 25))));
    }

    public function store(Request $request, AppointmentService $svc)
    {
        $data = $request->validate([
            'patient_id' => 'required|exists:patients,id', 'dentist_id' => 'nullable|exists:dentists,id',
            'room_id' => 'nullable|exists:rooms,id', 'procedure_id' => 'nullable|exists:procedures,id',
            'branch_id' => 'nullable|exists:branches,id', 'clinic_id' => 'nullable|exists:clinics,id',
            'date' => 'required|date', 'start_time' => 'required', 'end_time' => 'required',
            'notes' => 'nullable|string',
        ]);
        $svc->checkConflicts($data);
        $data['status'] = 'scheduled';
        $data['created_by'] = $request->user()?->id;
        $appt = Appointment::create($data);
        AuditLog::record($request->user()?->id, 'create', 'appointments', $appt->id, "Appointment scheduled for patient #{$appt->patient_id}", [], $request->ip());
        $appt->loadMissing('patient');
        $who = trim(($appt->patient->first_name ?? '') . ' ' . ($appt->patient->last_name ?? '')) ?: "Patient #{$appt->patient_id}";
        AppNotification::notify('Appointment scheduled', "$who · {$appt->date} " . substr((string) $appt->start_time, 0, 5), 'appointment', null, '/app/appointments');
        return response()->json($appt->load(['patient','dentist.user']), 201);
    }

    public function show(Appointment $appointment)
    {
        return response()->json($appointment->load(['patient','dentist.user','room','procedure']));
    }

    public function update(Request $request, Appointment $appointment, AppointmentService $svc)
    {
        $data = $request->validate([
            'dentist_id' => 'nullable|exists:dentists,id', 'room_id' => 'nullable|exists:rooms,id',
            'procedure_id' => 'nullable|exists:procedures,id', 'date' => 'sometimes|date',
            'start_time' => 'sometimes', 'end_time' => 'sometimes', 'notes' => 'nullable|string',
        ]);
        $merged = array_merge($appointment->toArray(), $data);
        $svc->checkConflicts($merged, $appointment->id);
        $appointment->update($data);
        return response()->json($appointment->fresh()->load(['patient','dentist.user']));
    }

    public function transition(Request $request, Appointment $appointment, AppointmentService $svc)
    {
        $data = $request->validate(['status' => 'required|in:confirmed,checked_in,in_progress,completed,cancelled,no_show']);
        $svc->advance($appointment, $data['status']);
        AuditLog::record($request->user()?->id, 'status', 'appointments', $appointment->id, "Appointment #{$appointment->id} → {$data['status']}", [], $request->ip());
        if (in_array($data['status'], ['confirmed', 'cancelled', 'no_show'], true)) {
            AppNotification::notify("Appointment {$data['status']}", "Appointment #{$appointment->id} → " . str_replace('_', ' ', $data['status']), 'appointment', null, '/app/appointments');
        }
        return response()->json($appointment->fresh()->load(['patient','dentist.user']));
    }

    public function destroy(Appointment $appointment)
    {
        $appointment->delete();
        return response()->json(['message' => 'Appointment deleted.']);
    }
}
