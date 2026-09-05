<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Patient;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        $q = Patient::with(['primaryDentist.user'])->orderByDesc('created_at');
        if ($s = $request->get('search')) {
            $q->where(fn ($w) => $w->where('first_name','like',"%$s%")->orWhere('last_name','like',"%$s%")->orWhere('patient_no','like',"%$s%")->orWhere('phone','like',"%$s%"));
        }
        if ($st = $request->get('status')) $q->where('status', $st);
        if ($d = $request->get('dentist_id')) $q->where('primary_dentist_id', $d);
        if ($request->get('branch_id')) $q->where('branch_id', $request->get('branch_id'));
        $per = min(100, (int) $request->get('per_page', 15));
        return response()->json($q->paginate($per));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'first_name' => 'required|string|max:80', 'last_name' => 'required|string|max:80',
            'middle_name' => 'nullable|string|max:80', 'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other', 'phone' => 'nullable|string|max:40',
            'email' => 'nullable|email', 'address' => 'nullable|string', 'city' => 'nullable|string|max:80',
            'emergency_name' => 'nullable|string|max:120', 'emergency_phone' => 'nullable|string|max:40',
            'blood_type' => 'nullable|string|max:8', 'branch_id' => 'nullable|exists:branches,id',
            'clinic_id' => 'nullable|exists:clinics,id', 'primary_dentist_id' => 'nullable|exists:dentists,id',
            'notes' => 'nullable|string',
        ]);
        $count = Patient::count() + 1;
        $data['patient_no'] = 'PT-' . str_pad((string) $count, 6, '0', STR_PAD_LEFT);
        $data['status'] = 'active';
        $patient = Patient::create($data);
        $patient->medicalHistory()->create([]);
        $patient->dentalHistory()->create([]);
        AuditLog::record($request->user()?->id, 'create', 'patients', $patient->id, "Registered patient {$patient->full_name}", [], $request->ip());
        return response()->json($patient->load(['medicalHistory','dentalHistory']), 201);
    }

    public function show(Patient $patient)
    {
        return response()->json($patient->load(['medicalHistory','dentalHistory','primaryDentist.user','files','odontogram','treatmentPlans.items.procedure','invoices','appointments.dentist.user']));
    }

    public function update(Request $request, Patient $patient)
    {
        $data = $request->validate([
            'first_name' => 'sometimes|string|max:80', 'last_name' => 'sometimes|string|max:80',
            'middle_name' => 'nullable|string|max:80', 'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other', 'phone' => 'nullable|string|max:40',
            'email' => 'nullable|email', 'address' => 'nullable|string', 'city' => 'nullable|string|max:80',
            'emergency_name' => 'nullable|string|max:120', 'emergency_phone' => 'nullable|string|max:40',
            'blood_type' => 'nullable|string|max:8', 'status' => 'nullable|in:active,inactive,archived',
            'primary_dentist_id' => 'nullable|exists:dentists,id', 'notes' => 'nullable|string',
            'medical' => 'nullable|array', 'dental' => 'nullable|array',
        ]);
        if (isset($data['medical'])) {
            $patient->medicalHistory()->updateOrCreate(['patient_id' => $patient->id], array_intersect_key($data['medical'], array_flip(['allergies','conditions','medications','surgeries','notes'])));
            unset($data['medical']);
        }
        if (isset($data['dental'])) {
            $patient->dentalHistory()->updateOrCreate(['patient_id' => $patient->id], array_intersect_key($data['dental'], array_flip(['history','oral_hygiene_notes','previous_treatments','current_conditions'])));
            unset($data['dental']);
        }
        $patient->update($data);
        AuditLog::record($request->user()?->id, 'update', 'patients', $patient->id, "Updated patient {$patient->full_name}", [], $request->ip());
        return response()->json($patient->fresh()->load(['medicalHistory','dentalHistory']));
    }

    public function destroy(Patient $patient)
    {
        $patient->delete();
        return response()->json(['message' => 'Patient archived.']);
    }

    public function timeline(Patient $patient)
    {
        $events = [];
        foreach ($patient->appointments()->with('dentist.user')->orderByDesc('date')->limit(30)->get() as $a) {
            $events[] = ['date' => $a->date->toDateString() . ' ' . substr($a->start_time, 0, 5), 'type' => 'appointment', 'title' => 'Appointment — ' . ucfirst(str_replace('_',' ',$a->status)), 'subtitle' => $a->dentist?->user?->name, 'ref_id' => $a->id];
        }
        foreach ($patient->clinicalNotes()->orderByDesc('created_at')->limit(30)->get() as $n) {
            $events[] = ['date' => $n->created_at->toDateTimeString(), 'type' => 'note', 'title' => 'Clinical note', 'subtitle' => $n->chief_complaint, 'ref_id' => $n->id];
        }
        foreach ($patient->treatmentPlans()->orderByDesc('created_at')->limit(20)->get() as $t) {
            $events[] = ['date' => $t->created_at->toDateTimeString(), 'type' => 'treatment', 'title' => $t->title . ' — ' . ucfirst($t->status), 'subtitle' => 'Plan #' . $t->id, 'ref_id' => $t->id];
        }
        foreach ($patient->invoices()->orderByDesc('created_at')->limit(20)->get() as $i) {
            $events[] = ['date' => $i->created_at->toDateTimeString(), 'type' => 'billing', 'title' => "Invoice {$i->invoice_no} — ₱" . number_format($i->total, 2), 'subtitle' => ucfirst($i->status), 'ref_id' => $i->id];
        }
        foreach ($patient->prescriptions()->orderByDesc('created_at')->limit(20)->get() as $p) {
            $events[] = ['date' => $p->created_at->toDateTimeString(), 'type' => 'prescription', 'title' => 'Prescription created', 'subtitle' => '#' . $p->id, 'ref_id' => $p->id];
        }
        usort($events, fn ($a, $b) => strcmp($b['date'], $a['date']));
        return response()->json(array_slice($events, 0, 60));
    }
}
