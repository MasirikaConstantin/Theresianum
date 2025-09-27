<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    public function definition()
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'email_verified_at' => now(),
            'avatar' => $this->faker->imageUrl(200, 200, 'people'),
            'password' => bcrypt('password'),
            'telephone' => $this->faker->phoneNumber(),
            'adresse' => $this->faker->address(),
            'date_embauche' => $this->faker->dateTimeBetween('-5 years', 'now'),
            'role' => $this->faker->randomElement(['admin', 'gerant', 'vendeur', 'aucun']),
            'is_active' => $this->faker->boolean(80),
            'last_login_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'last_login_ip' => $this->faker->ipv4(),
            'ref' => Str::uuid(),
            'created_by' => null,
            'updated_by' => null,
        ];
    }

    public function configure()
    {
        return $this->afterCreating(function ($user) {
            $user->created_by = $user->id;
            $user->updated_by = $user->id;
            $user->save();
        });
    }
}