<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable,HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'ref',
        'role',
        'created_by',
        'telephone',
        'adresse',
        'date_embauche',
        
        'is_active',
        'avatar',
        'updated_by',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->ref = \Illuminate\Support\Str::uuid();
            $model->created_by = auth()->id();
            $model->updated_by = auth()->id();
        });
        static::updating(function ($model) {
            $model->updated_by = auth()->id();
        });
    }
    public function hasAnyRole($roles)
    {
        return in_array($this->role, (array) $roles);
    }
    public function succursale()
    {
        return $this->belongsTo(Succursale::class);
    }
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }


    public function getPendingTransfersCount(): int
{
    if (!$this->succursale_id) {
        return 0;
    }

    return TransfertStock::with(['transfert'])->whereHas('transfert')
        ->where(function($query) {
            $query->where('succursale_destination_id', $this->succursale_id);
        })
        ->where('statut', 'en attente')
        ->count();
}
    public function isAdmin()
    {
        return $this->role === 'admin'; 
    }
    public function isGerant()
    {
        return $this->role === 'gerant'; 
    }
    public function isCoiffeur()
    {
        return $this->role === 'coiffeur'; 
    }
    public function isCaissier()
    {
        return $this->role === 'caissier'; 
    }
    protected $appends = ['avatar_url'];
    public function getAvatarUrlAttribute()
    {
        
        return $this->avatar ? Storage::disk('public')->url($this->avatar) : null;
    }
    
    public function conges()
    {
        return $this->hasMany(Conge::class);
    }
    public function hasRole($role)
{
    return $this->role === $role; // Adaptez selon votre implémentation
}
}