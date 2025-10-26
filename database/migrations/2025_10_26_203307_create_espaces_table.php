<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('espaces', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->integer('capacite_max');
            $table->enum('vocation', ['journee', 'nuit', 'mixte']);
            $table->decimal('prix_journee', 8, 2);
            $table->decimal('prix_nuit', 8, 2);
            $table->text('equipements');
            $table->boolean('disponible')->default(true);
            $table->uuid('ref')->unique();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('espaces');
    }
};
