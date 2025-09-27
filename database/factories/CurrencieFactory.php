<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Currency>
 */
class CurrencieFactory extends Factory
{
    public function definition(): array
    {
        $currencies = [
            ['name' => 'Franc Congolais', 'code' => 'CDF', 'symbol' => 'FC'],
            ['name' => 'Dollar Américain', 'code' => 'USD', 'symbol' => '$'],
            ['name' => 'Euro', 'code' => 'EUR', 'symbol' => '€'],
            ['name' => 'Livre Sterling', 'code' => 'GBP', 'symbol' => '£'],
        ];

        $currency = $this->faker->randomElement($currencies);

        return [
            'name' => $currency['name'],
            'code' => $currency['code'],
            'symbol' => $currency['symbol'],
            'exchange_rate' => $this->faker->randomFloat(4, 0.0001, 5000),
            'is_active' => $this->faker->boolean(90),
            'is_default' => false, // Par défaut à false pour éviter plusieurs devises par défaut
        ];
    }
}
