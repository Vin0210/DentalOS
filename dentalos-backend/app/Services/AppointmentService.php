<?php

namespace App\Services;

use App\Models\Appointment;
use Illuminate\Validation\ValidationException;

class AppointmentService
{
    public function checkConflicts(array $data, ?int $ignoreId = null): void
    {
        $q = Appointment::whereDate('date', substr($data['date'], 0, 10))
            ->where('status', '!=', 'cancelled')
            ->where(function ($q) use ($data) {
                $q->where('start_time', '<', $data['end_time'])
                  ->where('end_time', '>', $data['start_time']);
            });
        if ($ignoreId) $q->where('id', '!=', $ignoreId);

        if (!empty($data['dentist_id'])) {
            $conflict = (clone $q)->where('dentist_id', $data['dentist_id'])->exists();
            if ($conflict) throw ValidationException::withMessages(['dentist_id' => 'Dentist is already booked for this time slot.']);
        }
        if (!empty($data['room_id'])) {
            $conflict = (clone $q)->where('room_id', $data['room_id'])->exists();
            if ($conflict) throw ValidationException::withMessages(['room_id' => 'Room/chair is already occupied for this time slot.']);
        }
        if ($data['start_time'] >= $data['end_time']) {
            throw ValidationException::withMessages(['end_time' => 'End time must be after start time.']);
        }
    }

    public function advance(Appointment $appt, string $to): Appointment
    {
        $allowed = [
            'scheduled' => ['confirmed','cancelled'],
            'confirmed' => ['checked_in','cancelled','no_show'],
            'checked_in' => ['in_progress','cancelled','no_show'],
            'in_progress' => ['completed','cancelled'],
            'completed' => [], 'cancelled' => [], 'no_show' => [],
        ];
        if (!in_array($to, $allowed[$appt->status] ?? [])) {
            throw ValidationException::withMessages(['status' => "Cannot move from {$appt->status} to {$to}."]);
        }
        $appt->status = $to;
        $appt->save();
        return $appt;
    }
}
