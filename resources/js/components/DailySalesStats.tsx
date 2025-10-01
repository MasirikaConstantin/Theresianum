import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FrancCongolais } from "@/hooks/Currencies";
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
                <div className="grid grid-cols gap-4 text-center mb-3">
                    
                    <div className="space-y-2">
                        <p className="text-sm font-bold">Produits</p>
                        <p className="text-2xl font-bold">
                            {FrancCongolais(parseFloat(data?.produits))}
                        </p>
                    </div>
                </div>
                
            </div>
        </div>
        </div>
    );
}