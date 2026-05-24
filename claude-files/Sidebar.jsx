'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  Phone,
  Calendar,
  BarChart3,
  Settings,
  Coffee,
  DoorOpen,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Companies', href: '/companies', icon: Building2 },
  { name: 'Attendance', href: '/attendance', icon: Clock },
  { name: 'Calls', href: '/calls', icon: Phone },
  { name: 'Meetings', href: '/meetings', icon: Calendar },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href) => pathname === href;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 p-2 rounded-lg hover:bg-slate-800 md:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-950 to-slate-900 border-r border-cyan-500/20 backdrop-blur-xl transition-transform duration-300 z-30 flex flex-col md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              CRM
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">by LeadsRift</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-cyan-600 to-cyan-500/50 text-white shadow-lg shadow-cyan-500/20'
                    : 'text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/5'
                }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Action Buttons */}
        <div className="p-4 border-t border-cyan-500/20 space-y-2">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-yellow-600/30 hover:bg-yellow-600/40 text-yellow-300 border border-yellow-500/30 font-medium transition-all duration-200">
            <Coffee size={18} />
            <span>Break</span>
          </button>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600/30 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 font-medium transition-all duration-200">
            <DoorOpen size={18} />
            <span>Washroom</span>
          </button>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600/30 hover:bg-red-600/40 text-red-300 border border-red-500/30 font-medium transition-all duration-200">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}
