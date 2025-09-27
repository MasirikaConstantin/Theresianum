import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { type NavItem } from '@/types';
import { NavLink } from './nav-link';

export function NavSubMenu({ item }: { item: NavItem }) {
  const [isOpen, setIsOpen] = useState(item.isOpen || false);

  if (!item.items) {
    return <NavLink item={item} />;
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
      >
        <div className="flex items-center gap-3">
          {item.icon && <item.icon className="h-4 w-4" />}
          <span>{item.title}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      {isOpen && (
        <div className="ml-6 space-y-1">
          {item.items.map((subItem, index) => (
            <NavLink key={index} item={subItem} isSubItem />
          ))}
        </div>
      )}
    </div>
  );
}