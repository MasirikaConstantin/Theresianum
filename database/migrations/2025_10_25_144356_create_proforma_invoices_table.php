<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Client;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
            Schema::create('proforma_invoices', function (Blueprint $table) {
                $table->id();
                $table->string('numero_facture')->unique();
                $table->foreignIdFor(Client::class)->nullable()->constrained()->nullOnDelete();
                $table->date('date_facture');
                $table->date('date_echeance')->nullable();
                $table->text('notes')->nullable();
                $table->decimal('montant_total', 12, 2)->default(0);
                $table->enum('statut', ['brouillon', 'envoyee', 'payee'])->default('brouillon');
                $table->uuid('ref')->unique();
                $table->foreignId("created_by")->nullable()->constrained("users")->cascadeOnDelete();
                $table->foreignId("updated_by")->nullable()->constrained("users")->cascadeOnDelete();
                $table->timestamps();
            });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proforma_invoices');
    }
};
