// resources/js/Pages/ReservationsChambres/Create.tsx
import { Auth, Chambre, Client, flash, Reservation, SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calculator, User, Bed, Clock, Calendar, Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { DateHeure, Dollar } from '@/hooks/Currencies';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { RecherchePopover } from '@/components/RecherchePopover';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Réservations Chambres', href: '/chambres-reservations' },
    { title: 'Nouvelle réservation', href: '#' },
];



export default function ReservationChambreCreate({ 
    auth, 
    chambres, 
    clients, 
    prefilledChambreId,
    reservations
}: { 
    auth: Auth;
    chambres: Chambre[];
    clients: Client[];
    prefilledChambreId?: number;
    reservations: Reservation[];
}) {
    // Récupérer les flash messages via usePage()
    const { flash } = usePage<{ flash: flash; auth: Auth }>().props;

    // Gérer les toast uniquement quand les messages flash changent
    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const { data, setData, errors, post, processing } = useForm({
        client_id: '',
        date_debut: '',
        date_fin: '',
        heure_debut: '08:00',
        heure_fin: '17:00',
        chambre_id: prefilledChambreId?.toString() || '',
        statut: 'en_attente',
        prix_total: 0
    });

    const [prixCalculé, setPrixCalculé] = useState<number>(0);
    const [duree, setDuree] = useState<string>('');
    const [chambresDisponibles, setChambresDisponibles] = useState<Chambre[]>([]);
    const [showReservations, setShowReservations] = useState<boolean>(false);

    // Fonction pour vérifier les conflits de réservation avec précision horaire
    const hasTimeConflict = (reservation: Reservation, debut: Date, fin: Date): boolean => {
        const resDebut = new Date(reservation.date_debut);
        const resFin = new Date(reservation.date_fin);

        // Vérifier si les périodes se chevauchent
        // Deux périodes ne se chevauchent pas si :
        // - La nouvelle réservation se termine avant le début de l'existante
        // - La nouvelle réservation commence après la fin de l'existante
        return !(fin <= resDebut || debut >= resFin);
    };

    // Filtrer les chambres disponibles basé sur les réservations existantes avec précision horaire
    useEffect(() => {
        console.log('Chambres reçues:', chambres);
        console.log('Réservations reçues:', reservations);
        console.log('Dates sélectionnées:', data.date_debut, data.date_fin);
        console.log('Heures sélectionnées:', data.heure_debut, data.heure_fin);

        if (!data.date_debut || !data.date_fin || !data.heure_debut || !data.heure_fin) {
            // Si pas de dates sélectionnées, montrer toutes les chambres disponibles
            const chambresDispo = chambres.filter(c => c.statut === 'disponible');
            console.log('Pas de dates - Chambres disponibles:', chambresDispo);
            setChambresDisponibles(chambresDispo);
            return;
        }

        // Validation : heure de fin doit être après heure de début pour la même date
        if (data.date_debut === data.date_fin && data.heure_debut >= data.heure_fin) {
            console.log('Heures invalides - heure_fin doit être après heure_debut');
            setChambresDisponibles([]);
            return;
        }

        // Combiner date et heure pour la vérification
        const dateDebutComplete = `${data.date_debut}T${data.heure_debut}`;
        const dateFinComplete = `${data.date_fin}T${data.heure_fin}`;
        
        const debut = new Date(dateDebutComplete);
        const fin = new Date(dateFinComplete);

        console.log('Période sélectionnée:', debut, 'à', fin);

        // Si aucune réservation n'existe, toutes les chambres disponibles sont... disponibles !
        if (reservations.length === 0) {
            const chambresDispo = chambres.filter(chambre => chambre.statut === 'disponible');
            console.log('Aucune réservation - Toutes les chambres disponibles:', chambresDispo);
            setChambresDisponibles(chambresDispo);
            return;
        }

        // Filtrer les chambres qui ne sont pas réservées pendant cette période précise
        const chambresDispo = chambres.filter(chambre => {
            // Vérifier si la chambre est disponible
            if (chambre.statut !== 'disponible') {
                console.log(`Chambre ${chambre.numero} non disponible - statut: ${chambre.statut}`);
                return false;
            }

            // Vérifier les réservations existantes pour cette chambre (non annulées)
            const reservationsChambre = reservations.filter(res => 
                res.chambre_id === chambre.id && 
                res.statut !== 'annulee'
            );

            console.log(`Réservations pour chambre ${chambre.numero}:`, reservationsChambre);

            // Si aucune réservation pour cette chambre, elle est disponible
            if (reservationsChambre.length === 0) {
                console.log(`Chambre ${chambre.numero} disponible - aucune réservation`);
                return true;
            }

            // Vérifier les conflits de réservation avec précision horaire
            const hasConflict = reservationsChambre.some(reservation => {
                const conflict = hasTimeConflict(reservation, debut, fin);
                if (conflict) {
                    console.log(`Conflit détecté pour chambre ${chambre.numero} avec réservation:`, reservation);
                }
                return conflict;
            });

            console.log(`Chambre ${chambre.numero} - Conflit:`, hasConflict);
            return !hasConflict;
        });

        console.log('Chambres disponibles finales:', chambresDispo);
        setChambresDisponibles(chambresDispo);
    }, [data.date_debut, data.date_fin, data.heure_debut, data.heure_fin, chambres, reservations]);

    // Calcul automatique du prix
    useEffect(() => {
        if (data.date_debut && data.date_fin && data.chambre_id) {
            const chambre = chambres.find(c => c.id.toString() === data.chambre_id);
            if (chambre) {
                const debut = new Date(`${data.date_debut}T${data.heure_debut}`);
                const fin = new Date(`${data.date_fin}T${data.heure_fin}`);
                
                const diffTime = fin.getTime() - debut.getTime();
                let nuits = Math.ceil(diffTime / (1000 * 3600 * 24));
                
                // Pour les réservations intra-journée, compter au moins 1 nuit
                if (data.date_debut === data.date_fin && diffTime > 0) {
                    nuits = 1;
                }
                
                nuits = Math.max(1, nuits);
                
                setDuree(`${nuits} nuit(s)`);
                setPrixCalculé(nuits * chambre.prix);
                setData('prix_total', nuits * chambre.prix);
            }
        } else {
            setDuree('');
            setPrixCalculé(0);
            setData('prix_total', 0);
        }
    }, [data.date_debut, data.date_fin, data.heure_debut, data.heure_fin, data.chambre_id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation manuelle pour les heures sur la même journée
        if (data.date_debut === data.date_fin && data.heure_debut >= data.heure_fin) {
            toast.error('L\'heure de départ doit être postérieure à l\'heure d\'arrivée.');
            return;
        }

        // Vérifier si la chambre est toujours disponible
        const chambreSelectionnee = chambresDisponibles.find(c => c.id.toString() === data.chambre_id);
        if (!chambreSelectionnee) {
            toast.error('La chambre sélectionnée n\'est plus disponible pour cette période. Veuillez choisir une autre chambre.');
            return;
        }
        
        post(route('chambres-reservations.store'));
    };

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
            <Head title="Nouvelle réservation de chambre" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-6">
                <div className="flex items-center gap-4">
                    <Link href={route('chambres.index')}>
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
                                                                        <RecherchePopover
                                                                            options={clients.map(client => ({
                                                                            value: client.id.toString(),
                                                                            label: `${client.name} - ${client.email} - ${client.telephone?client.telephone : ''}`, // ou client.telephone si disponible
                                                                            // Vous pouvez ajouter d'autres données si nécessaire
                                                                            originalData: client
                                                                            }))}
                                                                            placeholder="Sélectionner un client"
                                                                            searchPlaceholder="Rechercher un client..."
                                                                            emptyMessage="Aucun client trouvé."
                                                                            value={data.client_id}
                                                                            onValueChange={(value) => setData('client_id', value)}
                                                                            className="w-full" // Pour prendre toute la largeur
                                                                        />
                                                                        {errors.client_id && <p className="text-sm text-red-600">{errors.client_id}</p>}
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
                                        Arrivée et départ - Réservations flexibles par créneaux horaires
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

                                    {data.date_debut === data.date_fin && (
                                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                            <p className="text-sm text-blue-800">
                                                💡 <strong>Réservation intra-journée</strong> - La chambre sera disponible pour d'autres créneaux le même jour
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Section Chambre */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bed className="h-5 w-5" />
                                        Choix de la chambre
                                    </CardTitle>
                                    <CardDescription>
                                        {data.date_debut && data.date_fin 
                                            ? `${chambresDisponibles.length} chambre(s) disponible(s) pour ce créneau`
                                            : 'Sélectionnez une période pour voir les chambres disponibles'
                                        }
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="chambre_id">Chambre *</Label>
                                        <Select 
                                            value={data.chambre_id} 
                                            onValueChange={(value) => setData('chambre_id', value)}
                                            required
                                            disabled={!data.date_debut || !data.date_fin}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={
                                                    !data.date_debut || !data.date_fin 
                                                        ? "Sélectionnez d'abord une période" 
                                                        : "Sélectionner une chambre"
                                                } />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {chambresDisponibles.map(chambre => (
                                                    <SelectItem key={chambre.id} value={chambre.id.toString()}>
                                                        Chambre {chambre.numero} - {chambre.type} - {Dollar(chambre.prix)}/nuit
                                                        {chambre.capacite && ` - ${chambre.capacite} pers.`}
                                                    </SelectItem>
                                                ))}
                                                {chambresDisponibles.length === 0 && data.date_debut && data.date_fin && (
                                                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                                        Aucune chambre disponible pour ce créneau
                                                    </div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {errors.chambre_id && <p className="text-sm text-red-600">{errors.chambre_id}</p>}
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
                                <Button 
                                    type="submit" 
                                    disabled={processing || chambresDisponibles.length === 0} 
                                    className="flex-1"
                                >
                                    {processing ? 'Création...' : 'Créer la réservation'}
                                </Button>
                                <Link href={route('chambres.index')} className="flex-1">
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
                                
                                {(!data.chambre_id || !data.date_debut || !data.date_fin) && (
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
                                        <span>Chambres totales:</span>
                                        <span>{chambres.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Statut "disponible":</span>
                                        <span>{chambres.filter(c => c.statut === 'disponible').length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Disponibles pour ce créneau:</span>
                                        <span className={chambresDisponibles.length > 0 ? "text-green-600 font-medium" : "text-red-600"}>
                                            {chambresDisponibles.length}
                                        </span>
                                    </div>
                                    {data.date_debut && data.date_fin && chambresDisponibles.length === 0 && (
                                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                            <p className="text-red-700 text-xs">
                                                {data.heure_debut >= data.heure_fin && data.date_debut === data.date_fin
                                                    ? "L'heure de fin doit être après l'heure de début"
                                                    : "Aucune chambre disponible pour le créneau sélectionné"
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
                                        <Calendar className="h-5 w-5" />
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
                                        {reservations.map((reservation) => (
                                            <div key={reservation.id} className="border rounded-lg p-3 text-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="font-medium">
                                                        Chambre {reservation.chambre?.numero}
                                                    </div>
                                                    {getStatusBadge(reservation.statut)}
                                                </div>
                                                <div className="space-y-1 text-xs text-muted-foreground">
                                                    <div>Arrivée: {DateHeure(reservation.date_debut)}</div>
                                                    <div>Départ: {DateHeure(reservation.date_fin)}</div>
                                                    <div>Prix: {Dollar(reservation.prix_total)}</div>
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