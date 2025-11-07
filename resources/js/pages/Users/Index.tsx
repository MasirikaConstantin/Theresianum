import AppLayout from '@/layouts/app-layout';
import { Auth, SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2, Eye, ChartBar } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router } from '@inertiajs/react';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Utilisateurs',
        href: '/utilisateurs',
    },
];

export default function UserIndex({ auth,is_admin,is_gerant }: { auth: Auth,is_admin: boolean,is_gerant: boolean }) {
    const { flash, users } = usePage<SharedData & { users: any[] }>().props;

    flash.error && toast.error(flash.error);
    flash.success && toast.success(flash.success);
    const canUpdateRole = is_admin ;
    const canUpdateSuccursale = is_admin ;
    
    const handleDelete = (id: number) => {
        router.delete(route('utilisateurs.destroy', id));
    };

    const handleRoleChange = (userId: number, newRole: string) => {
        router.patch(route('utilisateurs.update-role', userId), { role: newRole });
    };

    const handleStatusChange = (userId: number, isActive: boolean) => {
        router.patch(route('utilisateurs.update-status', userId), { is_active: isActive });
    };

    const handleSuccursaleChange = (userId: number, succursaleId: string) => {
        const id = succursaleId === 'null' ? null : succursaleId;
        router.patch(route('utilisateurs.update-succursale', userId), { succursale_id: id });
    };

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Utilisateurs" />
            
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Gestion des utilisateurs</h1>
                    <Link href={route('utilisateurs.create')}>
                        {canUpdateRole && (
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Ajouter un utilisateur
                            </Button>
                        )}
                    </Link>
                </div>
                <div className="rounded-lg ">
                    <Table>
                        <TableCaption>Liste des utilisateurs</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Avatar</TableHead>
                                <TableHead>Nom</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Rôle</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <Avatar>
                                            {user.avatar ? (
                                                <AvatarImage src={`/storage/${user.avatar}`} />
                                            ) : (
                                                <AvatarFallback>
                                                    {user.name.split(' ').map((n: string) => n[0]).join('')}
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium">{user.name.slice(0, 15)+'...'}</TableCell>
                                    <TableCell>{user.email.slice(0, 15)+'...'}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={user.role}
                                            onValueChange={(value) => handleRoleChange(user.id, value)}
                                        >
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue placeholder="Rôle" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {canUpdateRole && (
                                                <SelectItem value="admin">Admin</SelectItem>
                                                )}
                                                <SelectItem value="gerant">Réceptioniste</SelectItem>
                                                <SelectItem value="vendeur">Vendeur</SelectItem>
                                                <SelectItem value="aucun">Aucun</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                            <div className="flex items-center gap-2">
                                            <Switch
                                                checked={user.is_active}
                                                onCheckedChange={(checked) => handleStatusChange(user.id, checked)}
                                            />
                                            <Badge variant={user.is_active ? 'default' : 'secondary'}>
                                                    {user.is_active ? 'Actif' : 'Inactif'}
                                                </Badge>
                                            </div>
                                    </TableCell>
                                    
                                    <TableCell className="flex gap-2">
                                        <Link href={route('utilisateurs.show', user.ref)}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Link href={route('utilisateurs.edit', user.ref)}>
                                            <Button variant="outline" size="sm">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        {user.id !==auth.user.id && (
                                            <>
                                            
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Cette action supprimera définitivement l'utilisateur et ne pourra pas être annulée.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(user.id)}>
                                                            Supprimer
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                            </>

                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}