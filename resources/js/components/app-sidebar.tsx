import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { PageProps, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { AlertCircle, BanknoteIcon, BookOpen, BookOpenCheck, BoxIcon, Calendar, Coins, CoinsIcon, Currency, FileOutput, FileText, Folder, Gift, GiftIcon, HomeIcon, LayoutGrid, Package, PersonStanding, PersonStandingIcon, Plane, ScatterChart, Scissors, ScissorsIcon, ScissorsLineDashed, ShoppingBasket, StarHalfIcon, Truck, UserCheck2, UserCog, Users, UserSquare, Wallet, Warehouse } from 'lucide-react';
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
            roles: ['admin', 'gerant', 'coiffeur', "caissier"],
        },
        {
            title: 'Gestion Clients',
            icon: UserSquare,
            roles: ['admin', 'gerant', 'coiffeur', "caissier"],
            items: [
                {
                    title: 'Clients',
                    href: '/clients',
                    icon: UserSquare,
                    roles: ['admin', 'gerant', 'coiffeur', "caissier"],
                },
            ],
        },
        {
            title: 'Les Produits',
            icon: Package,
            roles: ['admin', 'gerant', 'coiffeur', "caissier"],
            items: [
                {
                    title: 'Produits',
                    href: '/produits',
                    icon: ShoppingBasket,
                    roles: ['admin'],
                },
                {
                    title: 'Categories',
                    href: '/categories',
                    icon: BoxIcon,
                    roles: ['admin'],
                },
                {
                    title: 'Stock',
                    href: '/stocks',
                    icon: Warehouse,
                    roles: ['admin', 'gerant'],
                },
                
            ],
        },
        {
            title: 'Ventes et Réservations',
            icon: ShoppingBasket,
            roles: ['admin', 'gerant', 'caissier'],
            items: [
                {
                    title: 'Ventes',
                    href: '/ventes',
                    icon: ShoppingBasket,
                    roles: ['admin', 'gerant', 'caissier'],
                },
                {
                    title: 'Réservations',
                    href: '/reservations',
                    icon: HomeIcon,
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
               
                {
                    title: 'Services',
                    href: '/services',
                    icon: Scissors,
                    roles: ['admin','gerant'],
                },
                
                {
                    title : 'Points et Fidelités',
                    href : '/points',
                    icon : CoinsIcon,
                    roles : ['admin','gerant']
                },
                {
                    title: 'Gestion des devises',
                    href: '/currencies',
                    icon: Currency,
                    roles: ['admin','gerant'],
                },
            ],
        },
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
        },
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
                    title: 'Services',
                    href: '/statistiques-services',
                    icon: Scissors,
                    roles: ['admin' ],
                },
                {
                    title: 'Produits',
                    href: '/statistiques-produits',
                    icon: Package,
                    roles: ['admin' ],
                },
                {
                    title: 'Ventes',
                    href: '/statistiques-ventes',
                    icon: ShoppingBasket,
                    roles: ['admin' , 'gerant'],
                },
               
            ],

        },
        {
            title : 'Programme de Fidelité',
            icon : Gift,
            href : '/fidelite',
            roles : ['admin', 'gerant','caissier'],
        },
        {
            title: 'Alertes',
            icon: AlertCircle,
            href: '/alerts',
            roles: ['admin', 'gerant', 'caissier'],
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
            roles: ['admin', 'gerant', 'caissier', 'coiffeur'],
        },
        {
            title: 'Rapport de Vente',
            icon: FileText,
            href: '/mon-reports',
            roles: ['caissier'],
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