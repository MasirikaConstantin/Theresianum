<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\User;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('biometrie_empreintes', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(User::class)->constrained()->cascadeOnDelete();
            $table->binary('template')->comment('Modèle numérique de l\'empreinte');
            $table->string('hash_identification')->unique()->comment('Hash pour matching rapide');
            $table->string('doigt')->comment('Index droit, pouce gauche, etc.');
            $table->string('type_capteur')->default('optique');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('biometrie_empreintes');
    }
};
