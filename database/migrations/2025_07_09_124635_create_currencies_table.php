<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('currencies', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Ex: "Franc Congolais"
            $table->string('code', 3); // Ex: "CDF"
            $table->string('symbol', 5); // Ex: "FC"
            $table->decimal('exchange_rate', 10, 4); // Taux par rapport au dollar
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('currencies');
    }
};
