<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProcedureCategory extends Model
{
    protected $fillable = ['name','color'];
    public function procedures() { return $this->hasMany(Procedure::class, 'category_id'); }
}
