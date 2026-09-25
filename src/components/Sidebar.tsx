import React from 'react';
import { Home, Shirt, User as UserIcon, BookOpen, Settings, LogOut, LogIn, Sparkles, Compass } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenGuide: () => void;
  onOpenArchitecture: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenGuide,
  onOpenArchitecture,
}) => {
  return (
    <aside className="w-20 md:w-64 bg-white border-r border-neutral-200 h-screen sticky top-0 flex flex-col justify-between p-3 md:p-5 z-30 select-none">
      {/* Brand Header */}
      <div>
        <div 
          onClick={() => setCurrentTab('feed')}
          className="flex items-center gap-3 cursor-pointer group mb-8 px-1"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#E60023] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-red-500/20 group-hover:scale-105 transition-all">
            V
          </div>
          <div className="hidden md:block">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-neutral-900 text-lg tracking-tight">Audition</span>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-red-100 text-[#E60023] px-1.5 py-0.5 rounded">Remix</span>
            </div>
            <p className="text-xs text-neutral-500 font-medium">Việt Phục x Gen-Z</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-2">
          <button
            onClick={() => setCurrentTab('feed')}
            className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl text-sm font-semibold transition-all ${
              currentTab === 'feed'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
            title="Bảng Tin (Social Feed)"
          >
            <Home className="w-5 h-5 shrink-0" />
            <span className="hidden md:inline">Khám Phá (Feed)</span>
          </button>

          <button
            onClick={() => setCurrentTab('wardrobe')}
            className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl text-sm font-semibold transition-all relative ${
              currentTab === 'wardrobe'
                ? 'bg-[#E60023] text-white shadow-md shadow-red-500/25'
                : 'text-neutral-600 hover:bg-red-50 hover:text-[#E60023]'
            }`}
            title="Phòng Thử Đồ (Fitting Room)"
          >
            <Shirt className="w-5 h-5 shrink-0" />
            <span className="hidden md:inline">Phòng Thử Đồ</span>
            <span className="hidden md:flex items-center text-[10px] bg-white/20 text-white font-bold px-1.5 py-0.5 rounded-full ml-auto">
              <Sparkles className="w-3 h-3 mr-0.5" /> AI
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('profile')}
            className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl text-sm font-semibold transition-all ${
              currentTab === 'profile'
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
            title="Trang Cá Nhân (Profile)"
          >
            <UserIcon className="w-5 h-5 shrink-0" />
            <span className="hidden md:inline">Trang Cá Nhân</span>
          </button>

          <div className="pt-4 border-t border-neutral-100 mt-4 space-y-1">
            <button
              onClick={onOpenGuide}
              className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
              title="Điển Cố Cổ Phục"
            >
              <BookOpen className="w-5 h-5 shrink-0 text-amber-600" />
              <span className="hidden md:inline">Điển Cố Cổ Phục</span>
            </button>

            <button
              onClick={onOpenArchitecture}
              className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
              title="Kiến Trúc Spring Boot 3"
            >
              <Settings className="w-5 h-5 shrink-0 text-neutral-500" />
              <span className="hidden md:inline">Spring Boot & H2</span>
            </button>
          </div>
        </nav>
      </div>

      {/* User Section at Bottom */}
      <div className="pt-4 border-t border-neutral-100">
        {currentUser ? (
          <div className="flex items-center justify-between p-1.5 rounded-2xl hover:bg-neutral-50 transition-colors">
            <div 
              onClick={() => setCurrentTab('profile')}
              className="flex items-center gap-2.5 cursor-pointer overflow-hidden"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-neutral-200 shrink-0"
              />
              <div className="hidden md:block truncate text-left">
                <p className="text-xs font-bold text-neutral-900 truncate leading-tight">
                  {currentUser.fullName}
                </p>
                <p className="text-[11px] text-neutral-500 truncate">
                  @{currentUser.username}
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="hidden md:flex p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-[#E60023] text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden md:inline">Đăng Nhập</span>
          </button>
        )}
      </div>
    </aside>
  );
};
