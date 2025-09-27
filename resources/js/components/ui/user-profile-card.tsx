// components/ui/user-profile-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MailIcon, PhoneIcon, MapPinIcon, UserIcon, ClockIcon, LaptopIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface UserProfileCardProps {
  user: {
    name: string;
    email: string;
    avatar_url: string | null;
    telephone: string | null;
    adresse: string | null;
    date_embauche: string | null;
    role: string;
    is_active: boolean;
    last_login_at: string | null;
    last_login_ip: string | null;
    succursale?: {
      name: string;
    } | null;
  };
  onEdit?: () => void;
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  console.log(user)
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Profil Utilisateur</CardTitle>
          <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback>
                <UserIcon className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center gap-4">
            
            
          </div>

          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-lg">Informations Personnelles</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-center">
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  <Badge variant={user.is_active ? "default" : "secondary"} className="mt-1">
                    {user.is_active ? "Actif" : "Inactif"}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <MailIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p>{user.email}</p>
                  </div>
                </div>

                {user.telephone && (
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Téléphone</p>
                      <p>{user.telephone}</p>
                    </div>
                  </div>
                )}

                {user.adresse && (
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Adresse</p>
                      <p>{user.adresse}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <UserIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Rôle</p>
                    <Badge variant="outline" className="capitalize">
                      {user.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-lg">Informations Professionnelles</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.date_embauche && (
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date d'embauche</p>
                      <p>
                        {format(new Date(user.date_embauche), "PPP", { locale: fr })}
                      </p>
                    </div>
                  </div>
                )}

                {user.succursale && (
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Succursale</p>
                      <p>{user.succursale.name}</p>
                    </div>
                  </div>
                )}

                {user.last_login_at && (
                  <div className="flex items-center gap-3">
                    <ClockIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Dernière connexion</p>
                      <p>
                        {format(new Date(user.last_login_at), "PPpp", { locale: fr })}
                      </p>
                    </div>
                  </div>
                )}

                {user.last_login_ip && (
                  <div className="flex items-center gap-3">
                    <LaptopIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">IP de connexion</p>
                      <p>{user.last_login_ip}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}