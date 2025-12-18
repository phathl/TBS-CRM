import React, { useState, useMemo } from 'react';
import { Task, Employee, Department } from '../types';
import { TRANSLATIONS } from '../constants';
import { 
  PlusIcon, TrashIcon, PencilSquareIcon, 
  FunnelIcon, CalendarIcon, XMarkIcon, PaperClipIcon, DocumentIcon, VideoCameraIcon
} from '@heroicons/react/24/outline';

interface TasksProps {
  tasks: Task[];
  employees: Employee[];
  departments: Department[];
  lang: 'vi' | 'en';
  onSaveTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export const Tasks: React.FC<TasksProps> = ({ 
  tasks, employees, departments, lang, onSaveTask, onDeleteTask 
}) => {
  const t = TRANSLATIONS[lang];
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterAssignee, setFilterAssignee] = useState('ALL');
  const [filterPosition, setFilterPosition] = useState('ALL'); // New State
  const [showModal, setShowModal] = useState(false);
  const [currentTask, setCurrentTask] = useState<Partial<Task>>({});
  const [isEditing, setIsEditing] = useState(false);
  
  // Detail Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Get unique positions from employees
  const uniquePositions = useMemo(() => {
    const positions = new Set(employees.map(e => e.position).filter(Boolean));
    return Array.from(positions).sort();
  }, [employees]);

  // Filter Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const assignee = employees.find(e => e.id === task.assigneeId);
      
      const matchDept = filterDept === 'ALL' || task.departmentId === filterDept;
      const matchAssignee = filterAssignee === 'ALL' || task.assigneeId === filterAssignee;
      const matchPosition = filterPosition === 'ALL' || assignee?.position === filterPosition;
      
