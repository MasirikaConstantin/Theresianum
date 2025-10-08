import { useState } from 'react';
import { router } from '@inertiajs/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Reservation } from '@/types';
import { Dollar } from '@/hooks/Currencies';

export default function UpdatePaiementStatus({ reservation } :{reservation : Reservation}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [paiementData, setPaiementData] = useState({
    statut_paiement: reservation.statut_paiement,
    type_paiement: reservation.type_paiement
  });

  const handleUpdatePaiement = async () => {
    setIsUpdating(true);

    try {
      await router.post(route('reservations.update-status-paiement'), {
        reservation_id: reservation.id,
        ...paiementData
      }, {
        onSuccess: () => {},
        onError: (errors) => {
          console.error('Erreur lors de la mise à jour:', errors);
        },
        onFinish: () => {
          setIsUpdating(false);
        }
      });
    } catch (error) {
      console.error('Erreur:', error);
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (statut) => {
    const statusConfig = {
      paye: { class: 'bg-green-100 text-green-800', label: 'Payé' },
      non_paye: { class: 'bg-red-100 text-red-800', label: 'Non Payé' }
    };

    const config = statusConfig[statut] || { class: 'bg-gray-100 text-gray-800', label: statut };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const getTypePaiementBadge = (type) => {
    const typeConfig = {
      espece: { class: 'bg-blue-100 text-blue-800', label: 'Espèce' },
      cheque: { class: 'bg-purple-100 text-purple-800', label: 'Chèque' },
      virement: { class: 'bg-indigo-100 text-indigo-800', label: 'Virement' }
    };

    const config = typeConfig[type ] || { class: 'bg-gray-100 text-gray-800', label: type };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
        {config.label}
      </span>
    );
  };

  return (
    <>
      {/* Carte de statut actuel */}
      <div className="bg-card p-4 rounded-lg shadow border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium">Statut de Paiement</h3>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Modifier</Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Modifier le statut de paiement</DialogTitle>
                <DialogDescription>
                  Mettez à jour le statut et le type de paiement de cette réservation.
                </DialogDescription>
              </DialogHeader>

              {/* Statut de paiement */}
              <div className="space-y-2">
                <Label>Statut de paiement</Label>
                <Select
                  value={paiementData.statut_paiement}
                  onValueChange={(value) => setPaiementData(prev => ({
                    ...prev,
                    statut_paiement: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="non_paye">Non Payé</SelectItem>
                    <SelectItem value="paye">Payé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Type de paiement */}
              <div className="space-y-2 mt-4">
                <Label>Type de paiement</Label>
                <Select
                  value={paiementData.type_paiement}
                  onValueChange={(value) => setPaiementData(prev => ({
                    ...prev,
                    type_paiement: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="espece">Espèce</SelectItem>
                    <SelectItem value="cheque">Chèque</SelectItem>
                    <SelectItem value="virement">Virement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="mt-6">
                <Button variant="outline">Annuler</Button>
                <Button onClick={handleUpdatePaiement} disabled={isUpdating}>
                  {isUpdating ? "Mise à jour..." : "Mettre à jour"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Statut:</span>
            <div className="mt-1">
              {getStatusBadge(reservation.statut_paiement)}
            </div>
          </div>
          <div>
            <span className="font-medium">Type:</span>
            <div className="mt-1">
              {getTypePaiementBadge(reservation.type_paiement)}
            </div>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4 text-sm mt-4'>
            <div className="">
              <span className="font-medium text-gray-500">Montant:</span>
              <div className="mt-1 text-lg font-semibold">
                {Dollar(reservation.prix_total)}
              </div>
            </div>

            <div className="">
              <span className="font-medium text-gray-500">Montant restant:</span>
              <div className="mt-1 text-lg font-semibold text-red-500">
                -  {Dollar(reservation.prix_total - reservation.montant_payer)}
              </div>
          </div>
        </div>
      </div>
    </>
  );
}
