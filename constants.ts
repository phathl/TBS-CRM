
import { Employee, EmployeeStatus, Gender, Role, Department, Task, AuditLog } from './types';

// Department Color Mapping (CSS Classes or Hex codes)
export const DEPT_COLORS: Record<string, string> = {
  'RD': 'bg-blue-600',       // R&D: Blue
  'TMH': 'bg-pink-600',      // TMH: Pink
  'QLCL': 'bg-cyan-600',     // QLCL: Cyan
  'KH': 'bg-orange-600',     // KH: Orange
  'DEFAULT': 'bg-brand-600'
};

export const TRANSLATIONS = {
  vi: {
    dashboard: 'Tổng quan',
    employees: 'Nhân sự',
    departments: 'Phòng ban',
    settings: 'Cài đặt',
    logout: 'Đăng xuất',
    search: 'Tìm kiếm nhân viên, mã số...',
    addEmployee: 'Thêm nhân viên',
    filter: 'Bộ lọc',
    export: 'Xuất báo cáo',
    tasks: 'Công việc',
    reports: 'Báo cáo kết quả', // New
    taskManagement: 'Quản lý công việc',
    createTask: 'Giao việc mới',
    profile: 'Hồ sơ cá nhân',
    language: 'Ngôn ngữ',
    darkMode: 'Giao diện tối',
    role: 'Vai trò',
    status: 'Trạng thái',
    actions: 'Hành động',
    save: 'Lưu lại',
    cancel: 'Hủy bỏ',
    delete: 'Xóa',
    edit: 'Chỉnh sửa',
    view: 'Chi tiết',
    print: 'In báo cáo', // Updated
    upload: 'Tải đính kèm', // Updated
    task_todo: 'Cần làm',
    task_progress: 'Đang thực hiện', 
    task_review: 'Chờ duyệt',
    task_done: 'Hoàn thành',       
    approve: 'Duyệt',
    reject: 'Từ chối',
    assignTo: 'Người thực hiện',
    dueDate: 'Hạn chót',
    title: 'Tiêu đề công việc',
    description: 'Mô tả chi tiết',
    selectDept: 'Chọn phòng ban',
    selectEmp: 'Chọn nhân viên',
    changePassword: 'Đổi mật khẩu',
    newPassword: 'Mật khẩu mới',
    confirmPassword: 'Xác nhận mật khẩu',
    passwordUpdated: 'Đã cập nhật mật khẩu thành công!',
    personalInfo: 'Thông tin cá nhân',
    onlineMembers: 'Thành viên trực tuyến',
    recentActivity: 'Hoạt động gần đây',
    activeTasks: 'Công việc đang thực hiện',
    attachments: 'Tài liệu đính kèm',
    preview: 'Xem trước',
    close: 'Đóng',
    payroll: 'Bảng lương & Chấm công',
    baseSalary: 'Lương cơ bản',
    workDays: 'Ngày công',
    totalIncome: 'Tổng thu nhập',
    netSalary: 'Thực lĩnh',
    tax: 'Thuế TNCN',
    updateAttendance: 'Cập nhật chấm công',
    reportPeriod: 'Kỳ báo cáo', // New
    day: 'Ngày',
    week: 'Tuần',
    month: 'Tháng',
    totalTasks: 'Tổng công việc',
    completionRate: 'Tỷ lệ hoàn thành'
  },
  en: {
    dashboard: 'Dashboard',
    employees: 'Employees',
    departments: 'Departments',
    settings: 'Settings',
    logout: 'Logout',
    search: 'Search...',
    addEmployee: 'Add Employee',
    filter: 'Filter',
    export: 'Export',
    tasks: 'Tasks',
    reports: 'Work Reports', // New
    taskManagement: 'Task Management',
    createTask: 'Create Task',
    profile: 'Profile',
    language: 'Language',
    darkMode: 'Dark Mode',
    role: 'Role',
    status: 'Status',
    actions: 'Actions',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    print: 'Print Report', // Updated
    upload: 'Upload Attachment', // Updated
    task_todo: 'To Do',
    task_progress: 'In Progress',
    task_review: 'In Review',
    task_done: 'Done',
    approve: 'Approve',
    reject: 'Reject',
    assignTo: 'Assign To',
    dueDate: 'Due Date',
    title: 'Title',
    description: 'Description',
    selectDept: 'Select Department',
    selectEmp: 'Select Employee',
    changePassword: 'Change Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    passwordUpdated: 'Password updated successfully!',
    personalInfo: 'Personal Info',
    onlineMembers: 'Online Members',
    recentActivity: 'Recent Activity',
    activeTasks: 'Active Tasks',
    attachments: 'Attachments',
    preview: 'Preview',
    close: 'Close',
    payroll: 'Payroll & Attendance',
    baseSalary: 'Base Salary',
    workDays: 'Work Days',
    totalIncome: 'Total Income',
    netSalary: 'Net Salary',
    tax: 'Income Tax',
    updateAttendance: 'Update Attendance',
    reportPeriod: 'Report Period', // New
    day: 'Day',
    week: 'Week',
    month: 'Month',
    totalTasks: 'Total Tasks',
    completionRate: 'Completion Rate'
  }
};

