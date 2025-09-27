import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { PageProps, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { AlertCircle, BookOpen, BoxIcon, Calendar, Coins, CoinsIcon, Currency, FileOutput, FileText, Folder, Gift, HomeIcon, Key, LayoutGrid, Package, ScatterChart, Scissors, ScissorsIcon, ScissorsLineDashed, ShoppingBasket, Truck, UserCheck2, UserCog, Users, Wallet, Warehouse } from 'lucide-react';
import AppLogo from './app-logo-documentation';

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
            title: 'Authentification',
            icon: Key,
            roles: ['admin', 'gerant', 'coiffeur', "caissier"],
            items: [
                {
                    title: 'Connexion',
                    icon: Calendar,
                    href: '/login',
                    roles: ['admin', 'gerant', 'coiffeur', "caissier"],
                },
                {
                    title: 'Inscription',
                    href: '/register',
                    icon: Users,
                    roles: ['admin', 'gerant', 'coiffeur', "caissier"],
                },
            ],
        },
        {
            title: 'Gestion Salon',
            icon: Scissors,
            roles: ['admin', 'gerant', 'coiffeur', "caissier"],
            items: [
                {
                    title: 'Rendez-vous',
                    icon: Calendar,
                    href: '/rendezvous',
                    roles: ['admin', 'gerant', 'coiffeur', "caissier"],
                },
                {
                    title: 'Clients',
                    href: '/clients',
                    icon: Users,
                    roles: ['admin', 'gerant', 'coiffeur', "caissier"],
                },
            ],
        },
        {
            title: 'Accueil',
            icon: Package,
            roles: ['admin', 'gerant', 'coiffeur', "caissier"],
            items: [
                {
                    title: 'Produits',
                    href: '/produits',
                    icon: ShoppingBasket,
                    roles: ['admin', 'gerant'],
                },
                {
                    title: 'Utilitaires',
                    href: '/utilitaires',
                    icon: Scissors,
                    roles: ['admin'],
                },
                {
                    title: 'Stock',
                    href: '/stocks',
                    icon: Warehouse,
                    roles: ['admin'],
                },
                {
                    title: 'Stock-Branche',
                    href: '/stock-succursales',
                    icon: Warehouse,
                    roles: ['admin', 'gerant', 'coiffeur', "caissier"],
                },
                {
                    title: 'Branche Accessoire',
                    href: '/accessoires',
                    icon: ScissorsLineDashed,
                    roles: ['admin', 'gerant', 'coiffeur', "caissier"],
                },
                
                {
                    title: 'Transferts',
                    href: '/transferts',
                    icon: Truck,
                    roles: ['admin', 'gerant'],
                },
            ],
        },
        {
            title: 'Ventes et Services',
            icon: ShoppingBasket,
            roles: ['admin', 'gerant', 'caissier'],
            items: [
                {
                    title: 'Ventes et Services',
                    href: '/ventes',
                    icon: ShoppingBasket,
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
                    roles: ['admin'],
                },
                {
                    title: 'Branche',
                    href: '/succursales',
                    icon: HomeIcon,
                    roles: ['admin'],
                },
                {
                    title : 'Points et Fidelités',
                    href : '/points',
                    icon : CoinsIcon,
                    roles : ['admin']
                },
                {
                    title: 'Gestion des devises',
                    href: '/currencies',
                    icon: Currency,
                    roles: ['admin'],
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
        {
            title: 'Statistiques',
            icon: ScatterChart,
            roles: ['admin'],
            items: [
                {
                    title: 'Rapport de Vente',
                    href: '/reports',
                    icon: FileText,
                    roles: ['admin'],
                },
                {
                    title: 'Vendeurs',
                    href: '/statistiques-vendeurs',
                    icon: UserCog,
                    roles: ['admin'],
                },
                {
                    title: 'Produits',
                    href: '/statistiques-produits',
                    icon: Package,
                    roles: ['admin'],
                },
                {
                    title: 'Ventes',
                    href: '/statistiques-ventes',
                    icon: ShoppingBasket,
                    roles: ['admin'],
                },
                /*{
                    title: 'Succursale',
                    href: '/statistiques-succursale',
                    icon: HomeIcon,
                    roles: ['admin'],
                },
                {
                    title: 'Clients',
                    href: '/statistiques-clients',
                    icon: Users,
                    roles: ['admin'],
                },*/
            ],

        },
    ];

    return filterItemsByRole(allItems, userRole);
};

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

            
        </Sidebar>
    );
}