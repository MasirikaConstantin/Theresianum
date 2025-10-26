<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Client extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'telephone',
        'email',
        'notes',
        'succursale_id',
        'enregistrer_par_id',
        'adresse',
        'date_naissance',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->ref = (string) \Illuminate\Support\Str::uuid();
            if (auth()->check()) {
                $model->enregistrer_par_id = auth()->id();
            }
        });
    }

    public function getAgeAttribute()
    {
        return Carbon::parse($this->date_naissance)->age;
    }

    public function succursale()
    {
        return $this->belongsTo(Succursale::class);
    }

    public function enregistrePar()
    {
        return $this->belongsTo(User::class, 'enregistrer_par_id');
    }
    protected $appends = ['age'];
    public function fidelite(){
        return $this->belongsTo(ClientFidelite::class, 'id', 'client_id');
    }
    public function ventes(){
        return $this->hasMany(Vente::class, 'client_id');
    }
    public function enregistre_par(){
        return $this->belongsTo(User::class, 'enregistrer_par_id');
    }
    
}
