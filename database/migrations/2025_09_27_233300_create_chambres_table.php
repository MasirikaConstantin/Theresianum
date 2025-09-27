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
        Schema::create('chambres', function (Blueprint $table) {
            $table->id();   
            $table->string('numero')->unique();
            $table->enum('type', ['simple', 'double', 'suite', 'familiale']);
            $table->decimal('prix_nuit', 8, 2);
            $table->integer('capacite');
            $table->text('equipements')->nullable();
            $table->enum('statut', ['disponible', 'occupee', 'nettoyage', 'maintenance'])->default('disponible');
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
    }
};
