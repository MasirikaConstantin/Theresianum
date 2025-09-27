import React, { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import axios from 'axios';
import { Button } from './ui/button';

export default function RendezVousCount() {
    const { auth } = usePage().props;
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth.user?.succursale_id) {
            setLoading(false);
            return;
        }

        // Utilisez Inertia pour récupérer le compte
        axios.get(`/rendezvous-count`)
            .then(response => {
                setCount(response.data.count);
                //console.log(response.data)
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [auth.user?.succursale_id]);

    if (!auth.user?.succursale_id) {
        return (
            <div className="w-full max-w-sm border-0 p-4">
                <CardContent className="text-center py-4">
                    <p>Aucune branche attribuée</p>
                </CardContent>
            </div>
        );
    }

    return (
        <div className="w-full max-w-sm border-0 p-4">
            <div>
                <h3>Rendez-vous confirmés</h3>
            </div>
            <div>
                {loading ? (
                    <div className="text-center py-4">Chargement...</div>
                ) : (
                    <>
                        <div className="text-4xl font-bold text-center">{count}</div>
                        <p className="text-sm text-muted-foreground text-center mb-4">
                            {auth.user?.role ==="admin" || auth.user?.role ==='gerant' ? (
                                "Sur toutes les branches"
                            ):(
                                "Pour votre branche"
                            )}
                            
                        </p>
                        <Button asChild>
                        <Link className='' href={route('rendezvous.index')} >
                            Consulté tout
                        </Link>
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}