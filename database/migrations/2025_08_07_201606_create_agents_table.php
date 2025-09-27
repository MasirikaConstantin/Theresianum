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
        Schema::create('agents', function (Blueprint $table) {
            $table->id();
            $table->string('matricule')->unique();
            $table->string('nom');
            $table->string('postnom');
            $table->string('prenom');
            $table->string('sexe');
            $table->string('telephone', 20)->nullable();
            $table->string('adresse')->nullable();
            $table->date('date_naissance')->nullable();
            $table->string('lieu_naissance')->nullable();
            $table->string('etat_civil')->nullable();
            $table->string('province_origine')->nullable();
            $table->string('territoire_origine')->nullable();
            $table->string('district_origine')->nullable();
            $table->string('commune_origine')->nullable();
            $table->string('email')->unique();
            $table->string('role')->nullable();
            $table->string('succursale_id')->nullable();
            $table->string('nombre_enfant')->nullable();
            $table->string('statut');
            $table->string('numero_cnss')->nullable();
            $table->string('avatar')->nullable();
            $table->string('signature')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->uuid('ref')->unique();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agents');
    }
};
