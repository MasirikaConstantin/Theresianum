<?php

use App\Models\Client;
use App\Models\Succursale;
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
        Schema::create('rendezvous', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Client::class)->nullable()->constrained()->nullOnDelete();
            $table->date('date_rdv');
            $table->time('heure_debut');
            $table->time('heure_fin');
            $table->enum('statut', ['en_attente','confirmé', 'annulé', 'terminé', 'no-show'])->default('en_attente');
            $table->text('notes')->nullable();
            $table->uuid('ref')->unique();
            $table->json('services')->nullable();
            $table->softDeletesTz();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rendezvous');
    }
};
