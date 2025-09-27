<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProduitResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request)
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'avatar' => $this->avatar,
        'description' => $this->description,
        'stock_global' => $this->stock_global,
        'prix_achat' => floatval($this->prix_achat),
        'prix_vente' => floatval($this->prix_vente),
        'ref' => $this->ref,
        'actif' => $this->actif,
        'user_id' => $this->user_id,
        'created_at' => $this->created_at,
        'updated_at' => $this->updated_at,
        'deleted_at' => $this->deleted_at,
        'stock' => $this->stock_succursales->first()?->quantite ?? 0,
        'succursale_id' => $this->stock_succursales->first()?->succursale_id ?? null,
    ];
}
}
