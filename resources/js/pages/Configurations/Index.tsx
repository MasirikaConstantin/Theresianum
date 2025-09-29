import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { Auth, BreadcrumbItem, PageProps } from "@/types";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { FormEvent } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PopcornIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
    configurations: {
        id: number;
        actif: boolean;
        ratio_achat: number;
        valeur_point: number;
        seuil_utilisation: number;
    }[];
}

export default function Configurations({ auth, activeConfig, configurations }: Configurations) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Tableau de bord', href: route('dashboard') },
        { title: 'Configuration des Points de Fidélités', href: '/points' },
    ];
    const { data, setData, post, processing, errors } = useForm({
        actif: activeConfig?.actif ?? false,
        ratio_achat: activeConfig?.ratio_achat ?? 7,
        valeur_point: activeConfig?.valeur_point ?? 0.5,
        seuil_utilisation: activeConfig?.seuil_utilisation ?? 5,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('fidelite.config.update'));
    };


    
    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Gestions des points de fidélités Clients" />
            <div className="p-6">
                <Card>
                    <CardHeader >
                        <CardTitle className="text-xl">Points de Fidélités</CardTitle>
                        <div className="flex justify-between">
                        <CardDescription>
                            Mettez à jours les Configurations pour l'utilisation et l'acquisition des points de Fidélités par les clients
                        </CardDescription>
                        <Link  href={route('fidelite.config.update')}>
                            <Button type="button">Ajouter une configuration</Button>
                        </Link>
                        </div>
                    </CardHeader>

                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ratio d'acquisition</TableHead>
                                        <TableHead>Valeur d'un point (FC)</TableHead>
                                        <TableHead>Seuil d'utilisation (points)</TableHead>
                                        <TableHead>Actif</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {configurations.map((config) => (
                                        <TableRow key={config.id}>
                                            <TableCell>{FrancCongolais(config.ratio_achat)}</TableCell>
                                            <TableCell>{FrancCongolais(config.valeur_point)}</TableCell>
                                            <TableCell>{config.seuil_utilisation}</TableCell>
                                            <TableCell><Badge variant={config.actif ? 'default' : 'destructive'}>{config.actif ? 'Actif' : 'Inactif'}</Badge></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>

                        <CardFooter>
                            {activeConfig && (
                                <Alert>
                                    <PopcornIcon />
                                    <AlertTitle>
                                        Explications :
                                    </AlertTitle>
                                    <AlertDescription>
                                        Avec la configuration actuelle:
                                    <ul className="list-inside list-disc text-sm">
                                        <li>Pour chaque {FrancCongolais(activeConfig.ratio_achat)} FC dépensés, le client gagne 1 point</li>
                                        <li>1 point = {FrancCongolais(activeConfig.valeur_point)} FC de réduction</li>
                                        <li>Le client doit avoir minimum {activeConfig.seuil_utilisation} points pour les utiliser</li>
                                        <li>
                                            Exemple: Si un client dépense {FrancCongolais(10)} FC et que la configuration est de {FrancCongolais(activeConfig.ratio_achat)} FC par point, il gagne 1 point et peut utiliser 1 point pour une réduction de {FrancCongolais(activeConfig.valeur_point)} FC.
                                        </li>
                                    </ul>
                                    </AlertDescription>

                                </Alert>
                            )}
                        </CardFooter>
                </Card>
            </div>
        </AppLayout>
    );
}