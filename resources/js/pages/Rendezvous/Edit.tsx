import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Building, Plus, Minus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DateTimePicker24h } from '@/components/ui/date-time-picker';

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Rendez-vous', href: '/rendezvous' },
    { title: 'Modifier rendez-vous', href: '#' },
];

export default function RendezvouEdit({ rendezvous, clients, succursales, services, employes, auth }: { 
    rendezvous: any;
    clients: any[];
    succursales: any[];
    services: any[];
    employes: any[];
    auth: any;
}) {
    const { data, setData, put, processing, errors } = useForm({
        client_id: rendezvous.client_id,
        succursale_id: rendezvous.succursale_id.toString(),
        date_heure: new Date(rendezvous.date_heure),
        duree_prevue: rendezvous.duree_prevue,
        statut: rendezvous.statut,
        notes: rendezvous.notes,
        services: rendezvous.rendezvou_services.map((service: any) => ({
            id: service.service_id,
            service_id: service.service_id.toString(),
            prix_effectif: service.prix_effectif,
            notes: service.notes,
        })),
    });
    const addService = () => {
        setData('services', [
            ...data.services,
            {
                service_id: '',
                user_id: '',
                prix_effectif: 0,
                notes: '',
            }
        ]);
    };
    const removeService = (index: number) => {
        if (data.services.length <= 1) return;
        const newServices = [...data.services];
        newServices.splice(index, 1);
        setData('services', newServices);
    };

    const updateService = (index: number, field: string, value: any) => {
        const newServices = [...data.services];
        newServices[index] = {
            ...newServices[index],
            [field]: value
        };

        if (field === 'service_id' && value) {
            const selectedService = services.find(s => s.id.toString() === value);
            if (selectedService) {
                newServices[index].prix_effectif = selectedService.prix;
            }
        }

        setData('services', newServices);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('rendezvous.update', rendezvous.id), {
            onSuccess: () => toast.success('Rendez-vous mis à jour avec succès'),
            onError: () => toast.error('Une erreur est survenue'),
        });
    };

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title={`Modifier rendez-vous ${rendezvous.ref}`} />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Modifier le rendez-vous {rendezvous.ref}</h1>
                    <Link href={route('rendezvous.index')}>
                        <Button variant="outline">Retour à la liste</Button>
                    </Link>
                </div>

                <form onSubmit={submit} className="grid gap-6">
                    <div className="grid gap-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="grid gap-2">
                                                    <Label>Client</Label>
                                                    <Select
                                                        value={data.client_id ? data.client_id.toString() : "null"}
                                                        onValueChange={(value) => setData('client_id', value === "null" ? null : parseInt(value))}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sélectionner un client" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="null">Aucun client</SelectItem>
                                                            {clients.map((client) => (
                                                                <SelectItem key={client.id} value={client.id.toString()}>
                                                                    {client.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                    
                                                <div className="grid gap-2">
                                                    <Label>Branche</Label>
                                                    <Select
                                                        value={data.succursale_id}
                                                        onValueChange={(value) => setData('succursale_id', value)}
                                                        required
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sélectionner une branche" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {succursales.map((succursale) => (
                                                                <SelectItem key={succursale.id} value={succursale.id.toString()}>
                                                                    {succursale.nom}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.succursale_id && (
                                                        <p className="text-sm font-medium text-destructive">{errors.succursale_id}</p>
                                                    )}
                                                </div>
                    
                                                <div className="grid gap-2">
                                                    <Label>Statut</Label>
                                                    <Select
                                                        value={data.statut}
                                                        onValueChange={(value) => setData('statut', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Statut" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="confirmé">Confirmé</SelectItem>
                                                            <SelectItem value="annulé">Annulé</SelectItem>
                                                            <SelectItem value="terminé">Terminé</SelectItem>
                                                            <SelectItem value="no-show">No-show</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                    
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label>Date et heure</Label>
                                                    <DateTimePicker24h
                                                        date={new Date(data.date_heure)}
                                                        setDate={(date) => setData('date_heure', date)}
                                                    />
                                                    {errors.date_heure && (
                                                        <p className="text-sm font-medium text-destructive">{errors.date_heure}</p>
                                                    )}
                                                </div>
                    
                                                <div className="grid gap-2">
                                                    <Label>Durée prévue (minutes)</Label>
                                                    <Input
                                                        type="number"
                                                        min="15"
                                                        value={data.duree_prevue}
                                                        onChange={(e) => setData('duree_prevue', parseInt(e.target.value))}
                                                    />
                                                    {errors.duree_prevue && (
                                                        <p className="text-sm font-medium text-destructive">{errors.duree_prevue}</p>
                                                    )}
                                                </div>
                                            </div>
                    
                                            <div className="grid gap-2">
                                                <Label>Notes (optionnel)</Label>
                                                <Textarea
                                                    value={data.notes || ''}
                                                    onChange={(e) => setData('notes', e.target.value)}
                                                    placeholder="Notes supplémentaires..."
                                                />
                                            </div>
                    
                                            <div className="border rounded-lg p-4">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="font-medium">Services</h3>
                                                    <Button type="button" size="sm" onClick={addService}>
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Ajouter un service
                                                    </Button>
                                                </div>
                    
                                                {data.services.map((service, index) => (
                                                    <div key={index} className="grid gap-4 mb-4 p-4 border rounded-lg">
                                                        <div className="flex justify-between items-center">
                                                            <h4 className="font-medium">Service #{index + 1}</h4>
                                                            {data.services.length > 1 && (
                                                                <Button 
                                                                    type="button" 
                                                                    variant="ghost" 
                                                                    size="sm" 
                                                                    onClick={() => removeService(index)}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            )}
                                                        </div>
                    
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div className="grid gap-2">
                                                                <Label>Service</Label>
                                                                <Select
                                                                    value={service.service_id}
                                                                    onValueChange={(value) => updateService(index, 'service_id', value)}
                                                                    required
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Sélectionner un service" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {services.map((service) => (
                                                                            <SelectItem key={service.id} value={service.id.toString()}>
                                                                                {service.name} ({service.prix}$) {service.id.toString()}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                {errors[`services.${index}.service_id`] && (
                                                                    <p className="text-sm font-medium text-destructive">
                                                                        {errors[`services.${index}.service_id`]}
                                                                    </p>
                                                                )}
                                                            </div>
                    
                                                            
                    
                                                            <div className="grid gap-2">
                                                                <Label>Prix effectif (FC)</Label>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    disabled
                                                                    step="0.01"
                                                                    value={service.prix_effectif}
                                                                    onChange={(e) => updateService(index, 'prix_effectif', parseFloat(e.target.value))}
                                                                />
                                                                {errors[`services.${index}.prix_effectif`] && (
                                                                    <p className="text-sm font-medium text-destructive">
                                                                        {errors[`services.${index}.prix_effectif`]}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                    
                                        <div className="flex justify-end gap-2">
                                            <Button type="submit" disabled={processing}>
                                                <Calendar className="mr-2 h-4 w-4" />
                                                {processing ? 'Modification...' : 'Modifier le rendez-vous'}
                                            </Button>
                                        </div>
                </form>
            </div>
        </AppLayout>
    );
}