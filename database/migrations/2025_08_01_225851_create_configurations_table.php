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
        Schema::create('configurations', function (Blueprint $table) {
            $table->id();
            $table->boolean('actif')->default(false);
            $table->float('ratio_achat'); // Montant pour 1 point (ex: 7$ = 1 point)
            $table->float('valeur_point'); // Valeur d'1 point en $ (ex: 0.5$)
            $table->integer('seuil_utilisation'); // Seuil minimum pour utiliser les points
            $table->uuid('ref')->unique(); // Taux de TVA
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('configurations');
    }
};
