<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reference extends Model
{
    use HasFactory;

    protected $fillable = [
        'agent_id',
        'nom',
        'telephone',
        'email',
        'fonction'
    ];

    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }
}