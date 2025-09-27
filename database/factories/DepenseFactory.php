<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Depense>
 */
class DepenseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'montant' => fake()->randomFloat(2, 100, 1000),
            'caisse_id' => 6,
            'user_id' => 4,
            'created_at' => fake()->dateTimeBetween('-1 year', 'now'),
            'libelle' => fake()->sentence(6),
            'description' => fake()->sentence(6),
            'ref' => Str::uuid(),
        ];
    }
}
