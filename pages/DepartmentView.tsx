
import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Department, Task, Employee, Role } from '../types';
import { TRANSLATIONS, DEPT_COLORS } from '../constants';
import { 
  ClockIcon, PaperClipIcon, ListBulletIcon, XMarkIcon, 
  CalendarIcon, PlusIcon, PrinterIcon, ArrowUpTrayIcon 
} from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { storageService } from '../lib/supabase/storage';

interface DeptViewProps {
  departments: Department[];
  employees: Employee[];
  allTasks: Task[];
  lang: 'vi' | 'en';
  userRole: Role;
  onUpdateTask: (task: Task) => void;
}

export const DepartmentView: React.FC<DeptViewProps> = ({ 
  departments, employees, allTasks, lang, userRole, onUpdateTask 
}) => {
  const { id } = useParams<{ id: string }>();
  const t = TRANSLATIONS[lang];
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTaskId, setUploadTaskId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({ status: 'TODO', departmentId: id });

  const currentDept = departments.find(d => d.id === id);
  const tasks = allTasks.filter(t => t.departmentId === id);
  const recentTasks = [...tasks].reverse().slice(0, 20);

  const taskStats = [
      { name: 'Hoàn thành', value: tasks.filter(t => t.status === 'DONE').length },
      { name: 'Đang xử lý', value: tasks.filter(t => t.status !== 'DONE').length }
  ];
  const CHART_COLORS = ['#34d399', '#ffffff50'];

  if (!currentDept) return <div className="p-8">Department not found</div>;

  const bgHeader = DEPT_COLORS[currentDept.id] || DEPT_COLORS['DEFAULT'];

  const getStatusStyle = (status: Task['status']) => {
    switch (status) {
      case 'DONE': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'REVIEW': return 'bg-violet-100 text-violet-800 border-violet-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
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

  const handleStatusChange = (task: Task, newStatus: string) => {
    onUpdateTask({ ...task, status: newStatus as Task['status'] });
  };

  const triggerUpload = (taskId: string) => {
    setUploadTaskId(taskId);
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
      }
    }, 0);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && uploadTaskId) {
      const file = e.target.files[0];
      const taskToUpdate = allTasks.find(t => t.id === uploadTaskId);
      if (!taskToUpdate) return;

      try {
        setIsUploading(true);
        // Lưu trữ theo cấu trúc: tasks/[taskId]/[timestamp]_[filename]
        const filePath = `tasks/${uploadTaskId}/${Date.now()}_${file.name}`;
        const publicUrl = await storageService.uploadFile('tbs-crm', filePath, file);
        
        const newAttachments = [...(taskToUpdate.attachments || []), publicUrl];
        onUpdateTask({ ...taskToUpdate, attachments: newAttachments });
        
        // Nếu đang mở modal thì cập nhật state modal luôn
        if (selectedTask?.id === uploadTaskId) {
           setSelectedTask({ ...taskToUpdate, attachments: newAttachments });
        }
      } catch (err) {
        alert('Lỗi tải tệp: ' + (err as any).message);
      } finally {
        setIsUploading(false);
        setUploadTaskId(null);
      }
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTask.title || !newTask.assigneeId) return;
      onUpdateTask({
          ...newTask,
          id: Date.now().toString(),
          departmentId: id!,
          status: 'TODO',
          attachments: []
      } as Task);
      setShowAddModal(false);
      setNewTask({ status: 'TODO', departmentId: id });
  };

  const renderAttachmentPreview = (url: string) => {
    const isImage = url.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp|avif)$/) || url.includes('image');
    const isVideo = url.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/) || url.includes('video');
    const isPDF = url.toLowerCase().match(/\.(pdf)$/) || url.includes('pdf');

    if (isImage) {
      return (
        <div className="rounded-lg overflow-hidden border border-gray-200 mb-2 shadow-sm group relative">
          <img src={url} alt="Báo cáo" className="w-full h-auto max-h-64 object-contain bg-gray-50" />
          <a href={url} target="_blank" rel="noreferrer" className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
             <ArrowUpTrayIcon className="w-4 h-4 rotate-45" />
          </a>
        </div>
      );
    }
    if (isVideo) {
      return (
         <div className="rounded-lg overflow-hidden border border-gray-200 mb-2 bg-black">
           <video controls className="w-full max-h-64">
             <source src={url} />
           </video>
         </div>
      );
    }
    if (isPDF) {
      return (
         <div className="rounded-lg overflow-hidden border border-gray-200 mb-2 h-96 bg-gray-100">
           <iframe src={url} className="w-full h-full" title="PDF Report"></iframe>
         </div>
      );
    }
    return (
      <div className="flex items-center p-3 bg-slate-50 rounded-lg border border-gray-200 text-blue-600 mb-2 hover:bg-blue-50 transition-colors">
        <PaperClipIcon className="w-5 h-5 mr-2" />
        <a href={url} target="_blank" rel="noreferrer" className="underline truncate font-medium">{url.split('/').pop()}</a>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-10">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*,application/pdf,video/*"
        onChange={handleFileChange} 
      />

      {isUploading && (
        <div className="fixed top-4 right-4 z-[100] bg-brand-600 text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 animate-bounce">
           <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
           Đang tải lên Supabase...
        </div>
      )}

      {/* HEADER SECTION */}
      <div className={`${bgHeader} text-white p-6 md:p-8 rounded-2xl shadow-lg relative overflow-hidden`}>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    {currentDept.name}
                    <button onClick={() => setShowAddModal(true)} className="bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-lg backdrop-blur-sm transition-all shadow-sm">
                        <PlusIcon className="w-6 h-6" />
                    </button>
                </h1>
                <p className="opacity-90 max-w-xl text-lg font-light mb-6">{currentDept.description}</p>
                <div className="flex gap-4">
                    <div className="bg-white/20 px-5 py-3 rounded-xl backdrop-blur-md border border-white/10">
                      <span className="block text-3xl font-bold">{employees.filter(e => e.departmentId === id).length}</span>
                      <span className="text-xs uppercase tracking-wider opacity-80">Nhân sự</span>
                    </div>
                    <div className="bg-white/20 px-5 py-3 rounded-xl backdrop-blur-md border border-white/10">
                      <span className="block text-3xl font-bold">{tasks.filter(tsk => tsk.status !== 'DONE').length}</span>
                      <span className="text-xs uppercase tracking-wider opacity-80">Công việc tồn</span>
                    </div>
                </div>
            </div>
            <div className="mt-6 md:mt-0 flex items-center justify-center bg-white/10 rounded-2xl p-2 backdrop-blur-sm border border-white/10">
                 <div className="w-32 h-32 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={taskStats} cx="50%" cy="50%" innerRadius={25} outerRadius={40} paddingAngle={5} dataKey="value" stroke="none">
                                {taskStats.map((_, index) => <Cell key={index} fill={CHART_COLORS[index]} />)}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-xs font-bold">{tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'DONE').length / tasks.length) * 100) : 0}%</span>
                    </div>
                 </div>
            </div>
        </div>
      </div>

      {/* TASK KANBAN COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {['TODO', 'IN_PROGRESS', 'DONE'].map(status => {
            const taskList = tasks.filter(t => status === 'IN_PROGRESS' ? (t.status === 'IN_PROGRESS' || t.status === 'REVIEW') : t.status === status);
            return (
              <div key={status} className="bg-gray-100/50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-600 dark:text-gray-400 mb-4 flex justify-between">
                  <span>{getStatusLabel(status as any)}</span>
                  <span className="bg-white dark:bg-gray-700 px-2 rounded-full text-xs">{taskList.length}</span>
                </h3>
                <div className="space-y-3">
                  {taskList.map(task => (
                    <div key={task.id} onClick={() => setSelectedTask(task)} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{task.title}</h4>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <div className="flex items-center gap-1"><ClockIcon className="w-3 h-3"/> {task.dueDate}</div>
                        {task.attachments?.length > 0 && <div className="flex items-center gap-1 text-brand-600"><PaperClipIcon className="w-3 h-3"/> {task.attachments.length}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
        })}
      </div>

      {/* TASK DETAIL MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden print:bg-white">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800 print:hidden">
              <h2 className="text-xl font-bold">{selectedTask.title}</h2>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="p-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50"><PrinterIcon className="w-5 h-5"/></button>
                <button onClick={() => setSelectedTask(null)} className="p-2 text-gray-400 hover:text-red-500"><XMarkIcon className="w-6 h-6"/></button>
              </div>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Người phụ trách</label>
                  <div className="flex items-center mt-2">
                    <img src={employees.find(e => e.id === selectedTask.assigneeId)?.avatarUrl} className="w-10 h-10 rounded-full mr-3 border" />
                    <span className="font-bold">{employees.find(e => e.id === selectedTask.assigneeId)?.fullName}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Hạn chót & Trạng thái</label>
                  <div className="mt-2 font-medium flex items-center gap-4">
                    <span className="flex items-center gap-1"><CalendarIcon className="w-4 h-4 text-brand-500"/> {selectedTask.dueDate}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(selectedTask.status)}`}>{getStatusLabel(selectedTask.status)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Nội dung chi tiết</label>
                <p className="mt-2 text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">{selectedTask.description}</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Báo cáo & Tài liệu ({selectedTask.attachments?.length || 0})</label>
                  <button onClick={() => triggerUpload(selectedTask.id)} className="text-brand-600 hover:text-brand-700 text-sm font-bold flex items-center gap-1 print:hidden">
                    <ArrowUpTrayIcon className="w-4 h-4"/> Tải lên báo cáo
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTask.attachments?.map((url, idx) => <div key={idx}>{renderAttachmentPreview(url)}</div>)}
                  {(!selectedTask.attachments || selectedTask.attachments.length === 0) && <p className="text-sm text-gray-400 italic">Chưa có báo cáo đính kèm.</p>}
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 dark:bg-gray-800 flex justify-end print:hidden">
              <button onClick={() => setSelectedTask(null)} className="px-6 py-2 bg-gray-200 rounded-lg font-bold">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD TASK MODAL (Minimal) */}
      {showAddModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
           <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
             <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-xl font-bold">Thêm công việc mới</h3>
                <button onClick={() => setShowAddModal(false)}><XMarkIcon className="w-6 h-6"/></button>
             </div>
             <form onSubmit={handleCreateTask} className="p-6 space-y-4">
               <input required placeholder="Tiêu đề..." className="w-full p-3 bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" value={newTask.title || ''} onChange={e => setNewTask({...newTask, title: e.target.value})} />
               <select required className="w-full p-3 bg-gray-100 rounded-lg" value={newTask.assigneeId || ''} onChange={e => setNewTask({...newTask, assigneeId: e.target.value})}>
                 <option value="">Chọn nhân sự...</option>
                 {employees.filter(e => e.departmentId === id).map(e => <option key={e.id} value={e.id}>{e.fullName}</option>)}
               </select>
               <input type="date" className="w-full p-3 bg-gray-100 rounded-lg" value={newTask.dueDate || ''} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
               <textarea placeholder="Mô tả..." className="w-full p-3 bg-gray-100 rounded-lg h-32" value={newTask.description || ''} onChange={e => setNewTask({...newTask, description: e.target.value})} />
               <button className="w-full py-3 bg-brand-600 text-white rounded-lg font-bold shadow-lg shadow-brand-500/30">Lưu công việc</button>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};
