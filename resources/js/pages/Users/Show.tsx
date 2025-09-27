import AppLayout from '@/layouts/app-layout';
import { Auth, SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserStatsChart } from '@/components/UserStatsChart';

const breadcrumbs = (userName: string): BreadcrumbItem[] => [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Utilisateurs',
        href: '/utilisateurs',
    },
    {
        title: `Détails de ${userName}`,
        href: '#',
    },
];

export default function UserShow({ auth, user, stats }: { auth: Auth; user: any; stats: any }) {
    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs(user.name)}>
            <Head title={`Détails de ${user.name}`} />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex items-center gap-4">
                    <Link href={route('utilisateurs.index')}>
                        <Button variant="outline" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">Détails de {user.name}</h1>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <div className="flex flex-col items-center gap-4">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={user.avatar ? `/storage/${user.avatar}` : undefined} />
                                    <AvatarFallback>
                                        {user.name.split(' ').map((n: string) => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <CardTitle className="text-center">{user.name}</CardTitle>
                                <div className="flex gap-2">
                                    <Badge variant={user.is_active ? 'default' : 'secondary'}>
                                        {user.is_active ? 'Actif' : 'Inactif'}
                                    </Badge>
                                    <Badge variant="outline">{user.role ==="admin" ? "Admin" : user.role === "gerant" ? "D.R.H" : user.role === "vendeur" ? "Vendeur" : "Aucun"}</Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Email</p>
                                <p>{user.email}</p>
                            </div>
                            {user.telephone && (
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                                    <p>{user.telephone}</p>
                                </div>
                            )}
                            {user.succursale && (
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Branche</p>
                                    <p>{user.succursale.nom}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Informations supplémentaires</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <div className="grid gap-4">
                                {user.adresse && (
                                    <div className="grid gap-1">
                                        <p className="text-sm font-medium text-muted-foreground">Adresse</p>
                                        <p>{user.adresse}</p>
                                    </div>
                                )}
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Date d'embauche</p>
                                    <p>
                                        {user.date_embauche 
                                            ? format(new Date(user.date_embauche), 'PPP', { locale: fr }) 
                                            : 'Non spécifiée'}
                                    </p>
                                </div>
                            </div>
                            <div className="grid gap-4">
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Dernière connexion</p>
                                    <p>
                                        {user.last_login_at 
                                            ? format(new Date(user.last_login_at), 'PPPp', { locale: fr }) 
                                            : 'Jamais connecté'}
                                    </p>
                                </div>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">IP dernière connexion</p>
                                    <p>{user.last_login_ip || 'Inconnue'}</p>
                                </div>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Créé par</p>
                                    <p>{user.created_by ? user.creator?.name : 'Système'}</p>
                                </div>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium text-muted-foreground">Dernière modification</p>
                                    <p>
                                        {user.updated_at 
                                            ? format(new Date(user.updated_at), 'PPPp', { locale: fr }) 
                                            : 'Jamais modifié'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <UserStatsChart stats={stats} />
                </div>

                <div className="flex justify-end gap-2">
                    <Link href={route('utilisateurs.index')}>
                        <Button variant="outline">Retour</Button>
                    </Link>
                    <Link href={route('utilisateurs.edit', user.ref)}>
                        <Button>Modifier</Button>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}