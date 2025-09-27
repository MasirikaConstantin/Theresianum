import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Building, Check, X, CalendarCheck, CalendarX, Clock1 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Label } from '@radix-ui/react-label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Auth } from '@/types';

interface Client {
    id: number;
    name: string;
}

interface Service {
    id: number;
    name: string;
    prix: number;
}

interface RendezvouService {
    service_id: number;
    prix_effectif: number;
    notes?: string;
    service: Service;
    user: {
        name: string;
    };
}

interface Rendezvou {
    id: number;
    ref: string;
    client_id: number | null;
    client: Client | null;
    succursale: {
        nom: string;
    };
    date_heure: string;
    duree_prevue: number;
    statut: 'confirmé' | 'annulé' | 'terminé' | 'no-show' | 'en_attente';
    notes?: string;
    services: Service[];
    
}

interface User {
    role: 'admin' | 'gerant' | string;
}

interface Props {
    rendezvous: Rendezvou;
    auth: Auth
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Rendez-vous', href: '/rendezvous' },
    { title: 'Détails du rendez-vous', href: '#' },
];

const statusOptions = {
    'en_attente' : {icon : Clock1, color : 'bg-amber-200 text-amber-800', label : "En Attente"},
    'confirmé': { icon: Check, color: 'bg-green-100 text-green-800', label: 'Confirmé' },
    'annulé': { icon: X, color: 'bg-red-100 text-red-800', label: 'Annulé' },
    'terminé': { icon: CalendarCheck, color: 'bg-blue-100 text-blue-800', label: 'Terminé' },
    'no-show': { icon: CalendarX, color: 'bg-yellow-100 text-yellow-800', label: 'No-show' },
} as const;

export default function RendezvouShow({ rendezvous,services, auth, flash }: Props) {
    const {  processing } = useForm({});
    const currentStatus = statusOptions[rendezvous.statut];
    const total = services.reduce((sum, service) => sum + parseFloat(service.prix), 0);
    const canEdit = rendezvous.statut === 'confirmé' && auth.user.role === 'admin';
    const canUpdateStatut =  auth.user.role === 'admin' || auth.user.role === 'gerant';
    const AviableEdit = rendezvous.statut === 'confirmé'|| rendezvous.statut === 'en_attente' || rendezvous.statut === 'no-show' ;
    flash.error && toast.error(flash.error);
    flash.success && toast.success(flash.success);
    const handleStatusChange = (newStatus: keyof typeof statusOptions) => {
        router.post(route('rendezvous.update-status', rendezvous.id), {
            statut: newStatus,
            preserveScroll: true,
           
        });
    };
    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title={`Rendez-vous `} />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Détails du rendez-vous</h1>
                    <div className="flex items-center gap-4">
                        {AviableEdit &&(

                       <>
                       {canUpdateStatut && (
                            <Select 
                                value={rendezvous.statut}
                                onValueChange={handleStatusChange}
                                disabled={processing}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Modifier le statut</SelectLabel>
                                        {(Object.keys(statusOptions) as Array<keyof typeof statusOptions>).map((statusKey) => {
                                            const status = statusOptions[statusKey];
                                            return (
                                                <SelectItem key={statusKey} value={statusKey}>
                                                    <div className={`inline-flex items-center rounded px-2 py-1 text-xs font-semibold ${status.color}`}>
                                                        <status.icon className="h-3 w-3 mr-1" />
                                                        {status.label}
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        )}
                       </>
                        
                    )}
                        <Link href={route('rendezvous.index')}>
                            <Button variant="outline">Retour à la liste</Button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-6">
                    <div className="border rounded-lg p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-primary/10 p-3 rounded-full">
                                <Calendar className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Rendez-vous </h2>
                                <Badge className={`${currentStatus.color} gap-2 mt-1`}>
                                    <currentStatus.icon className="h-3 w-3" />
                                    {currentStatus.label}
                                </Badge>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-sm font-medium">Date et heure</Label>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        {format(new Date(rendezvous.date_rdv), 'PP', { locale: fr })}
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label className="text-sm font-medium">Durée</Label>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        {rendezvous.heure_debut.slice(0,5)} - {rendezvous.heure_fin.slice(0,5)} 
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label className="text-sm font-medium">Total</Label>
                                    <div className="flex items-center gap-2">
                                        {parseFloat(total).toFixed(2)} $
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-sm font-medium">Client</Label>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <Button asChild variant={'link'}>
                                            <Link href={route("clients.show", rendezvous.client.ref)}>
                                                {rendezvous.client?.name || 'Non spécifié'}
                                            </Link>
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label className="text-sm font-medium">Branche</Label>
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4" />
                                        {rendezvous.succursale.nom}
                                    </div>
                                </div>
                            </div>

                            {rendezvous.notes && (
                                <div className="grid gap-2">
                                    <Label className="text-sm font-medium">Notes</Label>
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        {rendezvous.notes}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border rounded-lg">
                        <div className="p-4 border-b">
                            <h3 className="font-medium">Services  ({JSON.parse(rendezvous.services).length}) </h3>
                        </div>
                        <div className="divide-y">
                            {services.map((service) => (
                                <div key={service.id} className="p-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="font-medium">{service.name}</h4>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{parseFloat(service.prix).toFixed(2)} $</span>
                                        </div>
                                    </div>
                                    {service.notes && (
                                        <div className="mt-2 text-sm text-muted-foreground">
                                            {service.notes}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {canEdit && (
                        <div className="flex justify-end">
                            <Link href={route('rendezvous.edit', rendezvous.ref)}>
                                <Button>Modifier le rendez-vous</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}