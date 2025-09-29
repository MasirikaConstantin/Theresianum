<?php

use App\Models\Produit;
use App\Models\Vente;
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
        Schema::create('vente_produits', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Vente::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(Produit::class)->nullable()->constrained()->nullOnDelete();
            $table->integer('quantite')->default(1);
            $table->decimal('prix_unitaire', 10, 2);
            $table->decimal('remise', 10, 2)->default(0);
            $table->decimal('montant_total', 10, 2);
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
        Schema::dropIfExists('vente_produits');
    }
};