export const MOCK_DEPARTMENTS: Department[] = [
  { id: 'RD', name: 'Nghiên cứu & Phát triển (R&D)', managerId: '1', description: 'Phòng sáng tạo và phát triển mẫu' },
  { id: 'TMH', name: 'Thương mại hóa (TMH)', managerId: '2', description: 'Phòng kinh doanh và sản phẩm' },
  { id: 'QLCL', name: 'Quản lý chất lượng (QC)', managerId: '3', description: 'Kiểm soát chất lượng đầu ra' },
  { id: 'KH', name: 'Kế hoạch tổng hợp', managerId: 'EMP004', description: 'Điều phối sản xuất' },
];

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: '1',
    code: 'TBS-001',
    fullName: 'Nguyễn Văn A',
    email: 'a.nguyen@tbs.com',
    phone: '0909123456',
    dob: '1990-01-01',
    departmentId: 'RD',
    position: 'Trưởng phòng',
    status: EmployeeStatus.ACTIVE,
    avatarUrl: 'https://i.pravatar.cc/150?u=1',
    gender: Gender.MALE,
    startDate: '2020-01-01',
    contractType: 'Dài hạn',
    notes: 'Quản lý R&D',
    workDays: 24,
    salary: {
      baseSalary: 25000000,
      dependentCount: 1,
      allowances: { phone: 500000, housing: 2000000, social: 1000000, dependents: 0, travel: 1000000, bonus: 2000000 }
    }
  },
  {
    id: '2',
    code: 'TBS-002',
    fullName: 'Trần Thị B',
    email: 'b.tran@tbs.com',
    phone: '0909123457',
    dob: '1995-05-15',
    departmentId: 'TMH',
    position: 'Chuyên viên',
    status: EmployeeStatus.ACTIVE,
    avatarUrl: 'https://i.pravatar.cc/150?u=2',
    gender: Gender.FEMALE,
    startDate: '2021-06-01',
    contractType: '1 Năm',
    notes: '',
    workDays: 26,
    salary: {
      baseSalary: 15000000,
      dependentCount: 0,
      allowances: { phone: 300000, housing: 1000000, social: 500000, dependents: 0, travel: 500000, bonus: 1000000 }
    }
  },
  {
    id: '3',
    code: 'TBS-003',
    fullName: 'Lê Văn C',
    email: 'c.le@tbs.com',
    phone: '0909123458',
    dob: '1998-12-20',
    departmentId: 'QLCL',
    position: 'Nhân viên QC',
    status: EmployeeStatus.PROBATION,
    avatarUrl: 'https://i.pravatar.cc/150?u=3',
    gender: Gender.MALE,
    startDate: '2023-10-01',
    contractType: 'Thử việc',
    notes: '',
    workDays: 22,
    salary: {
      baseSalary: 8000000,
      dependentCount: 0,
      allowances: { phone: 200000, housing: 0, social: 0, dependents: 0, travel: 0, bonus: 0 }
    }
  }
];

export const MOCK_TASKS: Task[] = [
  {
    id: 'T1',
    title: 'Nghiên cứu mẫu giày mới Gen-Z',
    assigneeId: '1',
    departmentId: 'RD',
    status: 'IN_PROGRESS',
    dueDate: '2023-11-30',
    description: 'Nghiên cứu vật liệu đế mới nhẹ hơn 20%. Cần so sánh với mẫu đối thủ.',
    attachments: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', // Image
      'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' // PDF
    ]
  },
  {
    id: 'T2',
    title: 'Kiểm tra độ bền lô hàng X5',
    assigneeId: '3',
    departmentId: 'QLCL',
    status: 'TODO',
    dueDate: '2023-11-15',
    description: 'Kiểm tra độ bền kéo và ma sát theo tiêu chuẩn ISO',
    attachments: [
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' // Video
    ]
  },
  {
    id: 'T3',
    title: 'Báo cáo doanh thu Quý 3',
    assigneeId: '2',
    departmentId: 'TMH',
    status: 'DONE',
    dueDate: '2023-10-30',
    description: 'Tổng hợp số liệu bán hàng kênh online',
    attachments: []
  }
];

export const MOCK_LOGS: AuditLog[] = [
  { id: 'L1', action: 'CREATE', user: 'admin@tbs.com', timestamp: '2023-11-01 08:00', details: 'Added Employee TBS-003' },
  { id: 'L2', action: 'UPDATE', user: 'manager@tbs.com', timestamp: '2023-11-02 09:30', details: 'Updated Task T1 status' },
];
