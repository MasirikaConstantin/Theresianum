<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEspaceRequest extends FormRequest
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
            'nom' => 'required|string|max:255',
            'capacite_max' => 'required|integer|min:1',
            'vocation' => 'required|in:journee,nuit,mixte',
            'prix_journee' => 'required|numeric|min:0',
            'prix_nuit' => 'required|numeric|min:0',
            'equipements' => 'required|string',
            'disponible' => 'boolean'
        ];
    }
}
