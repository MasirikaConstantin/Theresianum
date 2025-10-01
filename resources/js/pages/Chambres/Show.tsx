import { Auth, Chambre, Occupation, SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Bed, Calendar, User, Clock, DollarSign, Wifi, Tv, Snowflake, Coffee, ShowerHead } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { DateHeure, Dollar, FrancCongolais } from '@/hooks/Currencies';
import AppLayout from '@/layouts/app-layout';

interface PageProps {
    auth: Auth;
    chambre: Chambre;
    occupations: Occupation[];
}

const breadcrumbs = (chambre: Chambre): BreadcrumbItem[] => [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Chambres',
        href: '/chambres',
    },
    {
        title: `Chambre ${chambre.numero}`,
        href: '#',
    },
];

export default function ChambreShow({ auth, chambre, occupations }: PageProps) {
    const { flash } = usePage<SharedData>().props;

    flash.error && toast.error(flash.error);
    flash.success && toast.success(flash.success);

    const handleDelete = () => {
        router.delete(route('chambres.destroy', chambre.id));
    };

    const getStatutBadgeVariant = (statut: string) => {
        switch (statut) {
            case 'disponible': return 'default';
            case 'occupee': return 'destructive';
            case 'nettoyage': return 'secondary';
            case 'maintenance': return 'outline';
            default: return 'secondary';
        }
    };

    const getTypeBadgeVariant = (type: string) => {
        switch (type) {
            case 'suite': return 'default';
            case 'double': return 'secondary';
            case 'familiale': return 'outline';
            default: return 'secondary';
        }
    };

    const getReservationStatutBadge = (statut: string) => {
        switch (statut) {
            case 'confirmee': return 'default';
            case 'en_attente': return 'secondary';
            case 'annulee': return 'destructive';
            case 'terminee': return 'outline';
            default: return 'secondary';
        }
    };

    const getOccupationStatutBadge = (statut: string) => {
        switch (statut) {
            case 'occupee': return 'destructive';
            case 'liberee': return 'default';
            default: return 'secondary';
        }
    };

    const getEquipementIcon = (equipement: string) => {
        if (!equipement) return <span className="text-muted-foreground">Aucun équipement spécifique</span>;
        
        const equipements = equipement.toLowerCase().split(',').map(e => e.trim());
        
        const icons = [];
        if (equipements.some(e => e.includes('wifi') || e.includes('internet'))) {
            icons.push(<Wifi key="wifi" className="h-4 w-4" />);
        }
        if (equipements.some(e => e.includes('tv') || e.includes('télévision'))) {
            icons.push(<Tv key="tv" className="h-4 w-4" />);
        }
        if (equipements.some(e => e.includes('climatisation') || e.includes('air conditionné'))) {
            icons.push(<Snowflake key="ac" className="h-4 w-4" />);
        }
        if (equipements.some(e => e.includes('mini-bar') || e.includes('bar'))) {
            icons.push(<Coffee key="minibar" className="h-4 w-4" />);
        }
        if (equipements.some(e => e.includes('douche') || e.includes('salle de bain'))) {
            icons.push(<ShowerHead key="shower" className="h-4 w-4" />);
        }

        return icons.length > 0 ? icons : <span className="text-muted-foreground">Aucun équipement spécifique</span>;
    };

    const reservationsActives = chambre.reservations.filter(r => 
        ['confirmee', 'en_attente'].includes(r.statut)
    );

    const reservationsPassees = chambre.reservations.filter(r => 
        ['terminee', 'annulee'].includes(r.statut)
    );

    // Calculer le nombre total de jours d'occupation
    const totalJoursOccupation = occupations.length;

    const canUpdate = auth.user.role === 'admin';
    const canDelete = auth.user.role === 'admin';

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs(chambre)}>
            <Head title={`Chambre ${chambre.numero}`} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('chambres.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Retour aux chambres
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Bed className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">
                                    Chambre {chambre.numero}
                                </h1>
                                <p className="text-muted-foreground">
                                    Dernière mise à jour: {format(new Date(chambre.updated_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <Link href={route('reservations.create', { chambre_id: chambre.id })}>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Nouvelle réservation
                            </Button>
                        </Link>
                        {canUpdate && (
                            <Link href={route('chambres.edit', chambre.ref)}>
                                <Button variant="outline">
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Modifier
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Grid principal */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Colonne de gauche - Informations générales */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Carte informations principales */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations de la chambre</CardTitle>
                                <CardDescription>
                                    Détails complets de la configuration de la chambre
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Numéro
                                        </label>
                                        <p className="text-lg font-mono font-bold">{chambre.numero}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Nom
                                        </label>
                                        <p className="text-lg font-mono font-bold">{chambre.nom}</p>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Type
                                        </label>
                                        <div>
                                            <Badge variant={getTypeBadgeVariant(chambre.type)}>
                                                {chambre.type.toUpperCase()}
                                            </Badge>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Prix
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-green-600" />
                                            <span className="text-lg font-semibold">
                                                {Dollar(chambre.prix)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Capacité
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-blue-600" />
                                            <span className="text-lg font-semibold">
                                                {chambre.capacite} personne(s)
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Statut actuel
                                        </label>
                                        <div>
                                            <Badge variant={getStatutBadgeVariant(chambre.statut)}>
                                                {chambre.statut.toUpperCase()}
                                            </Badge>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Date de création
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-orange-600" />
                                            <span>
                                                {format(new Date(chambre.created_at), 'dd MMMM yyyy', { locale: fr })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Équipements
                                    </label>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        {getEquipementIcon(chambre.equipements)}
                                    </div>
                                    {chambre.equipements && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                            {chambre.equipements}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Réservations actives */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Réservations actives
                                </CardTitle>
                                <CardDescription>
                                    {reservationsActives.length} réservation(s) en cours ou à venir
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {reservationsActives.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Client</TableHead>
                                                <TableHead>Période</TableHead>
                                                <TableHead>Durée</TableHead>
                                                <TableHead>Montant</TableHead>
                                                <TableHead>Statut</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {reservationsActives.map((reservation) => {
                                                const dateDebut = new Date(reservation.date_debut);
                                                const dateFin = new Date(reservation.date_fin);
                                                const duree = Math.ceil((dateFin.getTime() - dateDebut.getTime()) / (1000 * 3600 * 24));
                                                
                                                return (
                                                    <TableRow key={reservation.id}>
                                                        <TableCell>
                                                            <div>
                                                                <p className="font-medium">
                                                                    {reservation.client.name}
                                                                </p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {reservation.client.telephone}
                                                                </p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {DateHeure(reservation.date_debut)}
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    {DateHeure(reservation.date_fin)}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">
                                                                {duree} nuit(s)
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="font-semibold">
                                                            {Dollar(reservation.prix_total)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={getReservationStatutBadge(reservation.statut)}>
                                                                {reservation.statut==="confirmee" ? "Confirmée" : reservation.statut==="en_attente" ? "En attente" : reservation.statut==="annulee" ? "Annulée" : "Terminée"}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-8">
                                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">
                                            Aucune réservation active pour cette chambre
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Colonne de droite - Statistiques et actions */}
                    <div className="space-y-6">
                        {/* Carte statistiques */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Statistiques</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <p className="text-2xl font-bold text-blue-600">
                                            {chambre.reservations.length}
                                        </p>
                                        <p className="text-sm text-blue-600">Total réservations</p>
                                    </div>
                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                        <p className="text-2xl font-bold text-green-600">
                                            {reservationsActives.length}
                                        </p>
                                        <p className="text-sm text-green-600">Réservations actives</p>
                                    </div>
                                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                                        <p className="text-2xl font-bold text-orange-600">
                                            {reservationsPassees.length}
                                        </p>
                                        <p className="text-sm text-orange-600">Réservations passées</p>
                                    </div>
                                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                                        <p className="text-2xl font-bold text-purple-600">
                                            {totalJoursOccupation}
                                        </p>
                                        <p className="text-sm text-purple-600">Jours occupés</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Carte occupation récente */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Occupation récente</CardTitle>
                                <CardDescription>
                                    7 derniers jours
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {occupations.slice(0, 7).map((occupation) => (
                                        <div key={occupation.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                                            <span className="text-sm">
                                                {format(new Date(occupation.date_occupation), 'EEEE dd/MM', { locale: fr })}
                                            </span>
                                            <Badge variant={getOccupationStatutBadge(occupation.statut)}>
                                                {occupation.statut}
                                            </Badge>
                                        </div>
                                    ))}
                                    {occupations.length === 0 && (
                                        <p className="text-center text-muted-foreground py-4">
                                            Aucune occupation enregistrée
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Carte actions rapides */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions rapides</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Link href={route('reservations.create', { chambre_id: chambre.id })} className="w-full mb-2">
                                    <Button variant="outline" className="w-full justify-start mb-2">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Nouvelle réservation
                                    </Button>
                                </Link>
                                
                                {canUpdate && (
                                    <Link href={route('chambres.edit', chambre.ref)} className="w-full mt-2">
                                        <Button variant="outline" className="w-full justify-start mb-2">
                                            <Pencil className="h-4 w-4 mr-2" />
                                            Modifier la chambre
                                        </Button>
                                    </Link>
                                )}

                                {canDelete && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" className="w-full justify-start">
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Supprimer la chambre
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Supprimer la chambre {chambre.numero} ?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Cette action est irréversible. La chambre et toutes ses réservations associées seront définitivement supprimées.
                                                    {reservationsActives.length > 0 && (
                                                        <span className="block mt-2 text-red-600 font-semibold">
                                                            Attention: {reservationsActives.length} réservation(s) active(s) seront également supprimées.
                                                        </span>
                                                    )}
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleDelete}>
                                                    Supprimer définitivement
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}