// resources/js/Pages/ReservationsChambres/Create.tsx
import { Auth, Client, SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calculator, User, Bed, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Dollar } from '@/hooks/Currencies';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Réservations Chambres', href: '/reservations-chambres' },
    { title: 'Nouvelle réservation', href: '#' },
];

interface Chambre {
    id: number;
    numero: string;
    type: string;
    prix: number;
    capacite: number;
    statut: string;
}

export default function ReservationChambreCreate({ 
    auth, 
    chambres, 
    clients, 
    prefilledChambreId
}: { 
    auth: Auth;
    chambres: Chambre[];
    clients: Client[];
    prefilledChambreId?: number;
}) {
    const { data, setData, errors, post, processing } = useForm({
        client_id: '',
        date_debut: '',
        date_fin: '',
        heure_debut: '14:00', // Check-in par défaut
        heure_fin: '12:00',   // Check-out par défaut
        chambre_id: prefilledChambreId?.toString() || '',
        statut: 'en_attente',
        prix_total: 0
    });

    const [prixCalculé, setPrixCalculé] = useState<number>(0);
    const [duree, setDuree] = useState<string>('');

    // Calcul automatique du prix
    useEffect(() => {
        if (data.date_debut && data.date_fin && data.chambre_id) {
            const chambre = chambres.find(c => c.id.toString() === data.chambre_id);
            if (chambre) {
                // Combiner date et heure pour le calcul
                const debut = new Date(`${data.date_debut}T${data.heure_debut}`);
                const fin = new Date(`${data.date_fin}T${data.heure_fin}`);
                
                // Calcul en millisecondes
                const diffTime = fin.getTime() - debut.getTime();
                
                // Convertir en jours (arrondi au supérieur)
                let nuits = Math.ceil(diffTime / (1000 * 3600 * 24));
                
                // Si c'est la même journée mais avec des heures différentes, compter 1 nuit
                if (data.date_debut === data.date_fin && diffTime > 0) {
                    nuits = 1;
                }
                
                // Au moins 1 nuit
                nuits = Math.max(1, nuits);
                
                setDuree(`${nuits} nuit(s)`);
                setPrixCalculé(nuits * chambre.prix);
                setData('prix_total', nuits * chambre.prix);
            }
        } else {
            // Réinitialiser si données incomplètes
            setDuree('');
            setPrixCalculé(0);
            setData('prix_total', 0);
        }
    }, [data.date_debut, data.date_fin, data.heure_debut, data.heure_fin, data.chambre_id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation manuelle pour les heures sur la même journée
        if (data.date_debut === data.date_fin && data.heure_debut >= data.heure_fin) {
            alert('L\'heure de départ doit être postérieure à l\'heure d\'arrivée pour une réservation sur la même journée.');
            return;
        }
        
        post(route('reservations-chambres.store'));
    };

    const chambresDisponibles = chambres.filter(c => c.statut === 'disponible');

    // Générer les options d'heure
    const generateTimeOptions = () => {
        const options = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                options.push(time);
            }
        }
        return options;
    };

    const timeOptions = generateTimeOptions();

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Nouvelle réservation de chambre" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-6">
                <div className="flex items-center gap-4">
                    <Link href={route('reservations-chambres.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">Nouvelle réservation de chambre</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Section Client */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Informations client
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="client_id">Client *</Label>
                                        <Select 
                                            value={data.client_id} 
                                            onValueChange={(value) => setData('client_id', value)}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner un client" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {clients.map(client => (
                                                    <SelectItem key={client.id} value={client.id.toString()}>
                                                        {client.name} - {client.telephone}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.client_id && <p className="text-sm text-red-600">{errors.client_id}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Section Chambre */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bed className="h-5 w-5" />
                                        Choix de la chambre
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="chambre_id">Chambre *</Label>
                                        <Select 
                                            value={data.chambre_id} 
                                            onValueChange={(value) => setData('chambre_id', value)}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner une chambre" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {chambresDisponibles.map(chambre => (
                                                    <SelectItem key={chambre.id} value={chambre.id.toString()}>
                                                        Chambre {chambre.numero} - {chambre.type} - {Dollar(chambre.prix)}/nuit
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.chambre_id && <p className="text-sm text-red-600">{errors.chambre_id}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Section Période */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Période de réservation
                                    </CardTitle>
                                    <CardDescription>
                                        Arrivée et départ - La durée est calculée automatiquement
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="date_debut">Date d'arrivée *</Label>
                                            <Input
                                                id="date_debut"
                                                type="date"
                                                value={data.date_debut}
                                                onChange={(e) => setData('date_debut', e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                required
                                            />
                                            {errors.date_debut && <p className="text-sm text-red-600">{errors.date_debut}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="date_fin">Date de départ *</Label>
                                            <Input
                                                id="date_fin"
                                                type="date"
                                                value={data.date_fin}
                                                onChange={(e) => setData('date_fin', e.target.value)}
                                                min={data.date_debut || new Date().toISOString().split('T')[0]}
                                                required
                                            />
                                            {errors.date_fin && <p className="text-sm text-red-600">{errors.date_fin}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="heure_debut" className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                Heure d'arrivée *
                                            </Label>
                                            <Select 
                                                value={data.heure_debut} 
                                                onValueChange={(value) => setData('heure_debut', value)}
                                                required
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {timeOptions.map(time => (
                                                        <SelectItem key={time} value={time}>
                                                            {time}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.heure_debut && <p className="text-sm text-red-600">{errors.heure_debut}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="heure_fin" className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                Heure de départ *
                                            </Label>
                                            <Select 
                                                value={data.heure_fin} 
                                                onValueChange={(value) => setData('heure_fin', value)}
                                                required
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {timeOptions.map(time => (
                                                        <SelectItem key={time} value={time}>
                                                            {time}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.heure_fin && <p className="text-sm text-red-600">{errors.heure_fin}</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Section Statut */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Statut de la réservation</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Select 
                                            value={data.statut} 
                                            onValueChange={(value) => setData('statut', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="en_attente">En attente</SelectItem>
                                                <SelectItem value="confirmee">Confirmée</SelectItem>
                                                <SelectItem value="annulee">Annulée</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.statut && <p className="text-sm text-red-600">{errors.statut}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex gap-4">
                                <Button type="submit" disabled={processing} className="flex-1">
                                    {processing ? 'Création...' : 'Créer la réservation'}
                                </Button>
                                <Link href={route('reservations-chambres.index')} className="flex-1">
                                    <Button type="button" variant="outline" className="w-full">
                                        Annuler
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </div>

                    {/* Colonne de droite - Récapitulatif */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calculator className="h-5 w-5" />
                                    Récapitulatif
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {data.chambre_id && data.date_debut && data.date_fin && (
                                    <>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Durée:</span>
                                                <span className="font-medium">{duree}</span>
                                            </div>
                                            
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Prix par nuit:</span>
                                                <span className="font-medium">
                                                    {Dollar(chambres.find(c => c.id.toString() === data.chambre_id)?.prix || 0)}
                                                </span>
                                            </div>
                                            
                                            {data.heure_debut && data.heure_fin && (
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Horaires:</span>
                                                    <span className="font-medium text-sm">{data.heure_debut} - {data.heure_fin}</span>
                                                </div>
                                            )}
                                            
                                            <div className="border-t pt-2">
                                                <div className="flex justify-between">
                                                    <span className="font-semibold">Total:</span>
                                                    <span className="font-bold text-lg">
                                                        {Dollar(prixCalculé)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                                
                                {(!data.chambre_id || !data.date_debut || !data.date_fin) && (
                                    <p className="text-center text-muted-foreground py-4">
                                        Remplissez le formulaire pour voir le récapitulatif
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}