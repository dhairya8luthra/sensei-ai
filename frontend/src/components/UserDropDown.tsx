import { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface UserDropdownProps {
  user: any;
}

export default function UserDropdown({ user }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return email[0].toUpperCase();
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = getInitials(user?.user_metadata?.full_name, user?.email);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg bg-gradient-to-r from-emerald-900/40 to-slate-900/40 backdrop-blur-sm border border-emerald-700/30 hover:border-emerald-500/50 transition-all duration-300 group"
      >
        {/* Avatar */}
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center">
          <span className="text-sm font-bold text-white">{initials}</span>
        </div>
        
        {/* User Info */}
        <div className="hidden md:block text-left">
          <p className="text-emerald-200 font-medium text-sm">{displayName}</p>
          <p className="text-gray-400 text-xs">Sensei Student</p>
        </div>
        
        <ChevronDown className={`w-4 h-4 text-emerald-400 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gradient-to-br from-emerald-900/90 to-slate-900/90 backdrop-blur-sm rounded-lg border border-emerald-700/30 shadow-xl overflow-hidden z-50">
          {/* User Info Header */}
          <div className="p-4 border-b border-emerald-700/30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center">
                <span className="font-bold text-white">{initials}</span>
              </div>
              <div>
                <p className="text-emerald-200 font-medium">{displayName}</p>
                <p className="text-gray-400 text-sm">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-emerald-800/30 hover:text-emerald-200 transition-all duration-200">
              <User className="w-4 h-4" />
              <span>Profile Settings</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-emerald-800/30 hover:text-emerald-200 transition-all duration-200">
              <Settings className="w-4 h-4" />
              <span>Preferences</span>
            </button>
            
            <hr className="my-2 border-emerald-700/30" />
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-300 hover:bg-red-900/30 hover:text-red-200 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}