import AppLayout from '@/layouts/app-layout';
import { Auth, type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Transferts',
        href: '/transferts',
    },
    {
        title: 'Détails du transfert',
        href: '#',
    },
];

export default function TransfertShow({ auth, transfert }: { 
    auth: Auth;
    transfert: any;
}) {
    const getStatusBadge = (statut: string) => {
        switch (statut) {
            case 'validé':
                return <Badge variant="success">Validé</Badge>;
            case 'refusé':
                return <Badge variant="destructive">Refusé</Badge>;
            default:
                return <Badge variant="secondary">En attente</Badge>;
        }
    };
    const { flash } = usePage<SharedData>().props;
    flash.error && toast.error(flash.error);
    flash.success && toast.success(flash.success);

    const validateTransfert = (action: 'validé' | 'refusé') => {
        if (OtherValidate) {
            router.post(route('transferts-central.validate', transfert.ref), {
                action,
            });
        }else{
            router.post(route('transferts.validate', transfert.ref), {
                action,
            });
        }
    };
    
    const canValidate =  auth.user?.role === "gerant" || auth.user?.role === "caissier";
    const OtherValidate = auth.user?.role === "gerant" || transfert.transfert_stocks[0]?.succursale_source_id;
    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title={`Détails du transfert ${transfert.ref}`} />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Détails du transfert</h1>
                    <div className="flex gap-2">
                        <Link href={route('transferts.index')}>
                            <Button variant="outline">Retour à la liste</Button>
                        </Link>
                    </div>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Informations du transfert</CardTitle>
                        
                    </CardHeader>
                    <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                               
                               <div>
                                   <p className="text-sm text-muted-foreground">Statut</p>
                                   <p className="font-medium">
                                       {getStatusBadge(transfert.transfert_stocks[0]?.statut || 'en attente')}
                                   </p>
                               </div>
                               <div>
                                   <p className="text-sm text-muted-foreground">Note</p>
                                   <p className="font-medium">{transfert.note || '-'}</p>
                               </div>
                               <div>
                                   <p className="text-sm text-muted-foreground">Initiateur</p>
                                   <p className="font-medium">{transfert.user?.name}</p>
                               </div>
                               <div>
                                   <p className="text-sm text-muted-foreground">Date demande</p>
                                   <p className="font-medium">
                                       {format(new Date(transfert.created_at), 'PPpp', { locale: fr })}
                                   </p>
                               </div>
                               {transfert.transfert_stocks[0]?.date_validation && (
                                   <div>
                                       <p className="text-sm text-muted-foreground">Date validation</p>
                                       <p className="font-medium">
                                           {format(new Date(transfert.transfert_stocks[0].date_validation), 'PPpp', { locale: fr })}
                                       </p>
                                   </div>
                               )}
                               {transfert.transfert_stocks[0]?.validateur && (
                                   <div>
                                       <p className="text-sm text-muted-foreground">Validateur</p>
                                       <p className="font-medium">
                                           {transfert.transfert_stocks[0].validateur?.name}
                                       </p>
                                   </div>
                               )}
                           </div>
                    </CardContent>
                </Card>
                <Card className="grid gap-6">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Produits transférés</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2">
                            
                        </div>
                        
                        <div className="grid gap-2">
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="p-4 text-left">Produit</th>
                                            <th className="p-4 text-left">Quantité</th>
                                            <th className="p-4 text-left">Source</th>
                                            <th className="p-4 text-left">Destination</th>
                                            <th className="p-4 text-left">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transfert.transfert_stocks.map((item: any, index: number) => (
                                            <tr key={index} className="border-b">
                                                <td className="p-4">{item.produit?.name || 'Produit supprimé'}</td>
                                                <td className="p-4">{item.quantite}</td>
                                                <td className="p-4">{item.succursale_source?.nom || 'Central'}</td>
                                                <td className="p-4">{item.succursale_destination?.nom || 'Branche supprimée'}</td>
                                                <td className="p-4">
                                                    {getStatusBadge(item.statut)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </CardContent>
                    {canValidate && (
                    <CardFooter>
                        
                    
                    {transfert.transfert_stocks[0]?.statut === 'en attente' && (
                        <div className="flex justify-end gap-2">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                        Refuser le transfert
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Confirmer le refus</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Êtes-vous sûr de vouloir refuser ce transfert ? Cette action ne pourra pas être annulée.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => validateTransfert('refusé')}>
                                            Confirmer le refus
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button>
                                        Valider le transfert
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Confirmer la validation</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Êtes-vous sûr de vouloir valider ce transfert ? Les stocks seront automatiquement mis à jour.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => validateTransfert('validé')}>
                                            Confirmer la validation
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                    </CardFooter>
                )}
                </Card>
            </div>
        </AppLayout>
    );
}