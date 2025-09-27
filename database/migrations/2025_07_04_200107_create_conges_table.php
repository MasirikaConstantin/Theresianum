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
        Schema::create('conges', function (Blueprint $table) {
            $table->id();
            $table->text('agent_id');
            $table->enum('type', ['annuel', 'maladie', 'maternite', 'exceptionnel', 'sans_solde']);
            $table->date('date_debut');
            $table->date('date_fin');
            $table->integer('duree_jours');
            $table->text('motif');
            $table->enum('statut', ['en_attente', 'approuve', 'rejete'])->default('en_attente');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->text('commentaire')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->string('ref')->unique();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conges');
    }
};
