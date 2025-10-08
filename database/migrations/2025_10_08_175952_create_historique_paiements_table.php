<?php

use App\Models\Reservation;
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
        Schema::create('historique_paiements', function (Blueprint $table) {
            $table->id();
            $table->uuid('ref')->unique();
            $table->foreignIdFor(Reservation::class)->constrained()->cascadeOnDelete();
            $table->foreignId('operateur_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('montant', 10, 2);
            $table->enum('mode_paiement', ['espèces', 'carte', 'chèque', 'autre'])->default('espèces'); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('historique_paiements');
    }
};
