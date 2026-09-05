<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Clinic;
use App\Models\Dentist;
use App\Models\Procedure;
use App\Models\ProcedureCategory;
use App\Models\Room;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class CatalogController extends Controller
{
    public function procedures() { return response()->json(Procedure::with('category')->where('is_active', true)->orderBy('name')->get()); }
    public function storeProcedure(Request $r) {
        $d = $r->validate(['name' => 'required|string|max:160','code' => 'required|string|max:32|unique:procedures,code','category_id' => 'nullable|exists:procedure_categories,id','description' => 'nullable|string','default_price' => 'required|numeric|min:0','duration_minutes' => 'nullable|integer|min:5']);
        return response()->json(Procedure::create($d + ['is_active' => true]), 201);
    }
    public function categories() { return response()->json(ProcedureCategory::withCount('procedures')->get()); }

    public function dentists(Request $r) {
        $q = Dentist::with('user')->where('is_active', true);
        if ($r->get('branch_id')) $q->where('branch_id', $r->get('branch_id'));
        return response()->json($q->get());
    }

    public function staff(Request $r) {
        $q = User::query()->orderBy('name');
        if ($r->get('role')) $q->where('role', $r->get('role'));
        return response()->json($q->paginate(25));
    }

    public function storeStaff(Request $r) {
        $d = $r->validate(['name' => 'required|string|max:120','email' => 'required|email|unique:users,email','password' => 'required|min:6','role' => 'required|in:super_admin,clinic_admin,dentist,receptionist,accountant,patient','phone' => 'nullable|string|max:40','branch_id' => 'nullable|exists:branches,id','clinic_id' => 'nullable|exists:clinics,id']);
        $u = User::create($d);
        if ($d['role'] === 'dentist') Dentist::create(['user_id' => $u->id, 'branch_id' => $d['branch_id'] ?? null, 'specialization' => $r->get('specialization', 'General Dentistry'), 'license_no' => $r->get('license_no')]);
        return response()->json($u, 201);
    }

    public function clinics() { return response()->json(Clinic::with('branches.rooms')->get()); }
    public function branches() { return response()->json(Branch::with('rooms')->get()); }
    public function rooms(Request $r) {
        $q = Room::query();
        if ($r->get('branch_id')) $q->where('branch_id', $r->get('branch_id'));
        return response()->json($q->get());
    }
}
