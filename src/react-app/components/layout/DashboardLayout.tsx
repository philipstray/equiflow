/**
 * Main Dashboard Layout Component
 * Implements responsive layout with sidebar navigation
 */

import { useState } from 'react';
import { Outlet } from '@tanstack/react-router';
import SidebarNavigation from './SidebarNavigation';

// Simple hamburger menu icon
const MenuIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-oklch(0.99 0.005 240)">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 flex z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-oklch(0.2 0.05 240 / 0.6)" />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <CloseIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <h1 className="text-xl font-bold text-oklch(0.2 0.15 240)">Equiflow</h1>
              </div>
              <SidebarNavigation className="mt-5 px-2" />
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-oklch(0.9 0.02 240) bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-xl font-bold text-oklch(0.2 0.15 240)">Equiflow</h1>
              </div>
              <SidebarNavigation className="mt-5 flex-1 px-2 space-y-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top navigation bar */}
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-oklch(0.5 0.1 240) hover:text-oklch(0.2 0.15 240) focus:outline-none focus:ring-2 focus:ring-oklch(0.5 0.15 240)"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Page header */}
        <header className="bg-white border-b border-oklch(0.9 0.02 240) px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-oklch(0.15 0.1 240)">
                {/* This would be dynamically set based on current route */}
                Dashboard
              </h2>
            </div>
            
            {/* Header actions */}
            <div className="flex items-center space-x-3">
              <button className="bg-oklch(0.5 0.15 240) text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-oklch(0.45 0.15 240) transition-colors">
                Quick Add
              </button>
              
              {/* User menu placeholder */}
              <div className="relative">
                <button className="bg-oklch(0.9 0.02 240) p-2 rounded-full text-oklch(0.4 0.1 240) hover:text-oklch(0.2 0.15 240)">
                  <span className="sr-only">Open user menu</span>
                  <div className="h-6 w-6 rounded-full bg-oklch(0.5 0.15 240) flex items-center justify-center text-white text-sm font-medium">
                    U
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children || <Outlet />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
