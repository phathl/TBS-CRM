
import { taskRepo } from './task.repository';
import { Task } from '../../types';

export const taskService = {
  async getTasks() {
    return await taskRepo.getAll();
  },

  async saveTask(task: Task) {
    return await taskRepo.upsert(task);
  },

  async removeTask(id: string) {
    return await taskRepo.delete(id);
  }
};
