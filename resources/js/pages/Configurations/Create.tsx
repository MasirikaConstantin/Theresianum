import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { Auth, BreadcrumbItem, PageProps } from "@/types";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FormEvent, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PopcornIcon } from "lucide-react";
import { toast } from "sonner";
import { FrancCongolais } from "@/hooks/Currencies";

interface Configurations extends PageProps {
    auth: Auth;
    activeConfig?: {
        id: number;
        actif: boolean;
        ratio_achat: number;
        valeur_point: number;
        seuil_utilisation: number;
    };
}

export default function Configurations({ auth, activeConfig }: Configurations) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Tableau de bord', href: route('dashboard') },
        { title: 'Configuration des Points de Fidélités', href: '/points' },
    ];
    const { data, setData, post, processing, errors } = useForm({
        actif: activeConfig?.actif ?? false,
        ratio_achat: activeConfig?.ratio_achat ?? 10000,
        valeur_point: activeConfig?.valeur_point ?? 500,
        seuil_utilisation: activeConfig?.seuil_utilisation ?? 20,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('fidelite.config.update'), {
            onSuccess: () => {
                toast.success('Configuration mise à jour avec succès');
            },
            onError: (error) => {
                toast.error('Une erreur est survenue lors de la mise à jour de la configuration');
            }
        });
    };


    
    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Gestions des points de fidélités Clients" />
            <div className="p-6">
                <div className="flex justify-end">
                <Button variant="outline" className="mb-4" onClick={() => router.visit('/points')}>
                    Retour à la liste des configurations
                </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Points de Fidélités</CardTitle>
                        <CardDescription>
                            Mettez à jours les Configurations pour l'utilisation et l'acquisition des points de Fidélités par les clients
                        </CardDescription>
                    </CardHeader>

                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="actif"
                                    checked={data.actif}
                                    onCheckedChange={(checked) => setData('actif', checked)}
                                />
                                <Label htmlFor="actif">Configuration active</Label>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="ratio_achat">Ratio d'acquisition</Label>
                                    <Input
                                        id="ratio_achat"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={(data.ratio_achat)}
                                        onChange={(e) => setData('ratio_achat', parseFloat(e.target.value))}
                                        placeholder="10000 (1 point pour chaque 10000FC dépensés)"
                                    />
                                    {errors.ratio_achat && (
                                        <p className="text-sm text-red-500">{errors.ratio_achat}</p>
                                    )}
                                    
                                </div>

                                <div>
                                    <Label htmlFor="valeur_point">Valeur d'un point (FC)</Label>
                                    <Input
                                        id="valeur_point"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={data.valeur_point}
                                        onChange={(e) => setData('valeur_point', parseFloat(e.target.value))}
                                        placeholder="1 (1 point = 1FC)"
                                    />
                                    {errors.valeur_point && (
                                        <p className="text-sm text-red-500">{errors.valeur_point}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="seuil_utilisation">Seuil d'utilisation (points)</Label>
                                    <Input
                                        id="seuil_utilisation"
                                        type="number"
                                        min="1"
                                        value={data.seuil_utilisation}
                                        onChange={(e) => setData('seuil_utilisation', parseInt(e.target.value))}
                                        placeholder="5 (minimum de points à utiliser)"
                                    />
                                    {errors.seuil_utilisation && (
                                        <p className="text-sm text-red-500">{errors.seuil_utilisation}</p>
                                    )}
                                </div>
                            </div>
                            <Alert className="mt-3">
                                        <PopcornIcon />
                                        <AlertTitle>
                                            Prévisualisation :
                                        </AlertTitle>
                                        <AlertDescription>
                                            <ul className="list-inside list-disc text-sm">
                                                <li>Pour un achat de {FrancCongolais(data.ratio_achat)} le client gagne {data.ratio_achat / data.ratio_achat} points</li>
                                                <li>Pour utiliser le point le client doit avoir minimum {data.seuil_utilisation} points</li>
                                                <li>Si un client veut utiliser ses points  :  1 point vaudra {data.valeur_point} FC de réduction</li>
                                                <li>Donc s'il a {data.seuil_utilisation} points il pourra utiliser {FrancCongolais(data.seuil_utilisation * data.valeur_point)}  de réduction</li>
                                            </ul>
                                        </AlertDescription>
                                    </Alert>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Enregistrement...' : 'Enregistrer la configuration'}
                                </Button>
                            </div>
                        </form>

                        {activeConfig && (
                            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-medium">Explications</h3>
                                <p className="text-sm text-gray-600 mt-2">
                                    Avec la configuration actuelle:
                                </p>
                                <ul className="list-disc pl-5 text-sm text-gray-600 mt-2 space-y-1">
                                    <li>Pour chaque {FrancCongolais(activeConfig.ratio_achat)} FC dépensés, le client gagne 1 point</li>
                                    <li>1 point = {FrancCongolais(activeConfig.valeur_point)} FC de réduction</li>
                                    <li>Le client doit avoir minimum {activeConfig.seuil_utilisation} points pour les utiliser</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}