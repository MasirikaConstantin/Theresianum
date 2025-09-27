<?php

use App\Models\Client;
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
        Schema::create('client_fidelites', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Client::class)->constrained()->cascadeOnDelete();
            $table->integer('points')->default(0);
            $table->date('dernier_achat')->nullable();
            $table->integer('nombre_achats')->default(0);
            $table->decimal('montant_total_achats', 10, 2)->default(0);
            $table->boolean('a_recu_cadeau_anniversaire')->default(false);
            $table->uuid('ref')->unique();
            $table->softDeletesTz();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('client_fidelites');
    }
};
