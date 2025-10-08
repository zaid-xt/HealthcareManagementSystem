import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Staff {
  id: string;
  user_id: string | null;
  employee_id: string;
  full_name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  hire_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Shift {
  id: string;
  staff_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  department: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface StaffWithShift extends Staff {
  current_shift: Shift | null;
}

export const getAllStaff = async (): Promise<Staff[]> => {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .order('full_name');

  if (error) throw error;
  return data || [];
};

export const getStaffWithCurrentShifts = async (date: string): Promise<StaffWithShift[]> => {
  const { data: staff, error: staffError } = await supabase
    .from('staff')
    .select('*')
    .eq('status', 'Active')
    .order('full_name');

  if (staffError) throw staffError;

  const { data: shifts, error: shiftsError } = await supabase
    .from('shifts')
    .select('*')
    .eq('shift_date', date);

  if (shiftsError) throw shiftsError;

  const staffWithShifts: StaffWithShift[] = (staff || []).map(s => {
    const currentShift = (shifts || []).find(sh => sh.staff_id === s.id);
    return {
      ...s,
      current_shift: currentShift || null
    };
  });

  return staffWithShifts;
};

export const getTodayShifts = async (): Promise<Shift[]> => {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('shift_date', today)
    .order('start_time');

  if (error) throw error;
  return data || [];
};

export const getStaffById = async (id: string): Promise<Staff | null> => {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const createStaff = async (staffData: Partial<Staff>): Promise<Staff> => {
  const { data, error } = await supabase
    .from('staff')
    .insert([staffData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateStaff = async (id: string, staffData: Partial<Staff>): Promise<Staff> => {
  const { data, error } = await supabase
    .from('staff')
    .update({ ...staffData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteStaff = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('staff')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const createShift = async (shiftData: Partial<Shift>): Promise<Shift> => {
  const { data, error } = await supabase
    .from('shifts')
    .insert([shiftData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateShift = async (id: string, shiftData: Partial<Shift>): Promise<Shift> => {
  const { data, error } = await supabase
    .from('shifts')
    .update({ ...shiftData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteShift = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('shifts')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
