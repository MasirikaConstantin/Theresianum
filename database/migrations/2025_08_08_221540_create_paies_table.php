<?php

use App\Models\Agent;
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
        Schema::create('paies', function (Blueprint $table) {
            $table->id();
             // Référence à l'agent
             $table->foreignIdFor(Agent::class)->nullable()->constrained('agents')->nullOnDelete();
            
             // Informations de base
             $table->string('matricule');
             $table->string('nom_complet');
             $table->integer('nombre_enfants')->default(0);
             $table->string('fonction');
             $table->string('affectation');
             $table->string('numero_cnss')->nullable();
             $table->string('anciennete');
             
             // Période de paie
             $table->date('date_debut_periode');
             $table->date('date_fin_periode');
             $table->date('date_emission');
             
             // Gains
             $table->decimal('salaire_base', 10, 2);
             $table->decimal('heures_supplementaires', 10, 2)->default(0);
             $table->decimal('conges_payes', 10, 2)->default(0);
             $table->decimal('pecule_conge', 10, 2)->default(0);
             $table->decimal('gratification', 10, 2)->default(0);
             $table->decimal('prime_fidelite', 10, 2)->default(0);
             $table->decimal('prime_diverse', 10, 2)->default(0);
             $table->decimal('allocation_familiale', 10, 2)->default(0);
             $table->decimal('allocation_epouse', 10, 2)->default(0);
             $table->decimal('afm_gratification', 10, 2)->default(0);
             
             // Cotisations et retenues
             $table->decimal('cotisation_cnss', 10, 2)->default(0);
             $table->decimal('impot_revenu', 10, 2)->default(0);
             $table->decimal('prets_retenus', 10, 2)->default(0);
             $table->decimal('avance_salaire', 10, 2)->default(0);
             $table->decimal('paie_negative', 10, 2)->default(0);
             $table->decimal('autres_regularisations', 10, 2)->default(0);
             
             // Totaux calculés
             $table->decimal('remuneration_brute', 10, 2);
             $table->decimal('total_retenues', 10, 2);
             $table->decimal('net_imposable', 10, 2);
             $table->decimal('net_a_payer', 10, 2);
             
            
             $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
             $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
             
             
             $table->uuid('ref')->unique();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paies');
    }
};
