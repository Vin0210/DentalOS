<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate(['email' => 'required|email', 'password' => 'required', 'device' => 'nullable|string']);
        $user = User::where('email', $data['email'])->first();
        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => 'Invalid credentials.']);
        }
        if (!$user->is_active) return response()->json(['message' => 'Account is deactivated.'], 403);
        $token = $user->createToken($data['device'] ?? 'dentalos')->plainTextToken;
        AuditLog::record($user->id, 'login', 'users', $user->id, "{$user->name} logged in", [], $request->ip());
        return response()->json(['user' => $this->userPayload($user), 'token' => $token]);
    }

    public function me(Request $request)
    {
        return response()->json(['user' => $this->userPayload($request->user())]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();
        return response()->json(['message' => 'Logged out.']);
    }

    public function registerPatient(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:120', 'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6', 'phone' => 'nullable|string|max:40',
        ]);
        $user = User::create(['name' => $data['name'], 'email' => $data['email'], 'password' => $data['password'], 'role' => 'patient', 'phone' => $data['phone'] ?? null]);
        $token = $user->createToken('patient-portal')->plainTextToken;
        return response()->json(['user' => $this->userPayload($user), 'token' => $token], 201);
    }

    private function userPayload(User $user): array
    {
        $user->loadMissing(['dentist', 'branch', 'clinic']);
        return [
            'id' => $user->id, 'name' => $user->name, 'email' => $user->email,
            'role' => $user->role, 'phone' => $user->phone, 'avatar' => $user->avatar,
            'branch_id' => $user->branch_id, 'clinic_id' => $user->clinic_id,
            'dentist_id' => $user->dentist?->id,
            'branch' => $user->branch?->only(['id','name','code']),
            'clinic' => $user->clinic?->only(['id','name','code','currency']),
        ];
    }
}
