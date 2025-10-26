<?php

use App\Models\Chambre;
use App\Models\Client;
use App\Models\Salle;
use App\Models\User;
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
        Schema::create('chambres', function (Blueprint $table) {
            $table->id(); 
            $table->string('nom');  
            $table->string('numero')->unique();
            $table->enum('type', ['simple', 'double', 'suite', 'familiale']);
            $table->decimal('prix', 8, 2);
            $table->integer('capacite');
            $table->text('equipements')->nullable();
            $table->enum('statut', ['disponible', 'occupee', 'nettoyage', 'maintenance'])->default('disponible');
            $table->uuid('ref')->unique();
            $table->timestamps();
        });

        Schema::create('salles', function (Blueprint $table) {
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

        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Client::class)->constrained();
            $table->foreignIdFor(Chambre::class)->nullable()->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Salle::class)->nullable()->constrained()->cascadeOnDelete();
            $table->datetime('date_debut');
            $table->datetime('date_fin');
            $table->enum('type_reservation', ['chambre', 'salle','espace']);
            $table->enum('statut', ['confirmee', 'en_attente', 'annulee', 'terminee'])->default('en_attente');
            $table->decimal('prix_total', 10, 2);
            $table->enum('type_paiement', ['espece', 'cheque', 'virement'])->default('espece');
            $table->enum('statut_paiement', ['paye', 'non_paye'])->default('non_paye');
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
        Schema::dropIfExists('chambres');
        Schema::dropIfExists('salles');
        Schema::dropIfExists('reservations');
    }
};
