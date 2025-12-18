
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  HomeIcon, UsersIcon, BriefcaseIcon, CogIcon, 
  MoonIcon, SunIcon, GlobeAltIcon, ArrowRightOnRectangleIcon,
  FolderIcon, Bars3Icon, XMarkIcon, PencilIcon, ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import { Department, Role, Employee } from '../types';
import { TRANSLATIONS } from '../constants';
import { UserProfileModal } from './UserProfileModal';

interface LayoutProps {
  children: React.ReactNode;
  userRole: Role;
  userDepartmentId?: string; // New prop for RBAC
  departments: Department[];
  lang: 'vi' | 'en';
  darkMode: boolean;
  toggleTheme: () => void;
  toggleLang: () => void;
  onLogout: () => void;
  appName: string;
  setAppName: (name: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, userRole, userDepartmentId, departments, lang, darkMode, toggleTheme, toggleLang, onLogout, appName, setAppName
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const location = useLocation();
  const t = TRANSLATIONS[lang];

  // Mock current user for demo
  const currentUserDisplay: Partial<Employee> = {
    fullName: userRole === Role.ADMIN ? 'Administrator' : 'Nhân viên',
    email: 'user@tbs.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=user',
    position: userRole,
    code: 'USR-01'
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const NavItem: React.FC<{ to: string, icon: any, label: string }> = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      onClick={() => setSidebarOpen(false)}
      className={`flex items-center px-4 py-3 mb-1 rounded-lg transition-all duration-200 ${
        isActive(to) 
          ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' 
          : 'text-gray-600 dark:text-gray-400 hover:bg-brand-50 dark:hover:bg-gray-800 hover:text-brand-600'
      }`}
    >
      <Icon className="w-5 h-5 mr-3" />
      <span className="font-medium">{label}</span>
    </Link>
  );

  // Filter departments for Sidebar
  const visibleDepartments = departments.filter(dept => {
      if (userRole === Role.ADMIN) return true;
      return dept.id === userDepartmentId;
  });

  // Auto-hide logic: Sidebar opens on hover of left edge or itself
  const handleMouseEnter = () => setSidebarOpen(true);
  const handleMouseLeave = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans relative">
      
      {/* Profile Modal */}
      <UserProfileModal 
        isOpen={showProfile} 
        onClose={() => setShowProfile(false)} 
        employee={currentUserDisplay}
        departmentName="TBS Group"
        lang={lang}
      />

      {/* HOVER TRIGGER ZONE (Left Edge) - Desktop Only */}
      <div 
        className="fixed top-0 left-0 h-full w-4 z-40 hidden lg:block hover:bg-brand-500/10 transition-colors cursor-pointer"
        onMouseEnter={handleMouseEnter}
      ></div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden backdrop-blur-sm" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-r border-gray-200 dark:border-gray-700 
        transform transition-transform duration-300 ease-in-out shadow-2xl
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
      `}>
        {/* Compact Header: h-14 */}
        <div className="flex items-center justify-between px-6 h-14 border-b border-gray-100 dark:border-gray-700 bg-brand-600 dark:bg-gray-900">
          <div className="flex items-center space-x-3 group text-white">
            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-brand-600 font-extrabold text-sm">T</span>
            </div>
            {isEditingName ? (
              <input 
                autoFocus
                className="text-base font-bold bg-transparent border-b border-white outline-none w-32"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
              />
            ) : (
              <span 
                className="text-base font-bold tracking-tight cursor-pointer hover:text-brand-100 flex items-center"
                onClick={() => setIsEditingName(true)}
                title="Click to rename"
              >
                {appName}
              </span>
            )}
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/70 hover:text-white">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          <div className="mb-6">
            <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Menu</p>
            {/* Req 2: Employee sees Dashboard */}
            <NavItem to="/" icon={HomeIcon} label={t.dashboard} />
            <NavItem to="/reports" icon={ClipboardDocumentCheckIcon} label={t.reports} />
            
            {userRole === Role.ADMIN && (
                <>
                <NavItem to="/employees" icon={UsersIcon} label={t.employees} />
                <NavItem to="/tasks" icon={BriefcaseIcon} label={t.tasks} />
                </>
            )}
          </div>

          <div className="mb-6">
            <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{t.departments}</p>
            {visibleDepartments.map(dept => (
              <NavItem 
                key={dept.id} 
                to={`/department/${dept.id}`} 
                icon={FolderIcon} 
                label={dept.name} 
              />
            ))}
          </div>

          {userRole === Role.ADMIN && (
            <div>
              <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">System</p>
              <NavItem to="/settings" icon={CogIcon} label={t.settings} />
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <div className="bg-brand-50 dark:bg-gray-700/50 rounded-xl p-4">
             <p className="text-xs text-brand-600 dark:text-brand-300 font-semibold mb-1">Hỗ trợ?</p>
             <p className="text-[10px] text-gray-500 dark:text-gray-400">support@tbs.com</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative transition-all duration-300">
        {/* Topbar */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 h-14 flex items-center justify-between px-6 z-10 sticky top-0 print:hidden">
          <div className="flex items-center">
             <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-brand-600 mr-4">
                <Bars3Icon className="w-6 h-6" />
             </button>
             {/* Hint for desktop users */}
             <div className="hidden lg:flex items-center text-gray-400 text-xs gap-1">
                 <Bars3Icon className="w-4 h-4"/>
                 <span>Menu</span>
             </div>
          </div>

          <div className="flex items-center space-x-3 md:space-x-4">
            <button 
              onClick={toggleLang}
              className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors flex items-center gap-1"
              title="Change Language"
            >
               <GlobeAltIcon className="w-5 h-5" />
               <span className="text-[10px] font-bold">{lang.toUpperCase()}</span>
            </button>
            
            <button 
              onClick={toggleTheme}
              className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-600 mx-1"></div>

            <div className="flex items-center space-x-3 pl-2">
              <button onClick={() => setShowProfile(true)} className="focus:outline-none group">
                <img 
                  src={currentUserDisplay.avatarUrl} 
                  alt="User" 
                  className="w-8 h-8 rounded-full border-2 border-transparent group-hover:border-brand-500 transition-all object-cover" 
                />
              </button>
              <div className="hidden md:block text-right cursor-pointer" onClick={() => setShowProfile(true)}>
                <p className="text-sm font-bold text-gray-800 dark:text-white leading-tight">{currentUserDisplay.fullName}</p>
                <p className="text-[10px] text-gray-500">{userRole}</p>
              </div>
              <button 
                onClick={onLogout}
                className="p-1.5 ml-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                title={t.logout}
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gray-50 dark:bg-gray-900 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
};
