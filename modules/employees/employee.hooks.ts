
import { useState, useEffect } from 'react';
import { employeeService } from './employee.service';
import { Employee } from './employee.types';

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.fetchEmployees();
      setEmployees(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  return { 
    employees, 
    loading, 
    error, 
    refresh: loadEmployees,
    setEmployees 
  };
}
