import React, { useState } from 'react';
import { Department, AuditLog, Employee } from '../types';
import { TRANSLATIONS } from '../constants';
import { PlusIcon, PencilSquareIcon, TrashIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

interface SettingsProps {
  departments: Department[];
  employees: Employee[];
  logs: AuditLog[];
  lang: 'vi' | 'en';
  onSaveDept: (dept: Department) => void;
  onDeleteDept: (id: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  departments, employees, logs, lang, onSaveDept, onDeleteDept 
}) => {
  const t = TRANSLATIONS[lang];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDept, setCurrentDept] = useState<Partial<Department>>({});

  const handleOpenAdd = () => {
    setCurrentDept({ id: '', name: '', description: '', managerId: '' });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setCurrentDept({ ...dept });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    // Check if employees exist in this department
    const hasEmployees = employees.some(e => e.departmentId === id);
    if (hasEmployees) {
      alert("Không thể xóa phòng ban đang có nhân viên. Vui lòng chuyển nhân viên sang phòng ban khác trước.");
      return;
    }

    if (window.confirm('Bạn có chắc chắn muốn xóa phòng ban này?')) {
      onDeleteDept(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentDept.id && currentDept.name) {
      onSaveDept(currentDept as Department);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t.settings}</h1>
           <p className="text-sm text-gray-500">Cấu hình hệ thống và quản lý danh mục</p>
        </div>
      </div>

      {/* Departments Management Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2">
            <BuildingOfficeIcon className="w-6 h-6 text-brand-600" />
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Danh sách Phòng ban</h2>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="flex items-center bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md shadow-brand-500/20 transition-all"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Thêm Phòng ban
          </button>
        </div>
        
        <div className="p-0">
          {departments.length === 0 ? (
             <div className="p-8 text-center text-gray-500">Chưa có phòng ban nào.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-4">Mã PB</th>
                  <th className="px-6 py-4">Tên Phòng ban</th>
                  <th className="px-6 py-4">Trưởng phòng</th>
                  <th className="px-6 py-4">Mô tả</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {departments.map(dept => {
                   const manager = employees.find(e => e.id === dept.managerId);
                   return (
                    <tr key={dept.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm text-gray-500">{dept.id}</td>
                      <td className="px-6 py-4 font-semibold text-gray-800 dark:text-white">{dept.name}</td>
                      <td className="px-6 py-4">
                        {manager ? (
                          <div className="flex items-center gap-2">
                            <img src={manager.avatarUrl} className="w-6 h-6 rounded-full" alt="" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{manager.fullName}</span>
                          </div>
                        ) : <span className="text-gray-400 text-sm italic">-- Trống --</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{dept.description}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                         <button 
                           type="button"
                           onClick={(e) => { e.stopPropagation(); handleOpenEdit(dept); }} 
                           className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" 
                           title={t.edit}
                         >
                           <PencilSquareIcon className="w-5 h-5" />
                         </button>
                         <button 
                           type="button"
                           onClick={(e) => { e.stopPropagation(); handleDelete(dept.id); }} 
                           className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" 
                           title={t.delete}
                         >
                           <TrashIcon className="w-5 h-5" />
                         </button>
                      </td>
                    </tr>
                   );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Audit Log Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Lịch sử hoạt động (Audit Logs)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-500 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Thời gian</th>
                <th className="px-4 py-3">Người dùng</th>
                <th className="px-4 py-3">Hành động</th>
                <th className="px-4 py-3 rounded-r-lg">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {logs.map(log => (
                <tr key={log.id}>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{log.timestamp}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{log.user}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      log.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                      log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' : 
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {isEditing ? 'Cập nhật Phòng ban' : 'Thêm Phòng ban Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><span className="text-2xl">&times;</span></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mã Phòng Ban (ID)</label>
                <input 
                  type="text" 
                  required 
                  disabled={isEditing}
                  className={`w-full px-3 py-2 border border-blue-200 rounded-lg bg-slate-100 text-blue-900 focus:ring-2 focus:ring-brand-500 outline-none ${isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                  value={currentDept.id || ''} 
                  onChange={e => setCurrentDept({...currentDept, id: e.target.value.toUpperCase()})}
                  placeholder="VD: IT, HR, SALE"
                />
                {!isEditing && <p className="text-xs text-gray-500 mt-1">Mã phòng ban là duy nhất và không thể thay đổi sau khi tạo.</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên Phòng Ban</label>
                <input 
                  type="text" 
                  required 
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-slate-100 text-blue-900 focus:ring-2 focus:ring-brand-500 outline-none"
                  value={currentDept.name || ''} 
                  onChange={e => setCurrentDept({...currentDept, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trưởng phòng</label>
                <select 
                   className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-slate-100 text-blue-900 focus:ring-2 focus:ring-brand-500 outline-none"
                   value={currentDept.managerId || ''}
                   onChange={e => setCurrentDept({...currentDept, managerId: e.target.value})}
                >
                  <option value="">-- Chọn Trưởng phòng --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả</label>
                <textarea 
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-slate-100 text-blue-900 h-24 focus:ring-2 focus:ring-brand-500 outline-none"
                  value={currentDept.description || ''} 
                  onChange={e => setCurrentDept({...currentDept, description: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 rounded-lg font-medium">
                  {t.cancel}
                </button>
                <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium shadow-lg shadow-brand-500/30">
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};