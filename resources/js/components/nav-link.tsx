import { Link } from '@inertiajs/react';
import { type NavItem } from '@/types';

export function NavLink({ item, isSubItem = false }: { item: NavItem; isSubItem?: boolean }) {
  return (
    <Link
      href={item.href || '#'}
      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground ${
        isSubItem ? 'pl-9' : ''
      }`}
    >
      {!isSubItem && item.icon && <item.icon className="h-4 w-4" />}
      <span className={`${isSubItem ? 'ml-3' : 'ml-3'}`}>{item.title}</span>
    </Link>
  );
}