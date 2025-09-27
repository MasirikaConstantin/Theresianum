<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Client;
use App\Models\Chambre;
use App\Models\Salle;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Client::class)->constrained();
            $table->foreignIdFor(Chambre::class)->nullable()->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Salle::class)->nullable()->constrained()->cascadeOnDelete();
            $table->date('date_debut');
            $table->date('date_fin');
            $table->enum('type_reservation', ['chambre', 'salle']);
            $table->enum('statut', ['confirmee', 'en_attente', 'annulee', 'terminee'])->default('en_attente');
            $table->decimal('prix_total', 10, 2);
            $table->enum('vocation', ['journee', 'nuit', 'mixte'])->nullable(); 
            $table->uuid('ref')->unique();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
