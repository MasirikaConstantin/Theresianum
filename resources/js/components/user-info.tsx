import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';

export function UserInfo({ user, showEmail = false, showRole = false }: { user: User; showEmail?: boolean ; showRole?: boolean }) {
    const getInitials = useInitials();
    const getUserRole = (role:string) =>{
        if (role==="admin") {
            return "Administrateur"
        }else if (role==="gerant") {
            return "Directrice des R.H"
        }else if (role==="coiffeur") {
            return "Coiffeur"
        }else if (role==="caissier") {
            return "Caissier"
        }else {
            return "Utilisateur"
        }
    }
    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full ">
                <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                {showEmail && <span className="truncate text-xs text-muted-foreground">{user.email}</span>}
                {showRole && <span className="truncate text-xs text-muted-foreground font-bold">{getUserRole(user.role)}</span>}
            </div>
        </>
    );
}
