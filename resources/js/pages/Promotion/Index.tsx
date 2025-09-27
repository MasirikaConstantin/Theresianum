import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout"
import { Auth, BreadcrumbItem } from "@/types"
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Promotion } from "@/types";
import { Head, useForm, router } from "@inertiajs/react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { useState } from "react";
import { toast } from "sonner";
import { Vente } from "@/types";
import { TableCell, TableHead,Table,TableBody, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function PromotionIndex({ auth, promotion, ventes }: { auth: Auth, promotion: Promotion, ventes: Vente[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: "Dashboard",
            href: "/dashboard",
        },
        {
            title: "Promotions",
            href: "/promotions",
        },
    ];

    const [isActive, setIsActive] = useState(promotion?.is_active ?? false);
    const { data, setData, patch, processing, errors } = useForm({
        is_active: promotion?.is_active ?? false,
    });

    const handleStatusChange = async (checked: boolean) => {
        try {
            setIsActive(checked);
            
            await router.post(`/promotions`, {
                is_active: checked,
            }, {
                onSuccess: () => {
                    toast.success(`Promotion ${checked ? 'activée' : 'désactivée'} avec succès`);
                },
                onError: () => {
                    setIsActive(!checked);
                    toast.error("Une erreur est survenue lors de la mise à jour");
                },
            });
        } catch (error) {
            setIsActive(!checked);
            console.error("Error updating promotion:", error);
        }
    };
    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Promotions"/>
            <div className="p-6">
                <Card className="p-6">
                    <CardHeader>
                        <CardTitle className="text-2xl">Gestion des promotions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Colonne de gauche - Etat des promotions */}
                            <div className="lg:col-span-4 space-y-6">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            Etat des promotions
                                            <Badge variant={isActive ? "default" : "destructive"}>
                                                {isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p>Activez ou désactivez la promotion globale</p>
                                        
                                        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                    Statut de la promotion
                                                </label>
                                                <p className="text-sm text-muted-foreground">
                                                    {isActive 
                                                        ? "La promotion est actuellement active" 
                                                        : "La promotion est actuellement inactive"}
                                                </p>
                                            </div>
                                            <Switch
                                                checked={isActive}
                                                onCheckedChange={handleStatusChange}
                                                disabled={processing}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Colonne de droite - Historique */}
                            <div className="lg:col-span-8 space-y-6">
                                <Card className="flex flex-col">
                                    <CardHeader className="pb-3 flex items-center justify-between">
                                        <CardTitle className="flex items-center">
                                            Ventes ayant profité de la promotion
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                    <ScrollArea className="flex-1 max-h-[350px] pr-4 overflow-y-auto">
                                        {ventes?.length > 0 ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[120px]">Code</TableHead>
                                                        <TableHead className="text-right">Montant</TableHead>
                                                        <TableHead className="text-right">Date</TableHead>
                                                        <TableHead className="text-center">Promotion</TableHead>
                                                        <TableHead className="text-center">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {ventes.map((vente) => (
                                                        <TableRow key={vente.id}>
                                                            <TableCell className="font-medium">{vente.code}</TableCell>
                                                            <TableCell className="text-right">
                                                                {new Intl.NumberFormat('fr-FR', {
                                                                    style: 'currency',
                                                                    currency: 'USD' // Changez pour CDF si nécessaire
                                                                }).format(parseFloat(vente.montant_total))}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {new Date(vente.created_at).toLocaleDateString('fr-FR', {
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                {vente.has_promotion ? (
                                                                    <Badge variant="success">Avec promotion</Badge>
                                                                ) : (
                                                                    <Badge variant="secondary">Standard</Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => router.visit(`/ventes/${vente.ref}`)}
                                                                >
                                                                    Voir
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <div className="flex items-center justify-center h-[200px]">
                                                <p className="text-muted-foreground">
                                                    Aucune vente n'a profité de la promotion pour le moment
                                                </p>
                                            </div>
                                        )}
                                    </ScrollArea>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}