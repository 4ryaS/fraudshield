import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertTriangle, BarChart3, FileUp, Home, LogOut } from 'lucide-react';
import { cn } from '../utils/cn';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const navItems = isAdmin
    ? [
        { icon: Home, label: 'Dashboard', href: '/admin' },
        { icon: AlertTriangle, label: 'Fraud Cases', href: '/admin/cases' },
        { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
      ]
    : [
        { icon: Home, label: 'Dashboard', href: '/' },
        { icon: FileUp, label: 'Upload', href: '/upload' },
        { icon: BarChart3, label: 'History', href: '/history' },
      ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-blue-600">
            {isAdmin ? 'Admin Portal' : 'Bank Portal'}
          </h1>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                location.pathname === item.href
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 w-64 px-4">
          <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
          <h2 className="text-lg font-medium text-gray-800">
            {location.pathname === '/' && 'Dashboard'}
            {location.pathname === '/upload' && 'Upload Transactions'}
            {location.pathname === '/history' && 'Transaction History'}
            {location.pathname === '/admin' && 'Admin Dashboard'}
            {location.pathname === '/admin/cases' && 'Fraud Cases'}
            {location.pathname === '/admin/analytics' && 'Analytics'}
          </h2>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}