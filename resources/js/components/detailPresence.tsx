import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axios from "axios";
import { Pointage } from "@/types";
import { useState } from "react";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AvatarImage, AvatarFallback, Avatar } from "@radix-ui/react-avatar";

export function DetailPresence({ pointage }: { pointage: Pointage }) {
   
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
            <Button variant="outline" size="sm">
                <Eye className="h-4 w-4" />
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Detail du pointage</DialogTitle>
            <DialogDescription>
                Détails du pointage
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center">
            {pointage.agent.avatar_url ? (
                <Avatar>
                <AvatarImage className="w-48 h-48 rounded-full"  src={pointage.agent.avatar_url} />
                <AvatarFallback className="w-48 h-48 rounded-full bg-accent">{pointage.agent.nom.charAt(0) + pointage.agent.postnom.charAt(0) + pointage.agent.prenom.charAt(0)}</AvatarFallback>
            </Avatar>
            ) : (
                <Avatar className="w-48 h-48 bg-accent rounded-full">
                    {pointage.agent.sexe === 'Masculin' ? (
                        <AvatarImage className="w-48 h-48 rounded-full"  src="images/icons/male.png" />
                    ) : (
                        <AvatarImage className="w-48 h-48 rounded-full"  src="images/icons/female.png" />
                    )}
                </Avatar>
            )}
          </div>
          <div className="grid gap-4">
            
            <p> Agent : <span className="font-semibold">{pointage.agent.nom} {pointage.agent.postnom} {pointage.agent.prenom}</span></p>
            <p>Date : <span className="font-semibold">{format(pointage.date, 'PPP' , { locale: fr })}</span></p>
            <p>Statut : <span className="font-semibold">{pointage.statut === 'present' ? 'Présent' : pointage.statut === 'absent' ? 'Absent' : pointage.statut === 'conge' ? 'Congé' : pointage.statut === 'malade' ? 'Malade' : pointage.statut === 'formation' ? 'Formation' : pointage.statut === 'mission' ? 'Mission' : pointage.statut}</span></p>
            <p>Justification : <span className="font-semibold">{pointage.justification}</span></p>
            <p>Notes : <span className="font-semibold">{pointage.notes}</span></p>
            <p>Justifié : <span className="font-semibold">{pointage.justifie ? 'Oui' : 'Non'}</span></p>
            <ul>
                {pointage.heure_arrivee && <li>Heure d'arrivée : <Badge variant={pointage?.statut_arrivee === 'a-lheure' ? 'default' : 'destructive'}>   {pointage?.heure_arrivee} </Badge> <span className="ml-2 font-semibold">{pointage?.statut_arrivee === 'en-retard' ? 'En retard' : 'Arrivée à l\'heure'}</span></li>}
                {pointage.heure_depart && <li>Heure de départ : <Badge variant={pointage?.statut_depart === 'a-lheure' ? 'default' : 'destructive'}>   {pointage?.heure_depart} </Badge> <span className="ml-2 font-semibold">{pointage?.statut_depart === 'parti-tot' ? 'Parti-tot' : 'Départ à l\'heure'}</span></li>}
            </ul>          
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Fermer</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
