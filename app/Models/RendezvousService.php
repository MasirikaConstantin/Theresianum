<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RendezvousService extends Model
{
    protected $table = 'rendezvous_services';
    protected $fillable = [
        'rendezvous_id',
        'produit_id',
        'user_id',
        'prix_effectif',
        'notes',
        'ref'
    ];
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->ref = \Illuminate\Support\Str::uuid();
            $model->user_id = auth()->user()->id;
        });
    }

    

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function rendezvou()
    {
        return $this->belongsTo(Rendezvou::class);
    }
    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
