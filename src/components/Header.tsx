import React, { useState, useEffect } from 'react';
import { Bell, MapPin, Calendar as CalendarIcon, Clock, ChevronDown, CheckCircle, Settings } from 'lucide-react';
import { Leader, Notification } from '../types';

export default function Header({
  notifications,
  onMarkNotificationsAsRead,
  isFirebaseConnected
}: {
  notifications: Notification[],
  onMarkNotificationsAsRead: () => void,
  isFirebaseConnected: boolean
}) {
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white border-b border-[#E2E8F0] shadow-sm sticky top-0 z-50">
      <div className="h-16 px-4 md:px-6 flex items-center justify-between">
        
        {/* Left Side: Info */}
        <div className="flex items-center gap-6">
          
          {/* Logo Placeholder Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center">
              <span className="font-serif font-bold text-white text-xs">3C</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-5 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#1E40AF]" />
              <span>Fortaleza, Ceará</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-[#1E40AF]" />
              <span>{currentTime.toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#1E40AF]" />
              <span>{currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Profile & Actions */}
        <div className="flex items-center gap-4">
          
          {/* System Status */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-200">
            <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            <span className="text-[10px] font-bold text-slate-600 uppercase">
              {isFirebaseConnected ? 'Sistema Online' : 'Desconectado'}
            </span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotificationDropdown(!showNotificationDropdown);
                if (!showNotificationDropdown && unreadCount > 0) {
                  onMarkNotificationsAsRead();
                }
              }}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 relative transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
              )}
            </button>

            {showNotificationDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E2E8F0] rounded-xl shadow-xl py-1 z-50">
                <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-800">Notificações</span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-slate-500">
                      Nenhuma notificação recente.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <p className="text-xs font-bold text-slate-800">{notif.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <button className="p-2 rounded-full hover:bg-slate-100 text-slate-600 hidden md:block">
            <Settings className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-slate-200 hidden md:block mx-1"></div>

          {/* Profile */}
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-[#0F172A] leading-tight">Cristiane Fialho</span>
              <span className="text-[10px] font-medium text-slate-500">Administrador</span>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" 
              alt="Profile" 
              className="w-9 h-9 rounded-full object-cover border-2 border-slate-100 shadow-sm"
            />
            <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
          </div>

        </div>
      </div>
    </header>
  );
}
