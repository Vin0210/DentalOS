<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Branch;
use App\Models\Clinic;
use App\Models\Dentist;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\Invoice;
use App\Models\OdontogramRecord;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\Procedure;
use App\Models\ProcedureCategory;
use App\Models\Room;
use App\Models\Supplier;
use App\Models\TreatmentPlan;
use App\Models\User;
use Illuminate\Database\Seeder;

class DentalOsSeeder extends Seeder
{
    public function run(): void
    {
        $clinic1 = Clinic::create(['name' => 'DentalOS Smile Studio', 'code' => 'DS-01', 'email' => 'hello@dentalos.ph', 'phone' => '+63 2 8555 0100', 'address' => '123 Ayala Avenue, Makati', 'city' => 'Makati', 'currency' => '₱']);
        $clinic2 = Clinic::create(['name' => 'DentalOS Cebu Dental Care', 'code' => 'DC-02', 'email' => 'cebu@dentalos.ph', 'phone' => '+63 32 555 0101', 'address' => '45 Osmeña Blvd, Cebu City', 'city' => 'Cebu', 'currency' => '₱']);

        $branches = [];
        foreach ([$clinic1, $clinic2] as $c) {
            foreach (['Main', 'Annex'] as $i => $suffix) {
                $branches[] = Branch::create(['clinic_id' => $c->id, 'name' => "$c->name — $suffix", 'code' => $c->code . '-' . ($i + 1), 'phone' => $c->phone, 'address' => $c->address, 'city' => $c->city]);
            }
        }
        $rooms = [];
        foreach ($branches as $b) {
            for ($i = 1; $i <= 3; $i++) $rooms[] = Room::create(['branch_id' => $b->id, 'name' => "Chair $i", 'code' => "CH-$i", 'type' => 'operatory']);
        }

        $admin = User::create(['name' => 'Maria Santos', 'email' => 'admin@dentalos.ph', 'password' => 'password', 'role' => 'super_admin', 'clinic_id' => $clinic1->id, 'branch_id' => $branches[0]->id]);
        $users = [
            ['Jose Rizal', 'clinic@dentalos.ph', 'clinic_admin'],
            ['Ana Reyes', 'reception@dentalos.ph', 'receptionist'],
            ['Mark Villanueva', 'accounting@dentalos.ph', 'accountant'],
            ['Jenny Cruz', 'jenny@dentalos.ph', 'patient'],
        ];
        foreach ($users as [$n, $e, $r]) User::create(['name' => $n, 'email' => $e, 'password' => 'password', 'role' => $r, 'clinic_id' => $clinic1->id, 'branch_id' => $branches[0]->id]);

        $dentistNames = [
            ['Dr. Sofia Mendoza', 'sofia@dentalos.ph', 'Orthodontics'],
            ['Dr. Miguel Torres', 'miguel@dentalos.ph', 'Endodontics'],
            ['Dr. Isabel Navarro', 'isabel@dentalos.ph', 'General Dentistry'],
            ['Dr. Rafael Aquino', 'rafael@dentalos.ph', 'Oral Surgery'],
            ['Dr. Liza Fernandez', 'liza@dentalos.ph', 'Prosthodontics'],
        ];
        $dentists = [];
        foreach ($dentistNames as $i => [$n, $e, $s]) {
            $u = User::create(['name' => $n, 'email' => $e, 'password' => 'password', 'role' => 'dentist', 'clinic_id' => $clinic1->id, 'branch_id' => $branches[$i % 2]->id]);
            $dentists[] = Dentist::create(['user_id' => $u->id, 'branch_id' => $branches[$i % 2]->id, 'license_no' => 'DMD-00' . (100 + $i), 'specialization' => $s, 'color' => ['#0F766E','#3B82F6','#8B5CF6','#F59E0B','#EF4444'][$i % 5]]);
        }

        $cats = [];
        foreach (['Preventive' => '#22C55E', 'Restorative' => '#3B82F6', 'Surgery' => '#EF4444', 'Cosmetic' => '#8B5CF6', 'Orthodontics' => '#F59E0B'] as $n => $c) {
            $cats[$n] = ProcedureCategory::create(['name' => $n, 'color' => $c]);
        }
        $procs = [
            ['Consultation', 'CON-001', 'Preventive', 500, 20], ['Cleaning', 'CLN-001', 'Preventive', 1000, 40],
            ['Fluoride Application', 'FLU-001', 'Preventive', 800, 20], ['Filling', 'FIL-001', 'Restorative', 1500, 40],
            ['Extraction', 'EXT-001', 'Surgery', 2000, 30], ['Root Canal', 'RCT-001', 'Restorative', 8000, 90],
            ['Crown', 'CRN-001', 'Restorative', 12000, 60], ['Bridge', 'BRG-001', 'Restorative', 15000, 90],
            ['Implant', 'IMP-001', 'Surgery', 45000, 120], ['Whitening', 'WHT-001', 'Cosmetic', 9000, 60],
            ['Braces Adjustment', 'ORT-001', 'Orthodontics', 2500, 30], ['Veneers', 'VEN-001', 'Cosmetic', 18000, 90],
        ];
        $procModels = [];
        foreach ($procs as [$n, $code, $cat, $price, $dur]) {
            $procModels[$code] = Procedure::create(['name' => $n, 'code' => $code, 'category_id' => $cats[$cat]->id, 'default_price' => $price, 'duration_minutes' => $dur, 'description' => "$n procedure"]);
        }

        $first = ['Jose','Maria','Ana','Ramon','Liza','Miguel','Sofia','Rafael','Isabel','Paolo','Katrina','Daniel','Bianca','Enrico','Grace','Marco','Nadia','Paolo','Rosa','Carlo','Diana','Felix','Gemma','Hector','Irene','Joaquin','Karla','Luis','Marta','Nico','Olivia','Pedro','Quennie','Rico','Sara','Tomas','Ursula','Victor','Wendy','Xavier','Yolanda','Zandro','Aileen','Bernardo','Corazon','Danilo','Elena','Felipe','Gloria','Hernan'];
        $last = ['Santos','Reyes','Cruz','Bautista','Ocampo','Garcia','Mendoza','Torres','Tomas','Andrada','Castillo','Flores','Villanueva','Ramos','Aquino','Navarro','Salazar','Mercado','Aguilar','Delgado','Santiago','Domingo','Marquez','Fernandez','Lopez','Pascual','Santiago','Rivera','Moraless','Padilla','Velasco','Rosales','Dizon','Galang','Manalo','Quezon','Abad','Roxas','Luna','Mabini','Bonifacio','Jacinto','Lapid','Estrada','Binay','Cayetano','Legarda','Poe','Villar'];
        $patients = [];
        for ($i = 0; $i < 110; $i++) {
            $fn = $first[$i % count($first)];
            $ln = $last[($i * 7) % count($last)];
            $p = Patient::create([
                'clinic_id' => $clinic1->id, 'branch_id' => $branches[$i % 2]->id,
                'patient_no' => 'PT-' . str_pad((string) ($i + 1), 6, '0', STR_PAD_LEFT),
                'first_name' => $fn, 'last_name' => $ln . ($i >= 50 ? " $i" : ''),
                'date_of_birth' => now()->subYears(18 + ($i % 50))->subDays($i)->toDateString(),
                'gender' => $i % 2 ? 'female' : 'male', 'phone' => '+63917' . str_pad((string) (100000 + $i * 137), 7, '0', STR_PAD_LEFT),
                'email' => strtolower($fn) . $i . '@example.com', 'address' => ($i + 1) . ' Mabini St, Quezon City', 'city' => 'Quezon City',
                'emergency_name' => 'Emergency Contact', 'emergency_phone' => '+63918' . str_pad((string) (200000 + $i), 7, '0', STR_PAD_LEFT),
                'blood_type' => ['A+','B+','O+','AB+'][$i % 4], 'status' => 'active',
                'primary_dentist_id' => $dentists[$i % count($dentists)]->id,
                'last_visit_at' => now()->subDays($i % 60),
            ]);
            $p->medicalHistory()->create(['allergies' => $i % 5 == 0 ? ['Penicillin'] : [], 'conditions' => $i % 4 == 0 ? ['Hypertension'] : [], 'medications' => [], 'notes' => null]);
            $p->dentalHistory()->create(['history' => 'Regular checkups', 'oral_hygiene_notes' => 'Brush twice daily']);
            $patients[] = $p;
        }

        $teeth = ['18','17','16','15','14','13','12','11','21','22','23','24','25','26','27','28','48','47','46','45','44','43','42','41','31','32','33','34','35','36','37','38'];
        $conds = ['healthy','healthy','healthy','caries','filled','crown','root_canal','missing'];
        foreach (array_slice($patients, 0, 40) as $pi => $p) {
            foreach (array_slice($teeth, 0, 8 + ($pi % 10)) as $t) {
                OdontogramRecord::create(['patient_id' => $p->id, 'tooth_number' => $t, 'condition' => $conds[($pi + (int) $t) % count($conds)], 'surfaces' => $pi % 3 == 0 ? ['occlusal'] : null, 'dentist_id' => $dentists[$pi % count($dentists)]->id]);
            }
        }

        $statuses = ['scheduled','confirmed','checked_in','completed','completed','cancelled','no_show'];
        for ($i = 0; $i < 120; $i++) {
            $day = now()->subDays(20 - ($i % 28))->toDateString();
            Appointment::create([
                'clinic_id' => $clinic1->id, 'branch_id' => $branches[$i % 2]->id,
                'patient_id' => $patients[$i % count($patients)]->id, 'dentist_id' => $dentists[$i % count($dentists)]->id,
                'room_id' => $rooms[$i % count($rooms)]->id, 'procedure_id' => array_values($procModels)[$i % count($procModels)]->id,
                'date' => $day, 'start_time' => sprintf('%02d:00', 8 + ($i % 9)), 'end_time' => sprintf('%02d:30', 8 + ($i % 9)),
                'status' => $statuses[$i % count($statuses)], 'created_by' => $admin->id,
            ]);
        }

        foreach (array_slice($patients, 0, 30) as $i => $p) {
            $plan = TreatmentPlan::create(['patient_id' => $p->id, 'dentist_id' => $dentists[$i % count($dentists)]->id, 'title' => 'Comprehensive Care Plan', 'status' => ['proposed','accepted','in_progress','completed'][$i % 4]]);
            $plan->items()->create(['procedure_id' => $procModels['RCT-001']->id, 'tooth_number' => '16', 'priority' => 'high', 'estimated_cost' => 8000, 'estimated_duration' => 90, 'status' => $plan->status]);
            $plan->items()->create(['procedure_id' => $procModels['CRN-001']->id, 'tooth_number' => '16', 'priority' => 'medium', 'estimated_cost' => 12000, 'estimated_duration' => 60, 'status' => $plan->status]);
        }

        for ($i = 0; $i < 45; $i++) {
            $p = $patients[$i % count($patients)];
            $proc = array_values($procModels)[$i % count($procModels)];
            $inv = Invoice::create(['clinic_id' => $clinic1->id, 'branch_id' => $branches[$i % 2]->id, 'patient_id' => $p->id, 'invoice_no' => 'INV-' . str_pad((string) ($i + 1), 6, '0', STR_PAD_LEFT), 'status' => 'unpaid', 'subtotal' => 0, 'discount' => $i % 5 == 0 ? 500 : 0, 'tax' => 0, 'total' => 0, 'paid' => 0, 'balance' => 0, 'due_date' => now()->addDays(14)->toDateString(), 'created_by' => $admin->id]);
            $inv->items()->create(['procedure_id' => $proc->id, 'description' => $proc->name, 'quantity' => 1, 'unit_price' => $proc->default_price, 'amount' => $proc->default_price]);
            $inv->recalculate();
            if ($i % 3 !== 0) {
                Payment::create(['invoice_id' => $inv->id, 'patient_id' => $p->id, 'amount' => $i % 3 === 1 ? (float) $inv->total : (float) $inv->total / 2, 'method' => ['cash','card','e_wallet','bank_transfer'][$i % 4], 'received_by' => $admin->id]);
                $inv->refresh()->recalculate();
            }
        }

        $invCat = InventoryCategory::create(['name' => 'Consumables']);
        InventoryCategory::create(['name' => 'Instruments']);
        InventoryCategory::create(['name' => 'Anesthetics']);
        $sup = Supplier::create(['name' => 'MediDental Supplies Inc.', 'contact_person' => 'Ramon Dy', 'email' => 'sales@medidental.ph', 'phone' => '+63 2 8555 0200', 'address' => 'Binondo, Manila']);
        $items = [
            ['Latex Gloves (box)', 'GLV-001', 'box', 24, 30, 320], ['Mouth Mirror', 'INS-010', 'pcs', 45, 20, 150],
            ['Composite Resin Kit', 'RES-020', 'kit', 12, 5, 2500], ['Lidocaine 2%', 'ANE-005', 'vial', 60, 25, 180],
            ['Dental Bibs', 'CON-030', 'pack', 8, 15, 450], ['Implant Fixture', 'IMP-100', 'pcs', 10, 4, 12000],
        ];
        foreach ($items as [$n, $sku, $unit, $qty, $min, $cost]) {
            InventoryItem::create(['branch_id' => $branches[0]->id, 'category_id' => $invCat->id, 'supplier_id' => $sup->id, 'name' => $n, 'sku' => $sku, 'unit' => $unit, 'quantity' => $qty, 'min_stock' => $min, 'cost' => $cost, 'price' => $cost * 1.3, 'expires_at' => str_contains($sku, 'ANE') ? now()->addDays(45)->toDateString() : null]);
        }
    }
}
