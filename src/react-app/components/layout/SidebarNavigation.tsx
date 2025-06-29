/**
 * Main Navigation Component
 * Following TanStack Router patterns and UI guidelines
 */

import { Link, useRouter } from '@tanstack/react-router';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavigationItem[];
}

// Simple icon components (replace with proper icon library)
const DashboardIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
  </svg>
);

const ContactsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const CompaniesIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const DealsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ProductsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const OrdersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const MeetingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const TransactionsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
  { 
    name: 'Contacts', 
    href: '/contacts', 
    icon: ContactsIcon,
    children: [
      { name: 'All Contacts', href: '/contacts', icon: ContactsIcon },
      { name: 'Add Contact', href: '/contacts/new', icon: ContactsIcon },
    ]
  },
  { 
    name: 'Companies', 
    href: '/companies', 
    icon: CompaniesIcon,
    children: [
      { name: 'All Companies', href: '/companies', icon: CompaniesIcon },
      { name: 'Add Company', href: '/companies/new', icon: CompaniesIcon },
    ]
  },
  { 
    name: 'Deals', 
    href: '/deals', 
    icon: DealsIcon,
    children: [
      { name: 'Pipeline', href: '/deals', icon: DealsIcon },
      { name: 'Add Deal', href: '/deals/new', icon: DealsIcon },
    ]
  },
  { 
    name: 'Products', 
    href: '/products', 
    icon: ProductsIcon,
    children: [
      { name: 'All Products', href: '/products', icon: ProductsIcon },
      { name: 'Add Product', href: '/products/new', icon: ProductsIcon },
    ]
  },
  { 
    name: 'Orders', 
    href: '/orders', 
    icon: OrdersIcon,
    children: [
      { name: 'All Orders', href: '/orders', icon: OrdersIcon },
      { name: 'Create Order', href: '/orders/new', icon: OrdersIcon },
    ]
  },
  { 
    name: 'Meetings', 
    href: '/meetings', 
    icon: MeetingsIcon,
    children: [
      { name: 'Calendar', href: '/meetings', icon: MeetingsIcon },
      { name: 'Schedule Meeting', href: '/meetings/new', icon: MeetingsIcon },
    ]
  },
  { 
    name: 'Transactions', 
    href: '/transactions', 
    icon: TransactionsIcon,
    children: [
      { name: 'All Transactions', href: '/transactions', icon: TransactionsIcon },
      { name: 'Add Transaction', href: '/transactions/new', icon: TransactionsIcon },
    ]
  },
];

interface SidebarNavigationProps {
  className?: string;
}

export function SidebarNavigation({ className = '' }: SidebarNavigationProps) {
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return currentPath === '/dashboard';
    }
    return currentPath.startsWith(href);
  };

  return (
    <nav className={`space-y-1 ${className}`}>
      {navigation.map((item) => {
        const active = isActive(item.href);
        
        return (
          <div key={item.name}>
            <Link
              to={item.href}
              className={`
                group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                ${active 
                  ? 'bg-oklch(0.95 0.02 240) text-oklch(0.2 0.15 240) border-l-4 border-oklch(0.5 0.15 240)' 
                  : 'text-oklch(0.4 0.1 240) hover:bg-oklch(0.98 0.01 240) hover:text-oklch(0.2 0.15 240)'
                }
              `}
            >
              <item.icon
                className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors ${
                  active ? 'text-oklch(0.5 0.15 240)' : 'text-oklch(0.6 0.08 240) group-hover:text-oklch(0.5 0.15 240)'
                }`}
              />
              {item.name}
            </Link>
            
            {/* Sub-navigation for active sections */}
            {active && item.children && (
              <div className="ml-10 mt-1 space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.name}
                    to={child.href}
                    className={`
                      group flex items-center px-2 py-1 text-xs font-medium rounded-md transition-colors
                      ${currentPath === child.href
                        ? 'text-oklch(0.2 0.15 240) bg-oklch(0.96 0.01 240)'
                        : 'text-oklch(0.5 0.08 240) hover:text-oklch(0.3 0.12 240) hover:bg-oklch(0.98 0.005 240)'
                      }
                    `}
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export default SidebarNavigation;
