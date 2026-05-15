import { supabaseClient } from '../lib/supabaseClient';

export interface Employee {
  id: string;
  full_name: string;
  email: string;
  department: string;
}

export const employeeService = {
  async getEmployees(): Promise<Employee[]> {
    const { data, error } = await supabaseClient
      .from('employees')
      .select('id, full_name, email, department')
      .order('full_name');

    if (error) {
      console.error("Error fetching employees:", error);
      throw new Error(`Failed to load employees: ${error.message}`);
    }
    return data || [];
  }
};
