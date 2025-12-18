
import React, { useState, useMemo } from 'react';
import { Task, Employee, Department } from '../types';
import { TRANSLATIONS } from '../constants';
import { 
  CalendarDaysIcon, UserIcon, PrinterIcon, 
  CheckCircleIcon, ExclamationCircleIcon, ClockIcon, ChartBarIcon
} from '@heroicons/react/24/outline';

interface ReportsProps {
  tasks: Task[];
  employees: Employee[];
  departments: Department[];
  lang: 'vi' | 'en';
}

type Period = 'DAY' | 'WEEK' | 'MONTH';

export const Reports: React.FC<ReportsProps> = ({ tasks, employees, departments, lang }) => {
  const t = TRANSLATIONS[lang];
  const [period, setPeriod] = useState<Period>('MONTH');
  const [selectedEmpId, setSelectedEmpId] = useState<string>('ALL');
  const [reportDate, setReportDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // --- Filtering Logic ---
  const filteredData = useMemo(() => {
    const targetDate = new Date(reportDate);
    
    return tasks.filter(task => {
        // 1. Filter by Employee
        if (selectedEmpId !== 'ALL' && task.assigneeId !== selectedEmpId) return false;

        // 2. Filter by Period (based on dueDate for simplicity in this demo)
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);

        if (period === 'DAY') {
             return taskDate.toDateString() === targetDate.toDateString();
        } else if (period === 'WEEK') {
             // Simple Week calculation: same year and same ISO week or within 7 days
             const diffTime = Math.abs(targetDate.getTime() - taskDate.getTime());
             const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
             return diffDays <= 7 && taskDate <= targetDate;
        } else {
             // Month
             return taskDate.getMonth() === targetDate.getMonth() && taskDate.getFullYear() === targetDate.getFullYear();
        }
    });
  }, [tasks, selectedEmpId, period, reportDate]);

  // --- Statistics ---
  const stats = {
      total: filteredData.length,
      done: filteredData.filter(t => t.status === 'DONE').length,
      inProgress: filteredData.filter(t => t.status === 'IN_PROGRESS' || t.status === 'REVIEW').length,
      todo: filteredData.filter(t => t.status === 'TODO').length
  };
  
  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  const handlePrint = () => {
    window.print();
  };

  const selectedEmp = employees.find(e => e.id === selectedEmpId);

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
              <ChartBarIcon className="w-8 h-8 mr-2 text-brand-600" />
              {t.reports}
          </h1>
          <p className="text-sm text-gray-500">Xem và in báo cáo kết quả công việc theo kỳ</p>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
        >
          <PrinterIcon className="w-5 h-5 mr-2" />
          {t.print}
        </button>
      </div>

      {/* Filters (Hidden on Print) */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-4 gap-4 print:hidden">
          <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">{t.reportPeriod}</label>
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  {(['DAY', 'WEEK', 'MONTH'] as Period[]).map((p) => (
                      <button 
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                            period === p ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                          {p === 'DAY' ? t.day : p === 'WEEK' ? t.week : t.month}
                      </button>
                  ))}
              </div>
          </div>
          <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Mốc thời gian</label>
              <div className="relative">
                  <CalendarDaysIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                  <input 
                    type="date" 
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                  />
              </div>
          </div>
          <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-1">{t.employees}</label>
              <div className="relative">
                  <UserIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                  <select 
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    value={selectedEmpId}
                    onChange={(e) => setSelectedEmpId(e.target.value)}
                  >
                      <option value="ALL">-- Tất cả nhân viên --</option>
                      {employees.map(e => (
                          <option key={e.id} value={e.id}>{e.fullName} - {departments.find(d => d.id === e.departmentId)?.name}</option>
                      ))}
                  </select>
              </div>
          </div>
      </div>

      {/* REPORT CONTENT (Visible on Print) */}
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 print:shadow-none print:border-none print:p-0">
          
          {/* Print Header */}
          <div className="border-b-2 border-brand-900 pb-6 mb-6">
             <div className="flex justify-between items-start">
                 <div>
                     <h2 className="text-3xl font-black text-brand-900 uppercase tracking-wide">BÁO CÁO KẾT QUẢ CÔNG VIỆC</h2>
                     <p className="text-gray-500 font-medium">TBS GROUP MANAGEMENT SYSTEM</p>
                 </div>
                 <div className="text-right">
                     <p className="font-bold text-gray-800">Kỳ báo cáo: {period === 'DAY' ? 'Theo Ngày' : period === 'WEEK' ? 'Theo Tuần' : 'Theo Tháng'}</p>
                     <p className="text-sm text-gray-600">Thời gian: {new Date(reportDate).toLocaleDateString('vi-VN')}</p>
                 </div>
             </div>
             {selectedEmpId !== 'ALL' && selectedEmp && (
                 <div className="mt-4 flex items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                     <img src={selectedEmp.avatarUrl} className="w-12 h-12 rounded-full mr-4 border border-gray-300" alt=""/>
                     <div>
                         <p className="font-bold text-lg text-gray-900">{selectedEmp.fullName} <span className="text-sm font-normal text-gray-500">({selectedEmp.code})</span></p>
                         <p className="text-sm text-gray-600">{selectedEmp.position} - {departments.find(d => d.id === selectedEmp.departmentId)?.name}</p>
                     </div>
                 </div>
             )}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-center print:border-gray-300">
                  <p className="text-sm text-blue-800 font-bold uppercase">{t.totalTasks}</p>
                  <p className="text-3xl font-black text-blue-600">{stats.total}</p>
              </div>
              <div className="p-4 bg-green-50 border border-green-100 rounded-lg text-center print:border-gray-300">
                  <p className="text-sm text-green-800 font-bold uppercase">{t.task_done}</p>
                  <p className="text-3xl font-black text-green-600">{stats.done}</p>
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-center print:border-gray-300">
                  <p className="text-sm text-yellow-800 font-bold uppercase">{t.task_progress}</p>
                  <p className="text-3xl font-black text-yellow-600">{stats.inProgress}</p>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center print:border-gray-300">
                  <p className="text-sm text-gray-800 font-bold uppercase">{t.completionRate}</p>
                  <p className="text-3xl font-black text-gray-700">{completionRate}%</p>
              </div>
          </div>

          {/* Detailed Table */}
          <table className="w-full text-left border-collapse border border-gray-200 text-sm">
              <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-xs">
                  <tr>
                      <th className="border border-gray-300 px-3 py-2 text-center w-12">#</th>
                      <th className="border border-gray-300 px-3 py-2">Công việc</th>
                      <th className="border border-gray-300 px-3 py-2 w-32">Trạng thái</th>
                      <th className="border border-gray-300 px-3 py-2 w-32">Hạn chót</th>
                      {selectedEmpId === 'ALL' && <th className="border border-gray-300 px-3 py-2">Người thực hiện</th>}
                  </tr>
              </thead>
              <tbody>
                  {filteredData.length > 0 ? (
                      filteredData.map((task, idx) => {
                          const assignee = employees.find(e => e.id === task.assigneeId);
                          return (
                            <tr key={task.id}>
                                <td className="border border-gray-300 px-3 py-2 text-center text-gray-500">{idx + 1}</td>
                                <td className="border border-gray-300 px-3 py-2">
                                    <div className="font-bold text-gray-800">{task.title}</div>
                                    <div className="text-xs text-gray-500">{task.description}</div>
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-center">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold border print:border-none print:px-0
                                        ${task.status === 'DONE' ? 'bg-green-100 text-green-700 border-green-200' : 
                                          task.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                                        }`}>
                                        {task.status === 'DONE' ? t.task_done : task.status === 'IN_PROGRESS' ? t.task_progress : t.task_todo}
                                    </span>
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-center text-gray-600">{task.dueDate}</td>
                                {selectedEmpId === 'ALL' && (
                                    <td className="border border-gray-300 px-3 py-2">
                                        {assignee ? assignee.fullName : 'N/A'}
                                    </td>
                                )}
                            </tr>
                          );
                      })
                  ) : (
                      <tr>
                          <td colSpan={5} className="border border-gray-300 px-3 py-8 text-center text-gray-400 italic">
                              Không có dữ liệu trong khoảng thời gian này.
                          </td>
                      </tr>
                  )}
              </tbody>
          </table>

          {/* Footer Signature */}
          <div className="grid grid-cols-2 gap-8 mt-12 pt-8 text-center break-inside-avoid">
             <div>
                 <p className="font-bold mb-16 text-gray-800">Người lập biểu</p>
                 <p className="italic text-gray-500">...........................................</p>
             </div>
             <div>
                 <p className="font-bold mb-16 text-gray-800">Xác nhận của quản lý</p>
                 <p className="italic text-gray-500">...........................................</p>
             </div>
          </div>
      </div>
    </div>
  );
};
