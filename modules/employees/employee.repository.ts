
import { supabase } from '../../lib/supabase/client';
import { Employee } from './employee.types';
import { MOCK_EMPLOYEES } from '../../constants';

export const employeeRepo = {
  async getAll(): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('fullName', { ascending: true });
      
    if (error) {
      console.warn('DB Error, using mock data:', error.message);
      return MOCK_EMPLOYEES as Employee[];
    }
    return data as Employee[];
  },

  async upsert(employee: Employee): Promise<Employee> {
    // Supabase upsert dựa trên Primary Key (id)
    const { data, error } = await supabase
      .from('employees')
      .upsert(employee)
      .select()
      .single();

    if (error) {
      console.error('Error in employeeRepo.upsert:', error);
      throw error;
    }
    return data as Employee;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
