
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { DepartmentView } from './pages/DepartmentView';
import { Tasks } from './pages/Tasks';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { AppState, Role, Department, Task, Employee } from './types';
import { DataService } from './services/dataService';
import { useEmployees } from './modules/employees/employee.hooks';
import { useTasks } from './modules/tasks/task.hooks';
import { employeeService } from './modules/employees/employee.service';
import { taskService } from './modules/tasks/task.service';
import { useAuth } from './hooks/useAuth';
import { authService } from './modules/auth/auth.service';

const App: React.FC = () => {
  const { user, profile, loading: authLoading, isAuthenticated } = useAuth();
  
  const [appState, setAppState] = useState<AppState>({
    user: null,
    language: 'vi',
    darkMode: false,
    appName: 'TBS CRM'
  });

  const { employees, setEmployees, loading: empLoading } = useEmployees();
  const { tasks, setTasks, loading: taskLoading } = useTasks();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  // Cập nhật appState khi Auth Profile thay đổi
  useEffect(() => {
    if (isAuthenticated && profile) {
      setAppState(prev => ({
        ...prev,
        user: {
          id: user.id,
          name: profile.full_name || user.email,
          email: user.email,
          role: profile.role as Role,
          avatar: profile.avatar_url || 'https://i.pravatar.cc/150',
          departmentId: profile.department_id
        }
      }));
      loadSupportData();
    } else {
      setAppState(prev => ({ ...prev, user: null }));
    }
  }, [isAuthenticated, profile, user]);

  const loadSupportData = async () => {
    try {
      const [depts, lgs] = await Promise.all([
          DataService.getDepartments(),
          DataService.getLogs()
      ]);
      setDepartments(depts);
      setLogs(lgs);
    } catch (e) {
      console.error("Lỗi tải dữ liệu ban đầu:", e);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    // useAuth hook sẽ tự động xóa state
  };

  useEffect(() => {
    if (appState.darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [appState.darkMode]);

  const toggleTheme = () => setAppState(prev => ({ ...prev, darkMode: !prev.darkMode }));
  const toggleLang = () => setAppState(prev => ({ ...prev, language: prev.language === 'vi' ? 'en' : 'vi' }));
  const setAppName = (name: string) => setAppState(prev => ({ ...prev, appName: name }));

  const handleSaveEmployee = async (emp: Employee) => {
    const saved = await employeeService.saveEmployee(emp);
    setEmployees(prev => {
        const exists = prev.some(e => e.id === saved.id);
        return exists ? prev.map(e => e.id === saved.id ? saved : e) : [...prev, saved];
    });
  };
  
  const handleDeleteEmployee = async (id: string) => {
    await employeeService.removeEmployee(id);
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  const handleSaveTask = async (task: Task) => {
    const saved = await taskService.saveTask(task);
    setTasks(prev => {
      const exists = prev.some(t => t.id === saved.id);
      return exists ? prev.map(t => t.id === saved.id ? saved : t) : [...prev, saved];
    });
  };

  const handleDeleteTask = async (id: string) => {
    await taskService.removeTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleSaveDepartment = async (dept: Department) => {
    const updated = await DataService.saveDepartment(dept);
    setDepartments(prev => {
      const exists = prev.some(d => d.id === updated.id);
      return exists ? prev.map(d => d.id === updated.id ? updated : d) : [...prev, updated];
    });
  };

  if (authLoading) {
     return (
       <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-600 border-t-transparent mb-4"></div>
          <p className="text-gray-500 font-bold animate-pulse">ĐANG XÁC THỰC PHIÊN LÀM VIỆC...</p>
       </div>
     );
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/*" element={
          isAuthenticated && appState.user ? (
            <Layout
                userRole={appState.user.role}
                userDepartmentId={appState.user.departmentId}
                departments={departments}
                lang={appState.language}
                darkMode={appState.darkMode}
                toggleTheme={toggleTheme}
                toggleLang={toggleLang}
                onLogout={handleLogout}
                appName={appState.appName}
                setAppName={setAppName}
            >
                {(empLoading || taskLoading) ? (
                   <div className="h-full w-full flex items-center justify-center">
                     <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-600"></div>
                   </div>
                ) : (
                    <Routes>
                        <Route path="/" element={<Dashboard employees={employees} departments={departments} tasks={tasks} lang={appState.language} />} />
                        <Route path="/reports" element={<Reports tasks={tasks} employees={employees} departments={departments} lang={appState.language} />} />
                        
                        {/* Protected Routes for Admin/Manager */}
                        {(appState.user.role === Role.ADMIN || appState.user.role === Role.MANAGER) && (
                            <>
                                <Route path="/employees" element={
                                    <Employees 
                                        employees={employees} departments={departments} lang={appState.language}
                                        onAdd={handleSaveEmployee} onEdit={handleSaveEmployee} onDelete={handleDeleteEmployee}
                                        currentUserRole={appState.user.role} currentUserDept={appState.user.departmentId}
                                    />
                                } />
                                <Route path="/tasks" element={
                                    <Tasks tasks={tasks} employees={employees} departments={departments} lang={appState.language} onSaveTask={handleSaveTask} onDeleteTask={handleDeleteTask} />
                                } />
                            </>
                        )}

                        <Route path="/department/:id" element={
                            <DepartmentView departments={departments} employees={employees} allTasks={tasks} lang={appState.language} userRole={appState.user.role} onUpdateTask={handleSaveTask} />
                        } />

                        {appState.user.role === Role.ADMIN && (
                            <Route path="/settings" element={
                                <Settings departments={departments} employees={employees} logs={logs} lang={appState.language} onSaveDept={handleSaveDepartment} onDeleteDept={(id) => DataService.deleteDepartment(id).then(loadSupportData)} /> 
                            } />
                        )}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                )}
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
      </Routes>
    </HashRouter>
  );
};

export default App;
