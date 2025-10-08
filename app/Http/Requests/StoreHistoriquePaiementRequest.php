<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreHistoriquePaiementRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'montant' => 'required|numeric',
            'mode_paiement' => 'required|in:espèces,carte,chèque,autre',
            'code' => 'required|string',
            'statut_paiement' => 'required|in:payé,non payé',
            'montant_payer' => 'required|numeric',
            'vente_id' => 'required|exists:ventes,id',
            'operateur_id' => 'required|exists:users,id',
        ];
    }
}
