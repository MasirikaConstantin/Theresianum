<?php

use App\Models\Client;
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
        Schema::create('caisses', function (Blueprint $table) {
            $table->id();
            $table->decimal('solde', 15, 2)->default(0);
            $table->date('date_ouverture');
            $table->date('date_fermeture')->nullable();
            $table->enum('statut', ['ouverte', 'fermee'])->default('ouverte');
            $table->uuid('ref')->unique();
            $table->timestamps();
        });

        Schema::create('ventes', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Client::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(Reservation::class)->nullable()->constrained()->nullOnDelete();
            
            $table->foreignId('vendeur_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('caisse_id')->nullable()->constrained()->after('succursale_id');
            $table->decimal('remise', 10, 2)->default(0);
            $table->decimal('montant_total', 10, 2);
            $table->enum('mode_paiement', ['espèces', 'carte', 'chèque', 'autre'])->default('espèces'); //autre pour les paiements par points de fidélité
            $table->uuid('ref')->unique();
            $table->string('code')->unique();
            $table->softDeletesTz();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('caisses');
        Schema::dropIfExists('ventes');
    }
};
