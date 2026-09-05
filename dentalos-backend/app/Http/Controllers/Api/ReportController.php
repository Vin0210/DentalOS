<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\Appointment;
use App\Models\AuditLog;
use App\Models\Dentist;
use App\Models\InventoryItem;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function dashboard(Request $r)
    {
        $today = now()->toDateString();
        $branchId = $r->get('branch_id');
        $apptQ = Appointment::query();
        if ($branchId) $apptQ->where('branch_id', $branchId);
        $todayAppts = (clone $apptQ)->where('date', $today);
        $revToday = Payment::whereDate('created_at', $today)->sum('amount');
        $outstanding = Invoice::whereIn('status', ['unpaid','partial'])->sum('balance');
        $newPatients = Patient::whereDate('created_at', $today)->count();
        $totalPatients = Patient::count();

        $statusBreakdown = (clone $apptQ)->where('date', $today)
            ->select('status', DB::raw('count(*) as c'))->groupBy('status')->pluck('c', 'status');

        $upcoming = (clone $apptQ)->with(['patient','dentist.user'])->where('date', '>=', $today)
            ->whereIn('status', ['scheduled','confirmed','checked_in'])->orderBy('date')->orderBy('start_time')->limit(8)->get();

        $rev7 = Payment::select(DB::raw('date(created_at) as d'), DB::raw('sum(amount) as total'))
            ->where('created_at', '>=', now()->subDays(6)->startOfDay())->groupBy('d')->orderBy('d')->get();

        $dentistPerf = Dentist::with('user')->get()->map(fn ($d) => [
            'id' => $d->id, 'name' => $d->user?->name, 'specialization' => $d->specialization,
            'appointments' => Appointment::where('dentist_id', $d->id)->whereMonth('date', now()->month)->count(),
            'revenue' => (float) Payment::whereHas('invoice', fn ($q) => $q->whereIn('id', Appointment::where('dentist_id', $d->id)->pluck('id')->isEmpty() ? [0] : Appointment::where('dentist_id', $d->id)->pluck('id')))->sum('amount'),
        ]);

        return response()->json([
            'kpis' => [
                'appointments_today' => (clone $todayAppts)->count(),
                'patients_today' => (clone $todayAppts)->distinct('patient_id')->count('patient_id'),
                'revenue_today' => (float) $revToday,
                'outstanding' => (float) $outstanding,
                'new_patients_today' => $newPatients,
                'total_patients' => $totalPatients,
            ],
            'appointment_status' => $statusBreakdown,
            'upcoming' => $upcoming,
            'revenue_7d' => $rev7,
            'dentists' => $dentistPerf,
            'alerts' => [
                'low_stock' => InventoryItem::whereColumn('quantity', '<=', 'min_stock')->count(),
                'unpaid_invoices' => Invoice::whereIn('status', ['unpaid','partial'])->count(),
                'expiring' => InventoryItem::whereNotNull('expires_at')->where('expires_at', '<=', now()->addDays(60))->count(),
            ],
        ]);
    }

    public function financial(Request $r)
    {
        $from = $r->get('from', now()->subDays(30)->toDateString());
        $to = $r->get('to', now()->toDateString());
        $daily = Payment::select(DB::raw('date(created_at) as d'), DB::raw('sum(amount) as total'), DB::raw('count(*) as n'))
            ->whereBetween('created_at', [$from . ' 00:00', $to . ' 23:59'])->groupBy('d')->orderBy('d')->get();
        $byMethod = Payment::select('method', DB::raw('sum(amount) as total'))->whereBetween('created_at', [$from . ' 00:00', $to . ' 23:59'])->groupBy('method')->get();
        return response()->json([
            'revenue' => (float) $daily->sum('total'), 'payments' => $daily->sum('n'),
            'outstanding' => (float) Invoice::whereIn('status', ['unpaid','partial'])->sum('balance'),
            'daily' => $daily, 'by_method' => $byMethod,
        ]);
    }

    public function appointments(Request $r)
    {
        $from = $r->get('from', now()->subDays(30)->toDateString());
        $to = $r->get('to', now()->toDateString());
        $rows = Appointment::select('status', DB::raw('count(*) as c'))->whereBetween('date', [$from, $to])->groupBy('status')->pluck('c', 'status');
        $trend = Appointment::select(DB::raw('date as d'), DB::raw('count(*) as c'))->whereBetween('date', [$from, $to])->groupBy('d')->orderBy('d')->get();
        return response()->json(['by_status' => $rows, 'trend' => $trend]);
    }
}
