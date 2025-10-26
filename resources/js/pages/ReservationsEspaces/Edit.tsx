import { Auth, Client, type BreadcrumbItem, Reservation, flash } from '@/types';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calculator, User, Calendar as CalendarIcon, Clock, Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { DateHeure, Dollar } from '@/hooks/Currencies';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Réservations', href: '/reservations' },
    { title: 'Éditer la réservation', href: '#' },
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


export default function ReservationEdit({ 
    auth, 
    salles, 
    clients, 
    vocations,
    reservations,
    reservation,
    flash
}: { 
    auth: Auth;
    salles: Salle[];
    clients: Client[];
    vocations: string[];
    reservations: Reservation[];
    reservation: Reservation;
    flash: flash;
}) {
    // Gérer les toast uniquement quand les messages flash changent
    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Extraire la date et l'heure de la réservation existante
    const dateDebut = new Date(reservation.date_debut);
    const dateFin = new Date(reservation.date_fin);
    
    const formattedDateDebut = dateDebut.toISOString().split('T')[0];
    const formattedDateFin = dateFin.toISOString().split('T')[0];
    const formattedHeureDebut = dateDebut.toTimeString().slice(0, 5);
    const formattedHeureFin = dateFin.toTimeString().slice(0, 5);

    const { data, setData, errors, put, processing } = useForm({
        client_id: reservation.client_id?.toString() || '',
        date_debut: formattedDateDebut,
        date_fin: formattedDateFin,
        heure_debut: formattedHeureDebut,
        heure_fin: formattedHeureFin,
        salle_id: reservation.salle_id?.toString() || '',
        vocation: reservation.vocation || 'journee',
        statut: reservation.statut || 'en_attente',
        prix_total: reservation.prix_total || 0
    });

    const [prixCalculé, setPrixCalculé] = useState<number>(reservation.prix_total || 0);
    const [duree, setDuree] = useState<string>('');
    const [sallesDisponibles, setSallesDisponibles] = useState<Salle[]>([]);
    const [showReservations, setShowReservations] = useState<boolean>(false);

    // Fonction pour vérifier les conflits de réservation avec précision horaire (en excluant la réservation actuelle)
    const hasTimeConflict = (reservationItem: Reservation, debut: Date, fin: Date, excludeId: number): boolean => {
        // Ne pas vérifier la réservation en cours d'édition
        if (reservationItem.id === excludeId) {
            return false;
        }

        const resDebut = new Date(reservationItem.date_debut);
        const resFin = new Date(reservationItem.date_fin);

        // Vérifier si les périodes se chevauchent
        return !(fin <= resDebut || debut >= resFin);
    };

    // Filtrer les salles disponibles basé sur les réservations existantes avec précision horaire
    useEffect(() => {
        console.log('Salles reçues:', salles);
        console.log('Réservations reçues:', reservations);
        console.log('Réservation en édition:', reservation);
        console.log('Dates sélectionnées:', data.date_debut, data.date_fin);
        console.log('Heures sélectionnées:', data.heure_debut, data.heure_fin);

        if (!data.date_debut || !data.date_fin || !data.heure_debut || !data.heure_fin) {
            // Si pas de dates sélectionnées, montrer toutes les salles disponibles
            const sallesDispo = salles.filter(s => s.disponible);
            console.log('Pas de dates - Salles disponibles:', sallesDispo);
            setSallesDisponibles(sallesDispo);
            return;
        }

        // Validation : heure de fin doit être après heure de début pour la même date
        if (data.date_debut === data.date_fin && data.heure_debut >= data.heure_fin) {
            console.log('Heures invalides - heure_fin doit être après heure_debut');
            setSallesDisponibles([]);
            return;
        }

        // Combiner date et heure pour la vérification
        const dateDebutComplete = `${data.date_debut}T${data.heure_debut}`;
        const dateFinComplete = `${data.date_fin}T${data.heure_fin}`;
        
        const debut = new Date(dateDebutComplete);
        const fin = new Date(dateFinComplete);

        console.log('Période sélectionnée:', debut, 'à', fin);

        // Si aucune réservation n'existe (à part celle en cours d'édition), toutes les salles disponibles sont... disponibles !
        const autresReservations = reservations.filter(res => res.id !== reservation.id);
        if (autresReservations.length === 0) {
            const sallesDispo = salles.filter(salle => salle.disponible);
            console.log('Aucune autre réservation - Toutes les salles disponibles:', sallesDispo);
            setSallesDisponibles(sallesDispo);
            return;
        }

        // Filtrer les salles qui ne sont pas réservées pendant cette période précise
        const sallesDispo = salles.filter(salle => {
            // Vérifier si la salle est disponible
            if (!salle.disponible) {
                console.log(`Salle ${salle.nom} non disponible`);
                return false;
            }

            // Vérifier les réservations existantes pour cette salle (non annulées)
            const reservationsSalle = autresReservations.filter(res => 
                res.salle_id === salle.id && 
                res.statut !== 'annulee'
            );

            console.log(`Réservations pour salle ${salle.nom}:`, reservationsSalle);

            // Si aucune réservation pour cette salle, elle est disponible
            if (reservationsSalle.length === 0) {
                console.log(`Salle ${salle.nom} disponible - aucune réservation`);
                return true;
            }

            // Vérifier les conflits de réservation avec précision horaire (en excluant la réservation actuelle)
            const hasConflict = reservationsSalle.some(reservationItem => {
                const conflict = hasTimeConflict(reservationItem, debut, fin, reservation.id);
                if (conflict) {
                    console.log(`Conflit détecté pour salle ${salle.nom} avec réservation:`, reservationItem);
                }
                return conflict;
            });

            console.log(`Salle ${salle.nom} - Conflit:`, hasConflict);
            return !hasConflict;
        });

        console.log('Salles disponibles finales:', sallesDispo);
        setSallesDisponibles(sallesDispo);
    }, [data.date_debut, data.date_fin, data.heure_debut, data.heure_fin, salles, reservations, reservation.id]);

    // Calcul automatique du prix
    useEffect(() => {
        if (data.date_debut && data.date_fin && data.salle_id && data.vocation) {
            const salle = salles.find(s => s.id.toString() === data.salle_id);
            if (salle) {
                const debut = new Date(`${data.date_debut}T${data.heure_debut}`);
                const fin = new Date(`${data.date_fin}T${data.heure_fin}`);
                
                // Calcul précis en prenant en compte les heures
                const diffTime = fin.getTime() - debut.getTime();
                let jours = Math.ceil(diffTime / (1000 * 3600 * 24));
                
                // Pour les réservations intra-journée, compter au moins 1 jour
                if (data.date_debut === data.date_fin && diffTime > 0) {
                    jours = 1;
                }
                
                jours = Math.max(1, jours);
                
                const prixParJour = data.vocation === 'journee' ? salle.prix_journee : salle.prix_nuit;
                
                setDuree(`${jours} jour(s)`);
                setPrixCalculé(jours * prixParJour);
                setData('prix_total', jours * prixParJour);
            }
        } else {
            setDuree('');
            setPrixCalculé(0);
            setData('prix_total', 0);
        }
    }, [data.date_debut, data.date_fin, data.salle_id, data.vocation, data.heure_debut, data.heure_fin]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation manuelle pour les heures sur la même journée
        if (data.date_debut === data.date_fin && data.heure_debut >= data.heure_fin) {
            toast.error('L\'heure de fin doit être postérieure à l\'heure de début.');
            return;
        }

        // Vérifier si la salle est toujours disponible
        const salleSelectionnee = sallesDisponibles.find(s => s.id.toString() === data.salle_id);
        if (!salleSelectionnee && data.salle_id !== reservation.salle_id?.toString()) {
            toast.error('La salle sélectionnée n\'est plus disponible pour cette période. Veuillez choisir une autre salle.');
            return;
        }
        
        put(route('reservations.update', reservation.id));
    };

    const getVocationLabel = (vocation: string) => {
        switch (vocation) {
            case 'journee': return 'Journée';
            case 'nuit': return 'Nuit';
            default: return vocation;
        }
    };

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

    // Formater la date pour l'affichage
    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    // Obtenir la couleur du badge selon le statut
    const getStatusBadge = (statut: string) => {
        const statusConfig = {
            'en_attente': { label: 'En attente', variant: 'secondary' as const },
            'confirmee': { label: 'Confirmée', variant: 'default' as const },
            'annulee': { label: 'Annulée', variant: 'destructive' as const },
            'terminee': { label: 'Terminée', variant: 'outline' as const }
        };
        
        const config = statusConfig[statut as keyof typeof statusConfig] || { label: statut, variant: 'secondary' as const };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Éditer la réservation de salle" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-6">
                <div className="flex items-center gap-4">
                    <Link href={route('reservations.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Éditer la réservation de salle</h1>
                        <p className="text-sm text-muted-foreground">
                            Référence: {reservation.ref}
                        </p>
                    </div>
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

                            {/* Section Période */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CalendarIcon className="h-5 w-5" />
                                        Période de réservation
                                    </CardTitle>
                                    <CardDescription>
                                        Arrivée et départ - Réservations flexibles par créneaux horaires
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

                                    {data.date_debut === data.date_fin && (
                                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                            <p className="text-sm text-blue-800">
                                                💡 <strong>Réservation intra-journée</strong> - La salle sera disponible pour d'autres créneaux le même jour
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Section Salle */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CalendarIcon className="h-5 w-5" />
                                        Choix de la salle
                                    </CardTitle>
                                    <CardDescription>
                                        {data.date_debut && data.date_fin 
                                            ? `${sallesDisponibles.length} salle(s) disponible(s) pour ce créneau`
                                            : 'Sélectionnez une période pour voir les salles disponibles'
                                        }
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="salle_id">Salle *</Label>
                                        <Select 
                                            value={data.salle_id} 
                                            onValueChange={(value) => setData('salle_id', value)}
                                            required
                                            disabled={!data.date_debut || !data.date_fin}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={
                                                    !data.date_debut || !data.date_fin 
                                                        ? "Sélectionnez d'abord une période" 
                                                        : "Sélectionner une salle"
                                                } />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sallesDisponibles.map(salle => (
                                                    <SelectItem key={salle.id} value={salle.id.toString()}>
                                                        {salle.nom} - {salle.capacite_max} pers. - 
                                                        Jour: {Dollar(salle.prix_journee)} / 
                                                        Nuit: {Dollar(salle.prix_nuit)}
                                                    </SelectItem>
                                                ))}
                                                {sallesDisponibles.length === 0 && data.date_debut && data.date_fin && (
                                                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                                        Aucune salle disponible pour ce créneau
                                                    </div>
                                                )}
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
                                                <SelectItem value="terminee">Terminée</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.statut && <p className="text-sm text-red-600">{errors.statut}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex gap-4">
                                <Button 
                                    type="submit" 
                                    disabled={processing || sallesDisponibles.length === 0} 
                                    className="flex-1"
                                >
                                    {processing ? 'Mise à jour...' : 'Mettre à jour la réservation'}
                                </Button>
                                <Link href={route('reservations.index')} className="flex-1">
                                    <Button type="button" variant="outline" className="w-full">
                                        Annuler
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </div>

                    {/* Colonne de droite - Récapitulatif et Réservations */}
                    <div className="space-y-6">
                        {/* Récapitulatif */}
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
                                                    <span className="text-sm text-muted-foreground">Créneau:</span>
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
                                
                                {(!data.salle_id || !data.date_debut || !data.date_fin) && (
                                    <p className="text-center text-muted-foreground py-4">
                                        Remplissez le formulaire pour voir le récapitulatif
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Information sur les disponibilités */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Disponibilité</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Salles totales:</span>
                                        <span>{salles.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Statut "disponible":</span>
                                        <span>{salles.filter(s => s.disponible).length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Disponibles pour ce créneau:</span>
                                        <span className={sallesDisponibles.length > 0 ? "text-green-600 font-medium" : "text-red-600"}>
                                            {sallesDisponibles.length}
                                        </span>
                                    </div>
                                    {data.date_debut && data.date_fin && sallesDisponibles.length === 0 && (
                                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                            <p className="text-red-700 text-xs">
                                                {data.heure_debut >= data.heure_fin && data.date_debut === data.date_fin
                                                    ? "L'heure de fin doit être après l'heure de début"
                                                    : "Aucune salle disponible pour le créneau sélectionné"
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Liste des réservations existantes */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="h-5 w-5" />
                                        Réservations existantes
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowReservations(!showReservations)}
                                    >
                                        {showReservations ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </CardTitle>
                                <CardDescription>
                                    {reservations.length} réservation(s) à venir
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {showReservations ? (
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {reservations.map((reservationItem) => (
                                            <div 
                                                key={reservationItem.id} 
                                                className={`border rounded-lg p-3 text-sm ${
                                                    reservationItem.id === reservation.id 
                                                        ? 'border-blue-500' 
                                                        : ''
                                                }`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="font-medium">
                                                        {reservationItem.salle?.nom || 'Salle inconnue'}
                                                        {reservationItem.id === reservation.id && (
                                                            <span className="ml-2 text-blue-600 text-xs">(En cours d'édition)</span>
                                                        )}
                                                    </div>
                                                    {getStatusBadge(reservationItem.statut)}
                                                </div>
                                                <div className="space-y-1 text-xs text-muted-foreground">
                                                    <div>Arrivée: {DateHeure(reservationItem.date_debut)}</div>
                                                    <div>Départ: {DateHeure(reservationItem.date_fin)}</div>
                                                    <div>Prix: {Dollar(reservationItem.prix_total)}</div>
                                                </div>
                                            </div>
                                        ))}
                                        {reservations.length === 0 && (
                                            <p className="text-center text-muted-foreground py-4">
                                                Aucune réservation à venir
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowReservations(true)}
                                            className="flex items-center gap-2"
                                        >
                                            <Eye className="h-4 w-4" />
                                            Voir les réservations
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}