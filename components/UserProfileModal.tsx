
import React, { useState } from 'react';
import { Employee, Department } from '../types';
import { TRANSLATIONS } from '../constants';
import { XMarkIcon, KeyIcon, UserIcon, EnvelopeIcon, PhoneIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

interface UserProfileModalProps {
  employee: Partial<Employee>;
  departmentName?: string;
  isOpen: boolean;
  onClose: () => void;
  lang: 'vi' | 'en';
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  employee, departmentName, isOpen, onClose, lang 
}) => {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  if (!isOpen) return null;

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass === confirmPass && newPass.length > 0) {
      alert(t.passwordUpdated);
      setNewPass('');
      setConfirmPass('');
    } else {
      alert("Mật khẩu không khớp hoặc để trống!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        
        {/* Header with Cover */}
        <div className="relative h-32 bg-gradient-to-r from-brand-500 to-brand-700">
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Avatar & Basic Info */}
        <div className="relative px-6 pb-6">
          <div className="flex flex-col items-center -mt-12 mb-4">
            <img 
              src={employee.avatarUrl || "https://via.placeholder.com/150"} 
              alt="Profile" 
              className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-lg object-cover bg-white"
            />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-2">{employee.fullName || 'User Name'}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{employee.position || 'Employee'}</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
            <button 
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'info' 
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.personalInfo}
            </button>
            <button 
              onClick={() => setActiveTab('password')}
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'password' 
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.changePassword}
            </button>
          </div>

          {/* Content */}
          <div className="min-h-[200px]">
            {activeTab === 'info' ? (
              <div className="space-y-4 text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <BriefcaseIcon className="w-5 h-5 mr-3 text-brand-500" />
                  <div>
                    <span className="block text-xs text-gray-400">{t.departments}</span>
                    <span className="font-medium">{departmentName || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <UserIcon className="w-5 h-5 mr-3 text-brand-500" />
                  <div>
                    <span className="block text-xs text-gray-400">Mã nhân viên</span>
                    <span className="font-medium">{employee.code || '---'}</span>
                  </div>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <EnvelopeIcon className="w-5 h-5 mr-3 text-brand-500" />
                  <div>
                    <span className="block text-xs text-gray-400">Email</span>
                    <span className="font-medium">{employee.email || '---'}</span>
                  </div>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <PhoneIcon className="w-5 h-5 mr-3 text-brand-500" />
                  <div>
                    <span className="block text-xs text-gray-400">Số điện thoại</span>
                    <span className="font-medium">{employee.phone || '---'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.newPassword}</label>
                   <div className="relative">
                     <KeyIcon className="w-5 h-5 absolute left-3 top-2.5 text-blue-900" />
                     <input 
                        type="password" 
                        required
                        className="w-full pl-10 pr-3 py-2 border border-blue-200 rounded-lg bg-slate-100 text-blue-900 focus:ring-2 focus:ring-brand-500 outline-none"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                     />
                   </div>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.confirmPassword}</label>
                   <div className="relative">
                     <KeyIcon className="w-5 h-5 absolute left-3 top-2.5 text-blue-900" />
                     <input 
                        type="password" 
                        required
                        className="w-full pl-10 pr-3 py-2 border border-blue-200 rounded-lg bg-slate-100 text-blue-900 focus:ring-2 focus:ring-brand-500 outline-none"
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                     />
                   </div>
                 </div>
                 <button 
                   type="submit" 
                   className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 rounded-lg transition-colors mt-2 shadow-lg shadow-brand-500/30"
                 >
                   {t.save}
                 </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