      return matchDept && matchAssignee && matchPosition;
    });
  }, [tasks, employees, filterDept, filterAssignee, filterPosition]);

  // Handle Form Submit
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTask.title || !currentTask.assigneeId) return;

    // Auto-assign department based on employee if not set (or just for consistency)
    const assignee = employees.find(e => e.id === currentTask.assigneeId);
    const taskToSave = {
      ...currentTask,
      departmentId: currentTask.departmentId || assignee?.departmentId || '',
      status: currentTask.status || 'TODO',
      attachments: currentTask.attachments || [],
      id: isEditing && currentTask.id ? currentTask.id : Date.now().toString()
    } as Task;

    onSaveTask(taskToSave);
    setShowModal(false);
  };

  const openAdd = () => {
    setCurrentTask({ status: 'TODO' });
    setIsEditing(false);
    setShowModal(true);
  };

  const openEdit = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation(); // Prevent opening detail modal
    setCurrentTask({ ...task });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent opening detail modal
    if(confirm(t.delete + "?")) {
      onDeleteTask(id);
    }
  }

  const openDetail = (task: Task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  const getStatusStyle = (status: Task['status']) => {
    switch (status) {
      case 'DONE': return 'bg-emerald-100 text-emerald-800 border-emerald-200'; // Green
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-800 border-amber-200'; // Yellow
      case 'REVIEW': return 'bg-violet-100 text-violet-800 border-violet-200';   // Purple
      default: return 'bg-gray-100 text-gray-700 border-gray-200';               // Gray
    }
  };

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'DONE': return t.task_done;
      case 'IN_PROGRESS': return t.task_progress;
      case 'REVIEW': return t.task_review;
      default: return t.task_todo;
    }
  }

  // --- Render Attachment Preview Helper ---
  const renderAttachmentPreview = (url: string) => {
    const isImage = url.match(/\.(jpeg|jpg|gif|png)$/i) || url.includes('images.unsplash.com');
    const isVideo = url.match(/\.(mp4|webm)$/i) || url.includes('videos-bucket');
    const isPDF = url.match(/\.(pdf)$/i);

    if (isImage) {
      return (
        <div className="rounded-lg overflow-hidden border border-gray-200 mb-2">
          <img src={url} alt="Attachment" className="w-full h-auto max-h-64 object-contain bg-gray-50" />
        </div>
      );
    }
    if (isVideo) {
      return (
         <div className="rounded-lg overflow-hidden border border-gray-200 mb-2">
           <video controls className="w-full max-h-64 bg-black">
             <source src={url} type="video/mp4" />
             Your browser does not support video.
           </video>
         </div>
      );
    }
    if (isPDF) {
      return (
         <div className="rounded-lg overflow-hidden border border-gray-200 mb-2 h-64">
           <iframe src={url} className="w-full h-full" title="PDF Preview"></iframe>
         </div>
      );
    }
    // Fallback for other file types
    return (
      <div className="flex items-center p-3 bg-slate-100 rounded-lg border border-blue-200 text-blue-800 mb-2">
        <DocumentIcon className="w-6 h-6 mr-2" />
        <a href={url} target="_blank" rel="noreferrer" className="underline truncate">{url}</a>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t.taskManagement}</h1>
          <p className="text-sm text-gray-500">Theo dõi tiến độ và phân công công việc</p>
        </div>
        <button 
          onClick={openAdd}
          className="flex items-center bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-brand-500/30 transition-all active:scale-95"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          {t.createTask}
        </button>
      </div>

      {/* Filters: Silver/Grey Input with Blue Text */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center text-gray-500">
          <FunnelIcon className="w-5 h-5 mr-2" />
          <span className="font-medium">{t.filter}:</span>
        </div>
        
        {/* Department Filter */}
        <select 
          className="px-4 py-2 border border-blue-200 rounded-lg bg-slate-100 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium"
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
        >
          <option value="ALL">{t.departments} (Tất cả)</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>

        {/* Position Filter (New) */}
        <select 
          className="px-4 py-2 border border-blue-200 rounded-lg bg-slate-100 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium"
          value={filterPosition}
          onChange={(e) => setFilterPosition(e.target.value)}
        >
          <option value="ALL">Chức vụ (Tất cả)</option>
          {uniquePositions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
        </select>

        {/* Assignee Filter */}
        <select 
          className="px-4 py-2 border border-blue-200 rounded-lg bg-slate-100 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium"
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
        >
          <option value="ALL">{t.employees} (Tất cả)</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.fullName}</option>)}
        </select>
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-200 text-xs uppercase font-bold tracking-wider">
               <tr>
                 <th className="px-6 py-4">{t.createTask}</th> {/* Title column */}
                 <th className="px-6 py-4">{t.assignTo}</th>
                 <th className="px-6 py-4">{t.dueDate}</th>
                 <th className="px-6 py-4">{t.status}</th>
                 <th className="px-6 py-4 text-right">{t.actions}</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
               {filteredTasks.map(task => {
                 const assignee = employees.find(e => e.id === task.assigneeId);
                 return (
                   <tr 
                      key={task.id} 
                      onClick={() => openDetail(task)}
                      className="hover:bg-blue-50 dark:hover:bg-gray-750 transition-colors cursor-pointer group"
                    >
                     <td className="px-6 py-4">
                       <div className="font-semibold text-blue-900 dark:text-blue-300 text-base group-hover:text-brand-600">{task.title}</div>
                       <div className="text-xs text-gray-500 truncate max-w-md mt-1">{task.description}</div>
                       {task.attachments && task.attachments.length > 0 && (
                         <div className="flex items-center mt-1 text-xs text-gray-400">
                            <PaperClipIcon className="w-3 h-3 mr-1" /> {task.attachments.length} file(s)
                         </div>
                       )}
                     </td>
                     <td className="px-6 py-4">
                       <div className="flex items-center">
                         {assignee ? (
                           <>
                             <img src={assignee.avatarUrl} alt="" className="w-8 h-8 rounded-full mr-3 border border-gray-200" />
                             <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{assignee.fullName}</div>
                                <div className="text-xs text-gray-500">{departments.find(d => d.id === assignee.departmentId)?.id} - {assignee.position}</div>
                             </div>
                           </>
                         ) : <span className="text-gray-400 italic">Chưa giao</span>}
                       </div>
                     </td>
                     <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                       <div className="flex items-center bg-gray-50 dark:bg-gray-700 w-fit px-2 py-1 rounded-md">
                         <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                         {task.dueDate}
                       </div>
                     </td>
                     <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border ${getStatusStyle(task.status)}`}>
                          {getStatusLabel(task.status)}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={(e) => openEdit(e, task)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors">
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button onClick={(e) => handleDelete(e, task.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                     </td>
                   </tr>
                 );
               })}
               {filteredTasks.length === 0 && (
                 <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-gray-400 flex flex-col items-center justify-center">
                     <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                       <FunnelIcon className="w-8 h-8 text-gray-300" />
                     </div>
                     Chưa có công việc nào phù hợp.
                   </td>
                 </tr>
               )}
             </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {isEditing ? 'Chỉnh sửa công việc' : t.createTask}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><span className="text-2xl">&times;</span></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.title}</label>
                <input required type="text" className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-slate-100 text-blue-900 focus:ring-2 focus:ring-brand-500 outline-none"
                  value={currentTask.title || ''} onChange={e => setCurrentTask({...currentTask, title: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.selectEmp}</label>
                   <select required className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-slate-100 text-blue-900 focus:ring-2 focus:ring-brand-500 outline-none"
                     value={currentTask.assigneeId || ''} 
                     onChange={e => {
                       const emp = employees.find(emp => emp.id === e.target.value);
                       setCurrentTask({
                         ...currentTask, 
                         assigneeId: e.target.value,
                         departmentId: emp ? emp.departmentId : currentTask.departmentId
                       });
                     }}>
                     <option value="">-- Chọn --</option>
                     {employees.map(e => <option key={e.id} value={e.id}>{e.fullName}</option>)}
                   </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.dueDate}</label>
                  <input type="date" className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-slate-100 text-blue-900 focus:ring-2 focus:ring-brand-500 outline-none"
                    value={currentTask.dueDate || ''} onChange={e => setCurrentTask({...currentTask, dueDate: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.selectDept}</label>
                 <select className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-slate-100 text-blue-900 focus:ring-2 focus:ring-brand-500 outline-none"
                   value={currentTask.departmentId || ''} onChange={e => setCurrentTask({...currentTask, departmentId: e.target.value})}>
                   <option value="">-- Tự động (theo nhân viên) --</option>
                   {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                 </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.status}</label>
                 <select className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-slate-100 text-blue-900 focus:ring-2 focus:ring-brand-500 outline-none"
                   value={currentTask.status || 'TODO'} onChange={e => setCurrentTask({...currentTask, status: e.target.value as any})}>
                   <option value="TODO">{t.task_todo}</option>
                   <option value="IN_PROGRESS">{t.task_progress}</option>
                   <option value="REVIEW">{t.task_review}</option>
                   <option value="DONE">{t.task_done}</option>
                 </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.description}</label>
                <textarea className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-slate-100 text-blue-900 h-24 focus:ring-2 focus:ring-brand-500 outline-none"
                  value={currentTask.description || ''} onChange={e => setCurrentTask({...currentTask, description: e.target.value})} />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 rounded-lg font-medium">
                  {t.cancel}
                </button>
                <button type="submit" className="px-5 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium shadow-lg shadow-brand-500/30">
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {showDetailModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-md p-4">
           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start bg-slate-50 dark:bg-gray-800/50">
                 <div>
                    <h2 className="text-2xl font-bold text-blue-900 dark:text-white mb-1">{selectedTask.title}</h2>
                    <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border ${getStatusStyle(selectedTask.status)}`}>
                        {getStatusLabel(selectedTask.status)}
                    </span>
                 </div>
                 <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-8 h-8" /></button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                 {/* Main Info */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">{t.assignTo}</h4>
                        <div className="flex items-center">
                           <img 
                              src={employees.find(e => e.id === selectedTask.assigneeId)?.avatarUrl || "https://via.placeholder.com/40"} 
                              className="w-10 h-10 rounded-full mr-3 border-2 border-white shadow-sm"
                           />
                           <div>
                              <p className="font-semibold text-gray-800 dark:text-white">{employees.find(e => e.id === selectedTask.assigneeId)?.fullName}</p>
                              <p className="text-xs text-gray-500">{departments.find(d => d.id === selectedTask.departmentId)?.name}</p>
                           </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">{t.dueDate}</h4>
                        <div className="flex items-center text-gray-800 dark:text-white text-lg">
                           <CalendarIcon className="w-5 h-5 mr-2 text-brand-500" />
                           {selectedTask.dueDate}
                        </div>
                    </div>
                 </div>

                 <div className="mb-8">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">{t.description}</h4>
                    <div className="bg-slate-50 dark:bg-gray-700/30 p-4 rounded-xl text-gray-700 dark:text-gray-200 leading-relaxed border border-gray-100 dark:border-gray-700">
                       {selectedTask.description}
                    </div>
                 </div>

                 {/* Attachments & Preview */}
                 <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center">
                      <PaperClipIcon className="w-4 h-4 mr-1"/> {t.attachments}
                    </h4>
                    {selectedTask.attachments && selectedTask.attachments.length > 0 ? (
                       <div className="space-y-4">
                          {selectedTask.attachments.map((url, idx) => (
                             <div key={idx}>
                                {renderAttachmentPreview(url)}
                             </div>
                          ))}
                       </div>
                    ) : (
                       <p className="text-sm text-gray-400 italic">Không có tài liệu đính kèm.</p>
                    )}
                 </div>
              </div>

              <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
                 <button 
                    onClick={() => setShowDetailModal(false)}
                    className="px-6 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-colors"
                 >
                    {t.close}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};