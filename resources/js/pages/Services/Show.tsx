import AppLayout from '@/layouts/app-layout';
import { Auth, SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs = (serviceName: string): BreadcrumbItem[] => [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Services',
        href: '/services',
    },
    {
        title: `Détails de ${serviceName}`,
        href: '#',
    },
];

export default function ServiceShow({ auth, service }: { auth: Auth; service: any }) {
    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs(service.name)}>
            <Head title={`Détails de ${service.name}`} />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                    <Link href={route('services.index')}>
                        <Button variant="outline" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">Détails de {service.name}</h1>
                    </div>
                    <div>
                        <Link href={route('services.get-update-image', service.ref)}>
                        {service.image ? (
                            <Button variant="outline">Modifier l'image</Button>
                        ) : (
                            <Button>Ajouter une image</Button>
                        )}
                        </Link>
                    </div>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations principales</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-4">
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Nom du service</p>
                                    <p>{service.name}</p>
                                </div>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Durée</p>
                                    <p>{service.duree_minutes} minutes</p>
                                </div>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Statut</p>
                                    <Badge variant={service.actif ? 'default' : 'secondary'}>
                                        {service.actif ? 'Actif' : 'Inactif'}
                                    </Badge>
                                </div>
                            </div>
                            <div className="grid gap-4">
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Prix</p>
                                    <p>
                                        {new Intl.NumberFormat('fr-FR', {
                                            style: 'currency',
                                            currency: 'USD'
                                        }).format(service.prix).replace('$US', '$')}
                                    </p>
                                </div>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Créé par</p>
                                    <p>
                                        {service.user ? (
                                            <Badge variant="outline">
                                                {service.user.name}
                                            </Badge>
                                        ) : 'Système'}
                                    </p>
                                </div>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Date de création</p>
                                    <p>{format(new Date(service.created_at), 'PPPp', { locale: fr })}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {service.image && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Image</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <img src={service.image_url} alt={service.name} className="w-full h-64 object-contain mx-auto" />
                            </CardContent>
                        </Card>
                    )}
                    {service.description && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-line">{service.description}</p>
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex justify-end gap-2">
                        <Link href={route('services.index')}>
                            <Button variant="outline">Retour</Button>
                        </Link>
                        <Link href={route('services.edit', service.ref)}>
                            <Button>Modifier</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}