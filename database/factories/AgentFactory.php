<?php

namespace Database\Factories;

use App\Models\Succursale;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Agent>
 */
class AgentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
public function definition()
{
    return [
        'matricule' => $this->faker->unique()->bothify('AG###??'),
        'nom' => $this->faker->lastName,
        'postnom' => $this->faker->lastName,
        'prenom' => $this->faker->firstName,
        'sexe' => $this->faker->randomElement(['M', 'F']),
        'email' => $this->faker->unique()->safeEmail,
        'role' => $this->faker->randomElement(['admin', 'manager', 'agent', 'caissier']),
        'statut' => $this->faker->randomElement(['actif', 'inactif', 'suspendu']),
        'succursale_id' => Succursale::factory(),
    ];
}
}
