import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { DialogDescription } from '@radix-ui/react-dialog';
import { Reservation } from '@/types';
import { Home } from 'lucide-react';

type ReservationVenteManagerProps = {
    onReservationSelected: (reservation: Reservation) => void;
    currentReservationId?: number;
    reservations: Reservation[];
};

export default function ReservationVenteManager({ onReservationSelected, currentReservationId, reservations }: ReservationVenteManagerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
   
    const filteredReservations = reservations.filter(reservation =>
        reservation.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (reservation.client.email && reservation.client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (reservation.client.telephone && reservation.client.telephone.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (reservation.salle && reservation.salle.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (reservation.chambre && reservation.chambre.nom.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Button 
                variant="outline" 
                size="sm" 
                className="text-primary"
                onClick={() => setIsOpen(true)}
            >
                <Home className="h-4 w-4 mr-2" />
                Reservation
            </Button>
            <DialogDescription className="sr-only">
                Ouvrir le gestionnaire de reservation pour sélectionner ou créer une reservation.
            </DialogDescription>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Gestion des reservations</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Recherche de reservations */}
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher une reservation..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Liste des reservations */}
                    <ScrollArea className="h-[200px] pr-4">
                        <div className="space-y-1 grid grid-cols-2 gap-2">
                            {filteredReservations.length > 0 ? (
                                filteredReservations.map((reservation) => (
                                    <Card 
                                        key={reservation.id}
                                        className={`cursor-pointer p-1 rounded-0 ${currentReservationId === reservation.id ? 'border-primary bg-primary/5' : ''}`}
                                        onClick={() => {
                                            onReservationSelected(reservation);
                                            setIsOpen(false);
                                        }}
                                    >
                                        <CardContent className="p-2">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium">{reservation.client.name}</p>
                                                    {reservation.client.telephone && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {reservation.client.telephone}
                                                        </p>
                                                    )}
                                                    {reservation.chambre && <p>{reservation.chambre?.nom ? reservation.chambre.nom : reservation.chambre?.numero}</p>}
                                                    {reservation.salle && <p>{reservation.salle?.nom ? reservation.salle.nom : reservation.salle?.capacite_max}</p>}
                                                </div>
                                                {currentReservationId === reservation.id && (
                                                    <span className="text-sm text-primary">Sélectionné</span>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <p className="text-center text-sm text-muted-foreground py-4">
                                    Aucune reservation trouvée
                                </p>
                            )}
                        </div>
                    </ScrollArea>

                </div>
            </DialogContent>
        </Dialog>
    );
}