
import React, { useState, useMemo } from 'react';
import { Employee, EmployeeStatus, Gender, Department, Role } from '../types';
import { TRANSLATIONS } from '../constants';
import { UserProfileModal } from '../components/UserProfileModal';
import { storageService } from '../lib/supabase/storage';
import { 
  MagnifyingGlassIcon, PlusIcon, TrashIcon, PencilSquareIcon, IdentificationIcon, 
  PrinterIcon, CameraIcon, BanknotesIcon, TableCellsIcon, UserGroupIcon, 
  DocumentTextIcon, XMarkIcon, KeyIcon, ArrowPathIcon 
} from '@heroicons/react/24/outline';

interface EmployeesProps {
  employees: Employee[];
  departments: Department[];
  lang: 'vi' | 'en';
  onAdd: (emp: Employee) => void;
  onEdit: (emp: Employee) => void;
  onDelete: (id: string) => void;
  currentUserRole: Role;
  currentUserDept?: string;
}

export const Employees: React.FC<EmployeesProps> = ({ 
  employees, departments, lang, onAdd, onEdit, onDelete, currentUserRole, currentUserDept
}) => {
  const t = TRANSLATIONS[lang];
  const [viewMode, setViewMode] = useState<'list' | 'payroll'>('list');
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEmp, setCurrentEmp] = useState<Partial<Employee>>({});
  const [isUploading, setIsUploading] = useState(false);
  
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [payslipEmp, setPayslipEmp] = useState<Employee | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch = emp.fullName.toLowerCase().includes(search.toLowerCase()) || 
                          emp.code.toLowerCase().includes(search.toLowerCase());
      const matchDept = filterDept === 'ALL' || emp.departmentId === filterDept;
      return matchSearch && matchDept;
    });
  }, [employees, search, filterDept]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && currentEmp.id) {
      onEdit(currentEmp as Employee);
    } else {
      onAdd({
        ...currentEmp,
        id: currentEmp.id || Date.now().toString(),
        avatarUrl: currentEmp.avatarUrl || `https://ui-avatars.com/api/?name=${currentEmp.fullName}&background=random`,
        workDays: 0,
        salary: currentEmp.salary || { 
            baseSalary: 0, dependentCount: 0, 
            allowances: { phone: 0, housing: 0, social: 0, dependents: 0, travel: 0, bonus: 0 } 
        }
      } as Employee);
    }
    setShowModal(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        const empId = currentEmp.id || 'new_emp_' + Date.now();
        const filePath = `avatars/${empId}/${Date.now()}_${file.name}`;
        const publicUrl = await storageService.uploadFile('tbs-crm', filePath, file);
        setCurrentEmp(prev => ({ ...prev, avatarUrl: publicUrl }));
      } catch (err) {
        alert('Lỗi tải ảnh: ' + (err as any).message);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const formatMoney = (amount: number) => {
      return Math.round(amount).toLocaleString('vi-VN') + ' đ';
  };

  return (
    <div className="space-y-6">
      {isUploading && (
        <div className="fixed top-4 right-4 z-[100] bg-brand-600 text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 animate-bounce">
           <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
           Đang tải ảnh...
        </div>
      )}

      <UserProfileModal 
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        employee={selectedEmp || {}}
        departmentName={departments.find(d => d.id === selectedEmp?.departmentId)?.name}
        lang={lang}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t.employees}</h1>
          <p className="text-sm text-gray-500">Quản lý nhân sự và hồ sơ kỹ thuật số</p>
        </div>
        <div className="flex space-x-2">
            <button onClick={() => setViewMode('list')} className={`flex items-center px-4 py-2 rounded-lg transition-colors font-medium text-sm ${viewMode === 'list' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
                <UserGroupIcon className="w-4 h-4 mr-2" /> Danh sách
            </button>
            <button onClick={() => setViewMode('payroll')} className={`flex items-center px-4 py-2 rounded-lg transition-colors font-medium text-sm ${viewMode === 'payroll' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
                <BanknotesIcon className="w-4 h-4 mr-2" /> {t.payroll}
            </button>
            <button onClick={() => { setCurrentEmp({ status: EmployeeStatus.ACTIVE, departmentId: departments[0]?.id }); setIsEditing(false); setShowModal(true); }} className="flex items-center bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-xl shadow-lg transition-all active:scale-95 ml-2">
              <PlusIcon className="w-5 h-5 mr-2" /> {t.addEmployee}
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
          <input type="text" placeholder={t.search} className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-brand-500" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-200 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Nhân viên</th>
                <th className="px-6 py-4">Phòng ban</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredEmployees.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 flex items-center">
                    <img src={emp.avatarUrl} className="w-10 h-10 rounded-full mr-4 object-cover border" onClick={() => { setSelectedEmp(emp); setShowDetailModal(true); }} />
                    <div>
                      <div className="font-bold">{emp.fullName}</div>
                      <div className="text-xs text-gray-500 font-mono">{emp.code}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{departments.find(d => d.id === emp.departmentId)?.name}</div>
                    <div className="text-xs text-gray-500">{emp.position}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${emp.status === EmployeeStatus.ACTIVE ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-1">
                    <button onClick={() => { setCurrentEmp(emp); setIsEditing(true); setShowModal(true); }} className="p-2 text-gray-400 hover:text-blue-600"><PencilSquareIcon className="w-5 h-5"/></button>
                    <button onClick={() => onDelete(emp.id)} className="p-2 text-gray-400 hover:text-red-600"><TrashIcon className="w-5 h-5"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>

      {/* EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto">
             <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-xl font-bold">{isEditing ? 'Sửa nhân viên' : 'Thêm nhân viên'}</h3>
                <button onClick={() => setShowModal(false)}><XMarkIcon className="w-6 h-6"/></button>
             </div>
             <form onSubmit={handleSave} className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center">
                   <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-gray-100 shadow-lg group">
                      <img src={currentEmp.avatarUrl || "https://via.placeholder.com/150"} className="w-full h-full object-cover" />
                      <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                         <CameraIcon className="w-8 h-8 text-white"/>
                         <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload}/>
                      </label>
                   </div>
                   <p className="mt-2 text-xs text-gray-400">Tải ảnh đại diện lên Supabase</p>
                </div>
                <div className="md:col-span-2 space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-xs font-bold text-gray-400">Họ tên</label><input required className="w-full p-2 bg-gray-50 border rounded-lg" value={currentEmp.fullName || ''} onChange={e => setCurrentEmp({...currentEmp, fullName: e.target.value})}/></div>
                      <div><label className="text-xs font-bold text-gray-400">Mã NV</label><input required className="w-full p-2 bg-gray-50 border rounded-lg" value={currentEmp.code || ''} onChange={e => setCurrentEmp({...currentEmp, code: e.target.value})}/></div>
                   </div>
                   <div><label className="text-xs font-bold text-gray-400">Email</label><input type="email" className="w-full p-2 bg-gray-50 border rounded-lg" value={currentEmp.email || ''} onChange={e => setCurrentEmp({...currentEmp, email: e.target.value})}/></div>
                   <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-xs font-bold text-gray-400">Phòng ban</label>
                        <select className="w-full p-2 bg-gray-50 border rounded-lg" value={currentEmp.departmentId} onChange={e => setCurrentEmp({...currentEmp, departmentId: e.target.value})}>
                          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </div>
                      <div><label className="text-xs font-bold text-gray-400">Chức vụ</label><input className="w-full p-2 bg-gray-50 border rounded-lg" value={currentEmp.position || ''} onChange={e => setCurrentEmp({...currentEmp, position: e.target.value})}/></div>
                   </div>
                </div>
                <div className="md:col-span-3 flex justify-end gap-3 pt-6 border-t">
                   <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 bg-gray-100 rounded-lg">Hủy</button>
                   <button type="submit" className="px-6 py-2 bg-brand-600 text-white rounded-lg font-bold shadow-lg">Lưu hồ sơ</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
