<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ServiceSeederBeta extends Seeder
{
    public function run(): void
    {
        $services = [
            ['Pose perruque', 'Pose professionnelle de perruque avec finition naturelle.'],
            ['Tissage normal', 'Tissage classique pour un rendu élégant et naturel.'],
            ['Manucure', 'Soin des mains et des ongles avec vernis ou gel.'],
            ['Pedicure', 'Soin complet des pieds pour une peau douce et soignée.'],
            ['Service ongles', 'Pose et entretien des ongles : gel, acrylique, vernis semi-permanent.'],
            ['Maquillage permanant', 'Maquillage durable pour sourcils, lèvres ou yeux.'],
            ['NAILS', 'Tous nos services de stylisme ongulaire regroupés.'],
            ['SOINS', 'Soins du visage, du corps et de la peau pour un moment bien-être.'],
            ['BEAUTY', 'Prestations beauté : maquillage, soins, épilation, etc.'],
            ['MARIAGE', 'Forfaits beauté spéciaux pour mariée et demoiselles d’honneur.'],
            ['Gel services', 'Pose de gel UV pour ongles brillants et résistants.'],
            ['Pieds nails', 'Beauté et soins des ongles de pieds avec finitions au choix.'],
            ['Service Mariée', 'Préparation complète de la mariée : maquillage, coiffure, soins.'],
            ['Acrylique services', 'Pose d’ongles en acrylique avec ou sans extension.'],
            ['Produits pose parfait', 'Utilisation de produits professionnels pour une pose parfaite.'],
            ['Services tresses', 'Tresses simples, collées, box braids, nattes, etc.'],
            ['Décoloration cheveux naturel', 'Éclaircissement professionnel des cheveux naturels.'],
            ['Décoloration perruque', 'Décoloration et personnalisation de perruques.'],
            ['Autres services', 'Autres prestations disponibles sur demande.'],
            ['Coupe pixi', 'Coupe courte stylée pour un look frais et moderne.'],
            ['Ponytail', 'Pose de queue-de-cheval tendance avec finition impeccable.'],
        ];

        foreach ($services as $service) {
            Service::create([
                'name' => $service[0],
                'description' => $service[1],
                'duree_minutes' => rand(10, 60),
                'prix' =>rand(10, 30),
                'actif' => true,
                'ref' => Str::uuid(),
                'user_id' => null, // ou User::first()?->id si tu veux lier à un utilisateur
            ]);
        }
    }
}
