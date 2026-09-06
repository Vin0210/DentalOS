<?php

namespace Database\Seeders;

use App\Models\AppNotification;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        if (AppNotification::count() > 0) return;
        $now = now();
        foreach ([
            ['Appointment confirmed', 'Maria Santos — today 9:00 AM', 'appointment', '/app/appointments', 0, null],
            ['Low stock alert', 'Latex Gloves below minimum (24/30)', 'stock', '/app/inventory', 0, null],
            ['Payment received', '₱3,000.00 for INV-000031', 'payment', '/app/billing', 1, null],
            ['New patient registered', 'Juan Dela Cruz — PT-000123', 'patient', '/app/patients', 1, null],
            ['Treatment plan proposed', 'Root Canal + Crown — tooth #16', 'treatment', '/app/treatments', 2, 1],
            ['Prescription ready', 'Amoxicillin 500mg — pickup at reception', 'prescription', null, 3, 2],
        ] as [$title, $body, $type, $link, $daysAgo, $readDaysAgo]) {
            $n = AppNotification::create(['title' => $title, 'body' => $body, 'type' => $type, 'link' => $link]);
            $n->created_at = $now->copy()->subDays($daysAgo);
            $n->read_at = $readDaysAgo === null ? null : $now->copy()->subDays($readDaysAgo);
            $n->save();
        }
    }
}
