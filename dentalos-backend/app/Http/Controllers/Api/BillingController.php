<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\AuditLog;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Refund;
use Illuminate\Http\Request;

class BillingController extends Controller
{
    public function invoices(Request $request)
    {
        $q = Invoice::with(['patient','items'])->orderByDesc('created_at');
        if ($request->get('status')) $q->where('status', $request->get('status'));
        if ($request->get('patient_id')) $q->where('patient_id', $request->get('patient_id'));
        if ($request->get('branch_id')) $q->where('branch_id', $request->get('branch_id'));
        return response()->json($q->paginate(min(100, (int) $request->get('per_page', 20))));
    }

    public function storeInvoice(Request $request)
    {
        $data = $request->validate([
            'patient_id' => 'required|exists:patients,id', 'branch_id' => 'nullable|exists:branches,id',
            'clinic_id' => 'nullable|exists:clinics,id', 'discount' => 'nullable|numeric|min:0',
            'tax' => 'nullable|numeric|min:0', 'due_date' => 'nullable|date', 'notes' => 'nullable|string',
            'items' => 'required|array|min:1', 'items.*.description' => 'required|string|max:200',
            'items.*.procedure_id' => 'nullable|exists:procedures,id', 'items.*.tooth_number' => 'nullable|string|max:8',
            'items.*.quantity' => 'nullable|integer|min:1', 'items.*.unit_price' => 'required|numeric|min:0',
        ]);
        $inv = Invoice::create([
            'patient_id' => $data['patient_id'], 'branch_id' => $data['branch_id'] ?? null,
            'clinic_id' => $data['clinic_id'] ?? null, 'invoice_no' => 'INV-' . str_pad((string) (Invoice::count() + 1), 6, '0', STR_PAD_LEFT),
            'discount' => $data['discount'] ?? 0, 'tax' => $data['tax'] ?? 0, 'due_date' => $data['due_date'] ?? null,
            'notes' => $data['notes'] ?? null, 'created_by' => $request->user()?->id, 'status' => 'unpaid',
            'subtotal' => 0, 'total' => 0, 'paid' => 0, 'balance' => 0,
        ]);
        foreach ($data['items'] as $it) {
            $qty = $it['quantity'] ?? 1;
            $inv->items()->create(['procedure_id' => $it['procedure_id'] ?? null, 'description' => $it['description'], 'tooth_number' => $it['tooth_number'] ?? null, 'quantity' => $qty, 'unit_price' => $it['unit_price'], 'amount' => $qty * $it['unit_price']]);
        }
        $inv->recalculate();
        AuditLog::record($request->user()?->id, 'create', 'invoices', $inv->id, "Invoice {$inv->invoice_no} created (₱" . number_format($inv->total, 2) . ')', [], $request->ip());
        return response()->json($inv->fresh()->load(['items','patient']), 201);
    }

    public function showInvoice(Invoice $invoice)
    {
        return response()->json($invoice->load(['items','payments','patient']));
    }

    public function pay(Request $request, Invoice $invoice)
    {
        $data = $request->validate(['amount' => 'required|numeric|min:1', 'method' => 'required|in:cash,card,bank_transfer,e_wallet,other', 'reference' => 'nullable|string|max:120', 'notes' => 'nullable|string']);
        if ($data['amount'] > (float) $invoice->balance + 0.009) return response()->json(['message' => 'Amount exceeds outstanding balance.'], 422);
        $payment = Payment::create(['invoice_id' => $invoice->id, 'patient_id' => $invoice->patient_id, 'amount' => $data['amount'], 'method' => $data['method'], 'reference' => $data['reference'] ?? null, 'notes' => $data['notes'] ?? null, 'received_by' => $request->user()?->id]);
        $invoice->refresh()->recalculate();
        AuditLog::record($request->user()?->id, 'payment', 'invoices', $invoice->id, "Payment ₱" . number_format($payment->amount, 2) . " for {$invoice->invoice_no}", [], $request->ip());
        AppNotification::notify('Payment received', '₱' . number_format($payment->amount, 2) . " for {$invoice->invoice_no}", 'payment', null, '/app/billing');
        return response()->json($payment, 201);
    }

    public function refund(Request $request, Invoice $invoice)
    {
        $data = $request->validate(['amount' => 'required|numeric|min:1', 'reason' => 'nullable|string']);
        $refund = Refund::create(['invoice_id' => $invoice->id, 'amount' => $data['amount'], 'reason' => $data['reason'] ?? null, 'created_by' => $request->user()?->id]);
        $invoice->refresh()->recalculate();
        return response()->json($refund, 201);
    }
}
