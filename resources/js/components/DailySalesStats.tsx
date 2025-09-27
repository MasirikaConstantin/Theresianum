import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";

interface SalesData {
    services: any;
    produits: any;
    total: any;
}

export default function DailySalesStats() {
    const { data, isLoading, error } = useQuery<SalesData>({
        queryKey: ['dailySalesStats'],
        queryFn: async () => {
            const response = await axios.get('/api/ventes/stats-journalieres');
            return response.data;
        },
        refetchInterval: 300000 // Rafraîchir toutes les 5 minutes
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 text-center p-4">
                Erreur lors du chargement des statistiques
            </div>
        );
    }
    return (
        <div className="w-full p-2">
            <div className="w-full border-card p-2">
            <div>
                <h3 className="text-lg">Ventes Journalières</h3>
            </div>
            <div>
                <div className="grid grid-cols-2 gap-4 text-center mb-3">
                    <div className="space-y-2">
                        <p className="text-sm font-bold">Services</p>
                        <p className="text-2xl font-bold">
                            {parseFloat(data?.services).toLocaleString('fr-FR', { style: 'currency', currency: 'USD' }).replace('$US', '$')}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-bold">Produits</p>
                        <p className="text-2xl font-bold">
                            {parseFloat(data?.produits).toLocaleString('fr-FR', { style: 'currency', currency: 'USD' }).replace('$US', '$')}
                        </p>
                    </div>
                </div>
                <div className="flex justify-center">
                        <h3 className="text-2xl font-bold text-primary">
                            Total : {data?.total.toLocaleString('fr-FR', { style: 'currency', currency: 'USD' }).replace('$US', '$')}
                        </h3>
                    </div>
            </div>
        </div>
        </div>
    );
}