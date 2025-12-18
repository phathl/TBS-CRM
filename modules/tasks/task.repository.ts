
import { supabase } from '../../lib/supabase/client';
import { Task } from '../../types';
import { MOCK_TASKS } from '../../constants';

export const taskRepo = {
  async getAll(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('dueDate', { ascending: true });
      
    if (error) {
      console.warn('Task fetch error, using mocks:', error.message);
      return MOCK_TASKS;
    }
    return data as Task[];
  },

  async upsert(task: Task): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .upsert(task)
      .select()
      .single();

    if (error) throw error;
    return data as Task;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
