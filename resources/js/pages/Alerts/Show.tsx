
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Calendar, MessageCircle, MessageCircleCode, Package, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Auth } from '@/types';
import { Label } from '@radix-ui/react-label';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Alertes', href: '/alerts' },
    { title: 'Détails de l\'alerte', href: '#' },
];

export default function AlertShow({ alert, auth,flash }: { alert: any, auth: Auth,flash: any }) {
    const markAsRead = (alert: any) => {
        router.patch(route('alerts.mark-as-read', alert.ref));
    };
    flash.error && toast.error(flash.error);
    flash.success && toast.success(flash.success);
    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title={`Alerte ${alert.ref}`} />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Détails de l'alerte</h1>
                    <div className="flex gap-2">
                        <Link href={route('alerts.index')}>
                            <Button variant="outline">Retour à la liste</Button>
                        </Link>
                        {alert.is_read ? (
                            <>
                            {auth.user.id === alert.user_id && (
                            <Button variant="outline" onClick={() => markAsRead(alert)}>
                                <MessageCircleCode/>Marqué comme lu </Button>
                            )}
                            </>
                        ) : (
                            <>
                            {auth.user.id === alert.user_id && (
                            <Button variant="outline" onClick={() => markAsRead(alert)}>
                                <MessageCircle/>Marqué comme non lu </Button>
                            )}
                            </>
                        )}
                        {alert.is_read === true ? (
                            <Badge variant="outline">Résolue</Badge> 
                        ) : (
                            <Badge variant="outline">Non résolue</Badge> 
                        )}
                    </div>
                </div>

                <Card className="grid gap-6 px-3">
                        <CardHeader className="flex items-center gap-4 mb-6">
                            <div className="bg-primary/10 p-3 rounded-full">
                                <AlertCircle className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Alerte </h2>
                                <p className="text-sm text-muted-foreground">
                                    Créée le {format(new Date(alert.created_at), 'PPpp', { locale: fr })}
                                </p>
                            </div>
                        </CardHeader>

                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <Label className="text-sm font-medium">Type d'alerte</Label>
                                <div className="flex gap-2">
                                    {alert.produit_id && (
                                        <Badge className="gap-2">
                                            <Package className="h-4 w-4" />
                                            Produit: {alert.produit.name}
                                        </Badge>
                                    )}
                                    {alert.rendezvou_id && (
                                        <Badge className="gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Rendez-vous: {alert.rendezvou.title}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-sm font-medium">Notes</Label>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    {alert.notes || "Aucune note fournie"}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-sm font-medium">Créée par</Label>
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span>{alert.user.name}</span>
                                </div>
                            </div>
                        </CardContent>

                    <CardFooter className="flex justify-end gap-2">
                        {auth.user.id === alert.user_id && (
                        <Link href={route('alerts.edit', alert.ref)}>
                            <Button>Modifier l'alerte</Button>
                        </Link>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </AppLayout>
    );
}