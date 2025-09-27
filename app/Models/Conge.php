<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Conge extends Model
{
    use HasFactory;

    protected $fillable = [
        'agent_id',
        'type',
        'date_debut',
        'date_fin',
        'duree_jours',
        'motif',
        'statut',
        'approved_by',
        'commentaire',
        'created_by',
        'ref'
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
    ];

    protected static function booted()
    {
        static::creating(function ($conge) {
            $conge->ref = Str::uuid()->toString();
        });
    }
    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }

    public function approbateur()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function createur()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    public function scopeFilter($query, array $filters)
    {
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('motif', 'like', '%' . $filters['search'] . '%')
                  ->orWhereHas('agent', function ($q) use ($filters) {
                      $q->where('nom', 'like', '%' . $filters['search'] . '%');
                  });
            });
        }

        if (!empty($filters['statut'])) {
            $query->where('statut', $filters['statut']);
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['month'])) {
            $query->whereMonth('date_debut', $filters['month']);
        }

        if (!empty($filters['year'])) {
            $query->whereYear('date_debut', $filters['year']);
        }
    }
}