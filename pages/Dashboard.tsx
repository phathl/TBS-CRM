
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { Employee, Department, Task } from '../types';
import { TRANSLATIONS } from '../constants';
import { UserIcon, ClockIcon, PaperClipIcon, XMarkIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface DashboardProps {
  employees: Employee[];
  departments: Department[];
  tasks: Task[];
  lang: 'vi' | 'en';
}

// Updated Colors
const STATUS_COLORS = ['#64748b', '#f59e0b', '#8b5cf6', '#10b981'];

export const Dashboard: React.FC<DashboardProps> = ({ employees, departments, tasks, lang }) => {
  const t = TRANSLATIONS[lang];
  const navigate = useNavigate();

  // Task Detail Modal State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Stats calculation
  const totalEmployees = employees.length;
  const totalDepts = departments.length;
  const activeTasksList = tasks.filter(t => t.status !== 'DONE');
  const activeTasksCount = activeTasksList.length;
  const completedTasks = tasks.filter(t => t.status === 'DONE').length;

  // Mock Online Members
  const onlineMembers = employees.slice(0, 5);

  // Chart Data Preparation
  const deptData = departments.map(dept => ({
    name: dept.name,
    id: dept.id, // for navigation
    count: employees.filter(e => e.departmentId === dept.id).length
  }));

  const taskStatusData = [
    { name: t.task_todo, value: tasks.filter(x => x.status === 'TODO').length },
    { name: t.task_progress, value: tasks.filter(x => x.status === 'IN_PROGRESS').length },
    { name: t.task_review, value: tasks.filter(x => x.status === 'REVIEW').length },
    { name: t.task_done, value: tasks.filter(x => x.status === 'DONE').length },
  ];

  const handleBarClick = (data: any) => {
    if (data && data.id) {
        navigate(`/department/${data.id}`);
    }
  };

  const getStatusStyle = (status: Task['status']) => {
    switch (status) {
      case 'DONE': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'REVIEW': return 'bg-violet-100 text-violet-800 border-violet-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'DONE': return t.task_done;
      case 'IN_PROGRESS': return t.task_progress;
      case 'REVIEW': return t.task_review;
      default: return t.task_todo;
    }
  };

  const StatCard = ({ title, value, color }: { title: string, value: string | number, color: string }) => (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group`}>
       <div className={`absolute top-0 left-0 w-1.5 h-full ${color}`}></div>
       <div className="relative z-10">
          <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">{title}</h3>
          <p className="text-3xl font-extrabold text-gray-800 dark:text-white group-hover:scale-105 transition-transform origin-left">{value}</p>
       </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t.dashboard}</h1>
        <p className="text-gray-500 dark:text-gray-400">Chào mừng trở lại hệ thống TBS CRM.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t.employees} value={totalEmployees} color="bg-brand-500" />
        <StatCard title={t.departments} value={totalDepts} color="bg-blue-500" />
        <StatCard title="Đang thực hiện" value={activeTasksCount} color="bg-amber-500" />
        <StatCard title="Đã hoàn thành" value={completedTasks} color="bg-emerald-500" />
      </div>

      {/* 3 Columns Layout for Charts & Online Members */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. Employee Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Phân bổ nhân sự</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#9ca3af" tick={{fontSize: 10}} interval={0} />
                <YAxis stroke="#9ca3af" tick={{fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar 
                    dataKey="count" 
                    fill="#6366f1" 
                    radius={[6, 6, 0, 0]} 
                    barSize={40} 
                    onClick={handleBarClick}
                    cursor="pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2 italic">* Click vào cột để xem chi tiết phòng ban</p>
        </div>

        {/* 2. Task Status */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Trạng thái công việc</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Online Members */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-bold text-gray-800 dark:text-white">{t.onlineMembers}</h3>
               <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full animate-pulse">Live</span>
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                 {onlineMembers.map(m => (
                    <div key={m.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                       <div className="relative">
                         <img src={m.avatarUrl} className="w-10 h-10 rounded-full object-cover" alt="" />
                         <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-green-400" />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{m.fullName}</p>
                          <p className="text-xs text-gray-500">{m.position} - {m.departmentId}</p>
                       </div>
                    </div>
                 ))}
               </div>
        </div>
      </div>

      {/* Full Width: Active Tasks List */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
         <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">{t.activeTasks}</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {activeTasksList.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4 col-span-3">Không có công việc nào.</p>
             ) : (
                activeTasksList.map(task => {
                  const assignee = employees.find(e => e.id === task.assigneeId);
                  return (
                    <div 
                        key={task.id} 
                        className="p-4 bg-slate-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group"
                        onClick={() => setSelectedTask(task)}
                    >
                       <div className="flex justify-between items-start mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            task.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' : 
                            task.status === 'REVIEW' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {task.status === 'IN_PROGRESS' ? t.task_progress : (task.status === 'REVIEW' ? t.task_review : t.task_todo)}
                          </span>
                          {task.dueDate && (
                            <span className="text-[10px] text-gray-400 flex items-center bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded shadow-sm">
                              <ClockIcon className="w-3 h-3 mr-1" /> {task.dueDate}
                            </span>
                          )}
                       </div>
                       <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-2 leading-snug group-hover:text-brand-600">{task.title}</h4>
                       <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                         <div className="flex items-center">
                            <img src={assignee?.avatarUrl || "https://via.placeholder.com/30"} className="w-6 h-6 rounded-full mr-2" />
                            <span className="text-xs text-gray-500 font-medium truncate max-w-[100px]">{assignee?.fullName}</span>
                         </div>
                         {task.attachments && task.attachments.length > 0 && (
                             <span className="text-xs text-gray-400 flex items-center">
                                 <PaperClipIcon className="w-3 h-3 mr-1" /> {task.attachments.length}
                             </span>
                         )}
                       </div>
                    </div>
                  );
                })
             )}
         </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-md p-4">
           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start bg-slate-50 dark:bg-gray-800/50">
                 <div>
                    <h2 className="text-xl font-bold text-blue-900 dark:text-white mb-1">{selectedTask.title}</h2>
                    <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border ${getStatusStyle(selectedTask.status)}`}>
                        {getStatusLabel(selectedTask.status)}
                    </span>
                 </div>
                 <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-6 h-6" /></button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                 <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{t.assignTo}</h4>
                        <div className="flex items-center">
                           <img 
                              src={employees.find(e => e.id === selectedTask.assigneeId)?.avatarUrl || "https://via.placeholder.com/40"} 
                              className="w-8 h-8 rounded-full mr-2"
                           />
                           <p className="font-semibold text-gray-800 dark:text-white text-sm">{employees.find(e => e.id === selectedTask.assigneeId)?.fullName}</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{t.dueDate}</h4>
                        <div className="flex items-center text-gray-800 dark:text-white font-medium">
                           <CalendarIcon className="w-4 h-4 mr-2 text-brand-500" />
                           {selectedTask.dueDate}
                        </div>
                    </div>
                 </div>

                 <div className="mb-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{t.description}</h4>
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                       {selectedTask.description}
                    </div>
                 </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
                  <button onClick={() => setSelectedTask(null)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">{t.close}</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
