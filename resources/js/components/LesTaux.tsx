import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area"
import axios from "axios";
import { useEffect, useState } from "react";
export default function LesTaux() {
    const [taux, setTaux] = useState([])
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        axios.get('/taux').then(response => {
        //console.log(response.data)
        setTaux(response.data)
        setLoading(false);

        }).catch(() => setLoading(false))
    }, [])
    return (
        <div className="bg-amber-200">
            <div className="text-center py-4">
            {loading ? (
                    <div className="text-center py-4">Chargement...</div>
                ) : (
                <>
                {taux.length > 0 ? (
                        <>
                        <p>Les Taux disponibles</p>
                        <ScrollArea className="h-[200px] w-[350px] rounded-md border-amber-200 p-4">
                        {taux.map((taux: any) => (
                            <div className="flex flex-col gap-2 font-bold " key={taux.id}>
                                
                                <ul className="flex flex-row gap-2">
                                <li>{taux.name}</li>
                                <li>{"1 USD =>"} </li>
                                <li>{parseFloat(taux.exchange_rate).toFixed(1)} {taux.symbol}</li>
                            </ul>
                            </div>
                        ))}</ScrollArea>
                        
                        </>
                ) : (
                    <p>Aucun taux trouvé</p>
                )}</>
            )}
            </div>
        </div>
    );
}