<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\ClinicalNote;
use App\Models\Diagnosis;
use App\Models\OdontogramRecord;
use App\Models\Prescription;
use App\Models\TreatmentPlan;
use Illuminate\Http\Request;

class ClinicalController extends Controller
{
    public function odontogram(int $patientId)
    {
        return response()->json(OdontogramRecord::where('patient_id', $patientId)->get()->keyBy('tooth_number'));
    }

    public function saveTooth(Request $request, int $patientId)
    {
        $data = $request->validate([
            'tooth_number' => 'required|string|max:8', 'condition' => 'required|string|max:32',
            'surfaces' => 'nullable|array', 'notes' => 'nullable|string', 'dentist_id' => 'nullable|exists:dentists,id',
        ]);
        $rec = OdontogramRecord::updateOrCreate(
            ['patient_id' => $patientId, 'tooth_number' => $data['tooth_number']],
            $data + ['dentist_id' => $data['dentist_id'] ?? $request->user()?->dentist?->id]
        );
        AuditLog::record($request->user()?->id, 'update', 'odontogram', $rec->id, "Tooth {$rec->tooth_number} → {$rec->condition} (patient #$patientId)", [], $request->ip());
        return response()->json($rec);
    }

    public function notes(Request $request, int $patientId)
    {
        return response()->json(ClinicalNote::where('patient_id', $patientId)->with('dentist.user')->orderByDesc('created_at')->paginate(15));
    }

    public function storeNote(Request $request, int $patientId)
    {
        $data = $request->validate([
            'chief_complaint' => 'nullable|string', 'examination' => 'nullable|string', 'diagnosis' => 'nullable|string',
            'treatment_performed' => 'nullable|string', 'materials_used' => 'nullable|string',
            'dentist_notes' => 'nullable|string', 'follow_up_instructions' => 'nullable|string',
            'appointment_id' => 'nullable|exists:appointments,id', 'dentist_id' => 'nullable|exists:dentists,id',
        ]);
        $note = ClinicalNote::create($data + ['patient_id' => $patientId, 'dentist_id' => $data['dentist_id'] ?? $request->user()?->dentist?->id]);
        return response()->json($note->load('dentist.user'), 201);
    }

    public function diagnoses(int $patientId)
    {
        return response()->json(Diagnosis::where('patient_id', $patientId)->orderByDesc('created_at')->get());
    }

    public function storeDiagnosis(Request $request, int $patientId)
    {
        $data = $request->validate(['tooth_number' => 'nullable|string|max:8', 'code' => 'nullable|string|max:32', 'title' => 'required|string|max:160', 'description' => 'nullable|string', 'severity' => 'nullable|in:mild,moderate,severe']);
        $d = Diagnosis::create($data + ['patient_id' => $patientId, 'dentist_id' => $request->user()?->dentist?->id]);
        return response()->json($d, 201);
    }

    public function plans(int $patientId)
    {
        return response()->json(TreatmentPlan::where('patient_id', $patientId)->with(['items.procedure', 'dentist.user'])->orderByDesc('created_at')->get());
    }

    public function storePlan(Request $request, int $patientId)
    {
        $data = $request->validate(['title' => 'required|string|max:160', 'notes' => 'nullable|string', 'discount' => 'nullable|numeric|min:0', 'dentist_id' => 'nullable|exists:dentists,id', 'items' => 'required|array|min:1', 'items.*.procedure_id' => 'nullable|exists:procedures,id', 'items.*.tooth_number' => 'nullable|string|max:8', 'items.*.priority' => 'nullable|in:low,medium,high,urgent', 'items.*.estimated_cost' => 'nullable|numeric|min:0', 'items.*.estimated_duration' => 'nullable|integer|min:5', 'items.*.notes' => 'nullable|string']);
        $plan = TreatmentPlan::create(['patient_id' => $patientId, 'title' => $data['title'], 'notes' => $data['notes'] ?? null, 'discount' => $data['discount'] ?? 0, 'dentist_id' => $data['dentist_id'] ?? $request->user()?->dentist?->id, 'status' => 'proposed']);
        foreach ($data['items'] as $it) $plan->items()->create($it + ['status' => 'proposed']);
        AuditLog::record($request->user()?->id, 'create', 'treatment_plans', $plan->id, "Treatment plan '{$plan->title}' for patient #$patientId", [], $request->ip());
        return response()->json($plan->load(['items.procedure']), 201);
    }

    public function updatePlanStatus(Request $request, TreatmentPlan $plan)
    {
        $data = $request->validate(['status' => 'required|in:proposed,accepted,in_progress,completed,declined,cancelled']);
        $plan->update(['status' => $data['status']]);
        $plan->items()->update(['status' => $data['status']]);
        return response()->json($plan->fresh()->load('items'));
    }

    public function prescriptions(int $patientId)
    {
        return response()->json(Prescription::where('patient_id', $patientId)->with(['items', 'dentist.user'])->orderByDesc('created_at')->get());
    }

    public function storePrescription(Request $request, int $patientId)
    {
        $data = $request->validate(['notes' => 'nullable|string', 'items' => 'required|array|min:1', 'items.*.medication' => 'required|string|max:160', 'items.*.dosage' => 'nullable|string|max:80', 'items.*.frequency' => 'nullable|string|max:80', 'items.*.duration' => 'nullable|string|max:80', 'items.*.instructions' => 'nullable|string']);
        $p = Prescription::create(['patient_id' => $patientId, 'dentist_id' => $request->user()?->dentist?->id, 'notes' => $data['notes'] ?? null]);
        foreach ($data['items'] as $it) $p->items()->create($it);
        return response()->json($p->load('items'), 201);
    }
}
