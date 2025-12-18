
export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
  VIEWER = 'VIEWER'
}

export enum Gender {
  MALE = 'Nam',
  FEMALE = 'Nữ',
  OTHER = 'Khác'
}

export enum EmployeeStatus {
  ACTIVE = 'Đang làm việc',
  PROBATION = 'Thử việc',
  RESIGNED = 'Đã nghỉ việc',
  LEAVE = 'Nghỉ phép'
}

export interface Department {
  id: string;
  name: string;
  managerId?: string;
  description?: string;
}

export interface SalaryConfig {
  baseSalary: number; // Lương cơ bản
  allowances: {
    phone: number;
    housing: number;
    social: number; // An sinh
    dependents: number; // Trợ cấp người phụ thuộc (số tiền)
    travel: number; // Công tác phí
    bonus: number; // Khen thưởng
  };
  dependentCount: number; // Số người phụ thuộc (để tính thuế)
}

export interface Employee {
  id: string;
  code: string;
  fullName: string;
  phone: string;
  email: string;
  username?: string; // New field for Login
  password?: string; // New field for Login (Not recommended to store plain text in real production, but added as per request)
  dob: string;
  departmentId: string;
  position: string;
  status: EmployeeStatus;
  avatarUrl: string;
  gender: Gender;
  startDate: string;
  contractType: string;
  notes: string;
  salary: SalaryConfig;
  workDays: number;
}

export interface Task {
  id: string;
  title: string;
  assigneeId: string;
  departmentId: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  dueDate: string;
  description: string;
  attachments: string[]; // URLs to images or PDFs
  feedback?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

export interface AppState {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatar: string;
    departmentId?: string; 
  } | null;
  language: 'vi' | 'en';
  darkMode: boolean;
  appName: string;
}
