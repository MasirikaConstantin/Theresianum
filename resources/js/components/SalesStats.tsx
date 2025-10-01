import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from "@/components/ui/scroll-area"
import { FrancCongolais } from '@/hooks/Currencies';
interface SaleItem {
  id: string;
  name: string;
  type: 'produit' | 'service';
  total_quantity: number;
  total_amount: number;
  monthly_data: { month: string; amount: number }[];
}

export default function SalesStats() {
  const [data, setData] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/sales-stats');
        setData(response.data);
      } catch (err) {
        setError('Erreur de chargement des données');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }
 
  return (
    <div className="w-full  h-full">

      {/* Top produits/services */}
      <div className='bg-card p-2 rounded-md'>
        <h2>Top 15 des ventes</h2>
        <div>        
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
                <ScrollArea className=" w-full h-100 rounded-md border-card py-2 px-5 ">
              {data
                .sort((a, b) => b.total_amount - a.total_amount)
                .slice(0, 15)
                .map((item, index) => (
                  <div key={item.id + item.total_quantity + index + 1} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className='text-sm'>{index + 1}. </span>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {item.type} • {item.total_quantity} ventes
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">{FrancCongolais(item.total_amount)} </p>
                  </div>
                ))}
                </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}