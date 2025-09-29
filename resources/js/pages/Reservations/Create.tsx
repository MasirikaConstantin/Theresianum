// resources/js/Pages/Reservations/Create.tsx
import { Auth, Client, SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calculator, User, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Dollar } from '@/hooks/Currencies';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Réservations', href: '/reservations' },
    { title: 'Nouvelle réservation', href: '#' },
];

interface Salle {
    id: number;
    nom: string;
    capacite_max: number;
    vocation: string;
    prix_journee: number;
    prix_nuit: number;
    disponible: boolean;
}

export default function ReservationCreate({ 
    auth, 
    salles, 
    clients, 
    prefilledSalleId,
    vocations 
}: { 
    auth: Auth;
    salles: Salle[];
    clients: Client[];
    prefilledSalleId?: number;
    vocations: string[];
}) {
    const { data, setData, errors, post, processing } = useForm({
        client_id: '',
        date_debut: '',
        date_fin: '',
        heure_debut: '08:00',
        heure_fin: '18:00',
        salle_id: prefilledSalleId?.toString() || '',
        vocation: 'journee',
        statut: 'en_attente',
        prix_total: 0
    });

    const [prixCalculé, setPrixCalculé] = useState<number>(0);
    const [duree, setDuree] = useState<string>('');

    // Calcul automatique du prix
    useEffect(() => {
        if (data.date_debut && data.date_fin && data.salle_id) {
        const salle = salles.find(s => s.id.toString() === data.salle_id);
        if (salle) {
            const debut = new Date(data.date_debut);
            const fin = new Date(data.date_fin);
            
            // Correction du calcul des jours
            const diffTime = fin.getTime() - debut.getTime();
            const jours = Math.ceil(diffTime / (1000 * 3600 * 24)) + 1; // +1 pour inclure le jour de début
            
            const prixParJour = data.vocation === 'journee' ? salle.prix_journee : salle.prix_nuit;
            
            setDuree(`${jours} jour(s)`);
            setPrixCalculé(jours * prixParJour);
            setData('prix_total', jours * prixParJour);
        }
    }
}, [data.date_debut, data.date_fin, data.salle_id, data.vocation]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation manuelle pour les heures sur la même journée
        if (data.date_debut === data.date_fin && data.heure_debut >= data.heure_fin) {
            alert('L\'heure de fin doit être postérieure à l\'heure de début pour une réservation sur la même journée.');
            return;
        }
        
        // Debug: vérifier les données envoyées
        console.log('Données envoyées:', {
            ...data,
            date_debut_complete: `${data.date_debut} ${data.heure_debut}`,
            date_fin_complete: `${data.date_fin} ${data.heure_fin}`
        });
        
        post(route('reservations.store'));
    };

    const getVocationLabel = (vocation: string) => {
        switch (vocation) {
            case 'journee': return 'Journée';
            case 'nuit': return 'Nuit';
            default: return vocation;
        }
    };

    const sallesDisponibles = salles.filter(s => s.disponible);

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
            <Head title="Nouvelle réservation de salle" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-6">
                <div className="flex items-center gap-4">
                    <Link href={route('reservations.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">Nouvelle réservation de salle</h1>
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

                            {/* Section Salle */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CalendarIcon className="h-5 w-5" />
                                        Choix de la salle
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="salle_id">Salle *</Label>
                                        <Select 
                                            value={data.salle_id} 
                                            onValueChange={(value) => setData('salle_id', value)}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner une salle" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sallesDisponibles.map(salle => (
                                                    <SelectItem key={salle.id} value={salle.id.toString()}>
                                                        {salle.nom} - {salle.capacite_max} pers. - 
                                                        Jour: {Dollar(salle.prix_journee)} / 
                                                        Nuit: {Dollar(salle.prix_nuit)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.salle_id && <p className="text-sm text-red-600">{errors.salle_id}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="vocation">Vocation *</Label>
                                        <Select 
                                            value={data.vocation} 
                                            onValueChange={(value) => setData('vocation', value)}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {vocations.map(vocation => (
                                                    <SelectItem key={vocation} value={vocation}>
                                                        {getVocationLabel(vocation)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.vocation && <p className="text-sm text-red-600">{errors.vocation}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Section Période */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CalendarIcon className="h-5 w-5" />
                                        Période de réservation
                                    </CardTitle>
                                    <CardDescription>
                                        Vous pouvez réserver pour la même journée ou plusieurs jours
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="date_debut">Date de début *</Label>
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
                                            <Label htmlFor="date_fin">Date de fin *</Label>
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
                                                Heure de début *
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
                                                Heure de fin *
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
                                <Link href={route('reservations.index')} className="flex-1">
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
                                {data.salle_id && data.date_debut && data.date_fin && (
                                    <>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Durée:</span>
                                                <span className="font-medium">{duree}</span>
                                            </div>
                                            
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Vocation:</span>
                                                <span className="font-medium">{getVocationLabel(data.vocation)}</span>
                                            </div>
                                            
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Prix par {data.vocation}:</span>
                                                <span className="font-medium">
                                                    {Dollar(
                                                        data.vocation === 'journee' 
                                                            ? salles.find(s => s.id.toString() === data.salle_id)?.prix_journee || 0
                                                            : salles.find(s => s.id.toString() === data.salle_id)?.prix_nuit || 0
                                                    )}
                                                </span>
                                            </div>
                                            
                                            {data.heure_debut && data.heure_fin && (
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Horaire:</span>
                                                    <span className="font-medium">{data.heure_debut} - {data.heure_fin}</span>
                                                </div>
                                            )}
                                            
                                            <div className="bg-yellow-50 p-3 rounded-lg">
                                                <p className="text-sm text-yellow-800">
                                                    💡 <strong>Tarification fixe:</strong> Le prix est forfaitaire par journée, 
                                                    peu importe le nombre d'heures utilisées.
                                                </p>
                                            </div>
                                            
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
                                
                                {(!data.salle_id || !data.date_debut || !data.date_fin) && (
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