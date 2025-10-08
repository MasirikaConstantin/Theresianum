import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { PageProps, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { AlertCircle, Banknote, BanknoteIcon, Bed, BookOpen, BookOpenCheck, BoxIcon, Calendar, Coins, CoinsIcon, Currency, FileOutput, FileText, Folder, Gift, GiftIcon, HomeIcon, LayoutGrid, Package, PersonStanding, PersonStandingIcon, Plane, ScatterChart, Scissors, ScissorsIcon, ScissorsLineDashed, ShoppingBasket, StarHalfIcon, Truck, UserCheck2, UserCog, Users, UserSquare, Wallet, Warehouse } from 'lucide-react';
import AppLogo from './app-logo';

const filterItemsByRole = (items: NavItem[], userRole: string): NavItem[] => {
    return items
        .filter(item => !item.roles || item.roles.includes(userRole))
        .map(item => {
            if (item.items) {
                return {
                    ...item,
                    items: filterItemsByRole(item.items, userRole)
                };
            }
            return item;
        });
};

const getMainNavItems = (userRole: string): NavItem[] => {
    const allItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
            roles: ['admin', 'gerant', 'coiffeur', "vendeur"],
        },
        {
            title: 'Gestion Clients',
            icon: UserSquare,
            roles: ['admin', 'gerant', 'coiffeur', "vendeur"],
            items: [
                {
                    title: 'Clients',
                    href: '/clients',
                    icon: UserSquare,
                    roles: ['admin', 'gerant', 'coiffeur', "vendeur"],
                },
            ],
        },
        {
            title: 'Les Produits',
            icon: Package,
            roles: ['admin', 'gerant', "vendeur"],
            items: [
                {
                    title: 'Produits',
                    href: '/produits',
                    icon: ShoppingBasket,
                    roles: ['admin', 'gerant', "vendeur"],
                },
                {
                    title: 'Categories',
                    href: '/categories',
                    icon: BoxIcon,
                    roles: ['admin',"gerant"],
                },
                {
                    title: 'Stock',
                    href: '/stocks',
                    icon: Warehouse,
                    roles: ['admin', 'gerant', "vendeur"],
                },
                
            ],
        },
        {
            title : 'Chambres et Salles',
            icon : HomeIcon,
            roles : ['admin', 'gerant'],
            items : [
                {
                    title : 'Chambres',
                    href : '/chambres',
                    icon : HomeIcon,
                    roles : ['admin', 'gerant'],
                },
                {
                    title : 'Salles',
                    href : '/salles',
                    icon : HomeIcon,
                    roles : ['admin', 'gerant'],
                },
            ]
        },
        {
            title: 'Ventes et Réservations',
            icon: ShoppingBasket,
            roles: ['admin', 'gerant', 'vendeur'],
            items: [
                {
                    title: 'Ventes',
                    href: '/ventes',
                    icon: ShoppingBasket,
                    roles: ['admin', 'gerant', 'vendeur'],
                },
                {
                    title: 'Réserv. Salles',
                    href: '/reservations',
                    icon: HomeIcon,
                    roles: ['admin', 'gerant', 'vendeur'],
                },
                {
                    title: 'Réserv. Chambres',
                    href: '/chambres-reservations',
                    icon: Bed,
                    roles: ['admin', 'gerant', 'vendeur'],
                },
                {
                    title: 'Acompte',
                    href: '/acomptes',
                    icon: Banknote,
                    roles: ['admin', 'gerant', 'caissier'],
                },
                {
                    title: 'Historique des Paiements',
                    href: '/historique',
                    icon: Banknote,
                    roles: ['admin', 'gerant', 'caissier'],
                },
            ],
        },
        {
            title: 'Administration',
            icon: UserCheck2,
            roles: ['admin', 'gerant'],
            items: [
                {
                    title: 'Utilisateurs',
                    href: '/utilisateurs',
                    icon: UserCog,
                    roles: ['admin', 'gerant'],
                },
               
                /*{
                    title : 'Points et Fidelités',
                    href : '/points',
                    icon : CoinsIcon,
                    roles : ['admin','gerant']
                },*/
                {
                    title: 'Gestion des devises',
                    href: '/currencies',
                    icon: Currency,
                    roles: ['admin','gerant'],
                },
            ],
        },
        /*
        {
            title : 'Gestion du Personnel',
            icon : PersonStanding,
            roles : ['admin', 'gerant'],
            items : [
                {
                    title : 'Personnel',
                    href : '/personnels',
                    icon : PersonStandingIcon,
                    roles : ['admin', 'gerant'],
                },
                {
                    title : 'Contrats',
                    href : '/contrats',
                    icon : BookOpenCheck,
                    roles : ['admin', 'gerant'],
                },
                {
                    title : 'Gestion de Paie',
                    href : '/paies',
                    icon : BanknoteIcon,
                    roles : ['admin', 'gerant'],
                },
                {
                    title : 'Congés',
                    href : '/conges',
                    icon : Plane,
                    roles : ['admin', 'gerant'],
                },
                {
                    title : 'Presences',
                    href : '/pointages',
                    icon : Calendar,
                    roles : ['admin', 'gerant'],
                },
                {
                    title : 'Rapport de Présence',
                    href : '/rapport-presence',
                    icon : Calendar,
                    roles : ['admin', 'gerant'],
                },
            ]
        },*/
        {
            title: 'Statistiques',
            icon: ScatterChart,
            roles: ['admin', 'gerant'],
            items: [
                {
                    title: 'Rapport de Vente',
                    href: '/reports/sales',
                    icon: FileText,
                    roles: ['admin','gerant'],
                },
                {
                    title: 'Par Categories',
                    href: '/statistiques-categories',
                    icon: Package,
                    roles: ['admin' ],
                },
                {
                    title: 'Vendeurs',
                    href: '/statistiques-vendeurs',
                    icon: UserCog,
                    roles: ['admin','gerant'],
                },
               
                {
                    title: 'Produits',
                    href: '/statistiques-produits',
                    icon: Package,
                    roles: ['admin' ],
                }
            ],

        },
        /*{
            title : 'Programme de Fidelité',
            icon : Gift,
            href : '/fidelite',
            roles : ['admin', 'gerant','vendeur'],
        },*/
        {
            title: 'Alertes',
            icon: AlertCircle,
            href: '/alerts',
            roles: ['admin', 'gerant', 'vendeur'],
        },
        {
            title: 'Caisse',
            icon: Wallet,
            href: '/caisses',
            roles: ['admin', 'gerant'],
        },
        {
            title: 'Depenses',
            icon: FileOutput,
            href: '/depenses',
            roles: ['admin', 'gerant', 'vendeur', 'coiffeur'],
        },
        {
            title: 'Rapport de Vente',
            icon: FileText,
            href: '/mon-reports',
            roles: ['vendeur'],
        },
       
    ];

    return filterItemsByRole(allItems, userRole);
};
const footerNavItems: NavItem[] = [
    {
        title: 'Documentation',
        href: '/documentations',
        icon: BookOpen,
    },
];
export function AppSidebar() {
    const { auth } = usePage().props;
    const userRole = auth.user.role;
    const filteredNavItems = getMainNavItems(userRole);
    
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
            {/*<NavFooter items={footerNavItems} className="mt-auto" />*/}

                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}