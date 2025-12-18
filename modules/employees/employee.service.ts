
import { employeeRepo } from './employee.repository';
import { Employee } from './employee.types';

export const employeeService = {
  async fetchEmployees() {
    return await employeeRepo.getAll();
  },
  
  async saveEmployee(employee: Employee) {
    // Add business logic/validation here
    return await employeeRepo.upsert(employee);
  },

  async removeEmployee(id: string) {
    return await employeeRepo.delete(id);
  }
};
