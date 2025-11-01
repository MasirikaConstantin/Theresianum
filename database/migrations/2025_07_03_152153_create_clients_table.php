<?php

use App\Models\Succursale;
use App\Models\User;
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
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->nullable();
            $table->string('telephone', 20);
            $table->string('email', 100)->nullable();
            $table->text('notes')->nullable();
            $table->uuid('ref')->unique();
            $table->foreignId("enregistrer_par_id")->nullable()->constrained('users')->nullOnDelete();
            $table->date('date_naissance')->nullable();
            $table->softDeletesTz();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
