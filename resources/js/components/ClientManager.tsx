import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import { UserPlus, Search, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { DialogDescription } from '@radix-ui/react-dialog';
import { MonDatePicker } from '@/components/example-date-picker';

type Client = {
    id: string;
    telephone?: string;
    date_naissance?: Date | undefined;
};

type ClientManagerProps = {
    onClientSelected: (client: Client) => void;
    currentClientId?: string;
    clients: Client[];
};

export default function ClientManager({ onClientSelected, currentClientId, clients }: ClientManagerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newClient, setNewClient] = useState({
        telephone: '',
        date_naissance: undefined,
    });
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateClient = async () => {
       

        setIsCreating(true);
        try {
            const response = await axios.post('/api/clients/quick-create', newClient);
            const createdClient = response.data.client;
            
            toast.success(`Client ${createdClient.telephone} créé avec succès`);
            onClientSelected(createdClient);
            setNewClient({  telephone: '', date_naissance: undefined });
            setIsOpen(false);
        } catch (error) {
            toast.error('Erreur lors de la création du client');
            console.error(error);
        } finally {
            setIsCreating(false);
        }
    };

    const filteredClients = clients.filter(client =>
        (client.telephone && client.telephone.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Button 
                variant="outline" 
                size="sm" 
                className="text-primary"
                onClick={() => setIsOpen(true)}
            >
                <UserPlus className="h-4 w-4 mr-2" />
                Gérer le client
            </Button>
            <DialogDescription className="sr-only">
                Ouvrir le gestionnaire de clients pour sélectionner ou créer un client.
            </DialogDescription>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Gestion des clients</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Recherche de clients */}
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher un client..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Liste des clients */}
                    <ScrollArea className="h-[200px] pr-4">
                        <div className="space-y-1 grid grid-cols-2 gap-2">
                            {filteredClients.length > 0 ? (
                                filteredClients.map((client) => (
                                    <Card 
                                        key={client.id}
                                        className={`cursor-pointer p-1 rounded-0 ${currentClientId === client.id ? 'border-primary bg-primary/5' : ''}`}
                                        onClick={() => {
                                            onClientSelected(client);
                                            setIsOpen(false);
                                        }}
                                    >
                                        <CardContent className="p-2">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    {client.telephone && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {client.telephone}
                                                        </p>
                                                    )}
                                                </div>
                                                {currentClientId === client.id && (
                                                    <span className="text-sm text-primary">Sélectionné</span>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <p className="text-center text-sm text-muted-foreground py-4">
                                    Aucun client trouvé
                                </p>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Formulaire de création */}
                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="font-medium">Créer un nouveau client</h3>
                        
                       
                        
                        <div className="grid grid-cols-2 gap-4">
                            
                            <div className="grid gap-2">
                                <Label htmlFor="client-telephone">Téléphone</Label>
                                <Input
                                    id="client-telephone"
                                    value={newClient.telephone}
                                    onChange={(e) => setNewClient({...newClient, telephone: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button 
                                variant="outline" 
                                onClick={() => setIsOpen(false)}
                            >
                                Annuler
                            </Button>
                            <Button 
                                onClick={handleCreateClient}
                                disabled={isCreating || !newClient.telephone.trim()}
                            >
                                {isCreating ? 'Création...' : 'Créer et sélectionner'}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}