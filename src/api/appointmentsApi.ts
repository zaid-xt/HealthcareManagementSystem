import { supabase } from '../lib/supabaseClient';
import type { Appointment } from '../types';

export interface AppointmentCreate {
  patient_id: string;
  doctor_id: string;
  date: string;
  start_time: string;
  end_time: string;
  type: 'regular' | 'follow-up' | 'emergency';
  notes?: string;
  created_by: string;
}

export interface AppointmentUpdate {
  date?: string;
  start_time?: string;
  end_time?: string;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
}

export const appointmentsApi = {
  async getAll(userId: string, userRole: string): Promise<Appointment[]> {
    let query = supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (userRole === 'patient') {
      query = query.eq('patient_id', userId);
    } else if (userRole === 'doctor') {
      query = query.eq('doctor_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(appointment => ({
      id: appointment.id,
      patientId: appointment.patient_id,
      doctorId: appointment.doctor_id,
      date: appointment.date,
      startTime: appointment.start_time,
      endTime: appointment.end_time,
      status: appointment.status,
      type: appointment.type,
      notes: appointment.notes,
      createdBy: appointment.created_by,
    }));
  },

  async create(appointment: AppointmentCreate): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointment])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      patientId: data.patient_id,
      doctorId: data.doctor_id,
      date: data.date,
      startTime: data.start_time,
      endTime: data.end_time,
      status: data.status,
      type: data.type,
      notes: data.notes,
      createdBy: data.created_by,
    };
  },

  async update(id: string, updates: AppointmentUpdate): Promise<Appointment> {
    const updateData: any = {};

    if (updates.date) updateData.date = updates.date;
    if (updates.start_time) updateData.start_time = updates.start_time;
    if (updates.end_time) updateData.end_time = updates.end_time;
    if (updates.status) updateData.status = updates.status;
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    const { data, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      patientId: data.patient_id,
      doctorId: data.doctor_id,
      date: data.date,
      startTime: data.start_time,
      endTime: data.end_time,
      status: data.status,
      type: data.type,
      notes: data.notes,
      createdBy: data.created_by,
    };
  },

  async cancel(id: string): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) throw error;
  },
};
