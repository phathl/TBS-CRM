import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { DepartmentView } from './pages/DepartmentView';
import { Tasks } from './pages/Tasks';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

import { Role, Department, Task, Employee, AppState } from './types';
import { DataService } from './services/dataService';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  const { user, profile, loading, isAuthenticated } = useAuth();

  const [appState, setAppState] = useState<AppState>({
    user: null,
    language: 'vi',
    darkMode: false,
    appName: 'TBS CRM',
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  // 🔹 Sync Auth → AppState
  useEffect(() => {
    if (isAuthenticated && user && profile) {
      setAppState(prev => ({
        ...prev,
        user: {
          id: user.id,
          email: user.email!,
          name: profile.full_name || user.email!,
          role: profile.role as Role,
          avatar: profile.avatar_url || 'https://i.pravatar.cc/150',
          departmentId: profile.department_id,
        },
      }));

      loadInitialData();
    } else {
      setAppState(prev => ({ ...prev, user: null }));
    }
  }, [isAuthenticated, user, profile]);

  const loadInitialData = async () => {
    const [emps, tks, depts, lgs] = await Promise.all([
      DataService.getEmployees(),
      DataService.getTasks(),
      DataService.getDepartments(),
      DataService.getLogs(),
    ]);

    setEmployees(emps);
    setTasks(tks);
    setDepartments(depts);
    setLogs(lgs);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <span>Đang xác thực phiên đăng nhập...</span>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>

        {/* 🔐 LOGIN */}
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
        />

        {/* 🔑 RESET PASSWORD */}
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* 🔒 PRIVATE ROUTES */}
        <Route
          path="/*"
          element={
            isAuthenticated && appState.user ? (
              <Layout
                userRole={appState.user.role}
                userDepartmentId={appState.user.departmentId}
                departments={departments}
                lang={appState.language}
                darkMode={appState.darkMode}
                toggleTheme={() =>
                  setAppState(p => ({ ...p, darkMode: !p.darkMode }))
                }
                toggleLang={() =>
                  setAppState(p => ({
                    ...p,
                    language: p.language === 'vi' ? 'en' : 'vi',
                  }))
                }
                onLogout={() => DataService.logout()}
                appName={appState.appName}
                setAppName={name =>
                  setAppState(p => ({ ...p, appName: name }))
                }
              >
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/reports" element={<Reports />} />

                  {(appState.user.role === Role.ADMIN ||
                    appState.user.role === Role.MANAGER) && (
                    <>
                      <Route path="/employees" element={<Employees />} />
                      <Route path="/tasks" element={<Tasks />} />
                    </>
                  )}

                  <Route
                    path="/department/:id"
                    element={<DepartmentView />}
                  />

                  {appState.user.role === Role.ADMIN && (
                    <Route path="/settings" element={<Settings />} />
                  )}

                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
