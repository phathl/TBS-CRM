
import { EmployeeStatus, Gender, SalaryConfig } from '../../types';

export interface Employee {
  id: string;
  code: string;
  fullName: string;
  phone: string;
  email: string;
  username?: string;
  password?: string;
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
