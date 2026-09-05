<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\Appointment;
use App\Models\AuditLog;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\Setting;
use Illuminate\Http\Request;

class SystemController extends Controller
{
    public function search(Request $r)
    {
        $s = $r->get('q', '');
        if (strlen($s) < 2) return response()->json(['patients' => [], 'appointments' => [], 'invoices' => []]);
        return response()->json([
            'patients' => Patient::where(fn ($w) => $w->where('first_name','like',"%$s%")->orWhere('last_name','like',"%$s%")->orWhere('patient_no','like',"%$s%"))->limit(6)->get(['id','patient_no','first_name','last_name','phone']),
            'appointments' => Appointment::with('patient')->whereHas('patient', fn ($w) => $w->where('first_name','like',"%$s%")->orWhere('last_name','like',"%$s%"))->limit(6)->get(['id','patient_id','date','start_time','status']),
            'invoices' => Invoice::where('invoice_no','like',"%$s%")->limit(6)->get(['id','invoice_no','total','status']),
        ]);
    }

    public function notifications(Request $r)
    {
        $q = AppNotification::where(function ($w) use ($r) { $w->whereNull('user_id')->orWhere('user_id', $r->user()?->id); })->orderByDesc('created_at');
        return response()->json($q->paginate(20));
    }

    public function readNotification(Request $r, AppNotification $notification)
    {
        $notification->update(['read_at' => now()]);
        return response()->json($notification);
    }

    public function auditLogs()
    {
        return response()->json(AuditLog::with('user:id,name')->orderByDesc('created_at')->paginate(30));
    }

    public function settings() { return response()->json(Setting::all()->pluck('value', 'key')); }
    public function saveSettings(Request $r)
    {
        $d = $r->validate(['settings' => 'required|array']);
        foreach ($d['settings'] as $k => $v) Setting::updateOrCreate(['clinic_id' => $r->get('clinic_id'), 'key' => $k], ['value' => is_array($v) ? json_encode($v) : (string) $v]);
        return response()->json(['message' => 'Settings saved.']);
    }
}
