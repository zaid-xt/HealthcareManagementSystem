import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, FileText, User, MapPin, Stethoscope, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { doctors } from '../../utils/mockData';
import type { Appointment } from '../../types';

interface AppointmentFormProps {
  onSubmit: (appointment: Partial<Appointment>) => void;
  isLoading?: boolean;
  initialData?: Appointment; // Add this for edit mode
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ 
  onSubmit, 
  isLoading, 
  initialData 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    doctorId: initialData?.doctorId || '',
    date: initialData?.date || '',
    time: initialData?.startTime || '',
    type: initialData?.type || 'regular',
    notes: initialData?.notes || ''
  });
  
  
  const [formErrors, setFormErrors] = useState({
    doctorId: '',
    date: '',
    time: '',
  });

  const [currentStep, setCurrentStep] = useState(1);

  // Filter available time slots based on selected date and doctor
  const availableTimeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const getDoctorDetails = (doctorId: string) => {
    return doctors.find(d => d.id === doctorId);
  };

  const validateStep1 = () => {
    const errors = { doctorId: '', date: '', time: '' };
    let isValid = true;

    if (!formData.doctorId) {
      errors.doctorId = 'Please select a doctor';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const validateStep2 = () => {
    const errors = { doctorId: '', date: '', time: '' };
    let isValid = true;

    if (!formData.date) {
      errors.date = 'Please select a date';
      isValid = false;
    }

    if (!formData.time) {
      errors.time = 'Please select a time';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;
    
    const [hours, minutes] = formData.time.split(':');
    const startTime = `${formData.time}`;
    const endTime = `${String(Number(hours) + (Number(minutes) + 30 >= 60 ? 1 : 0)).padStart(2, '0')}:${String((Number(minutes) + 30) % 60).padStart(2, '0')}`;
    
    onSubmit({
      doctorId: formData.doctorId,
      patientId: user?.id || '',
      date: formData.date,
      startTime,
      endTime,
      type: formData.type as Appointment['type'],
      notes: formData.notes,
      status: 'scheduled'
    });
  };

  const selectedDoctor = getDoctorDetails(formData.doctorId);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step <= currentStep 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-24 h-1 mx-4 ${
                  step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span className={currentStep >= 1 ? 'text-blue-600 font-medium' : ''}>Select Doctor</span>
          <span className={currentStep >= 2 ? 'text-blue-600 font-medium' : ''}>Date & Time</span>
          <span className={currentStep >= 3 ? 'text-blue-600 font-medium' : ''}>Confirmation</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Doctor Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select a Doctor</h2>
              <p className="text-gray-600 mb-6">Choose from our specialist doctors</p>
              
              <div className="grid gap-4">
                {doctors.map(doctor => (
                  <div
                    key={doctor.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      formData.doctorId === doctor.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, doctorId: doctor.id }))}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <User className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Stethoscope className="h-4 w-4 mr-1" />
                          {doctor.specialization}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {doctor.department}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Experience</div>
                        <div className="font-semibold text-gray-900">{doctor.experience} years</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {formErrors.doctorId && (
                <div className="flex items-center mt-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {formErrors.doctorId}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Date & Time Selection */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Date & Time</h2>
              <p className="text-gray-600 mb-6">Choose your preferred appointment slot</p>
              
              {selectedDoctor && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">{selectedDoctor.specialization}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Date
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    error={formErrors.date}
                    leftIcon={<Calendar className="h-4 w-4" />}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Available Time Slots
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {availableTimeSlots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, time: slot }))}
                        className={`p-3 text-sm rounded-lg border transition-all ${
                          formData.time === slot
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                  {formErrors.time && (
                    <div className="flex items-center mt-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formErrors.time}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Appointment Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'regular', label: 'Regular Checkup', description: 'Routine examination' },
                    { value: 'follow-up', label: 'Follow-up', description: 'Previous visit follow-up' },
                    { value: 'emergency', label: 'Emergency', description: 'Urgent care needed' }
                  ].map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        formData.type === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{type.label}</div>
                      <div className="text-sm text-gray-500 mt-1">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Confirm Appointment</h2>
              <p className="text-gray-600 mb-6">Please review your appointment details</p>
              
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                {selectedDoctor && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="font-medium text-gray-700">Doctor:</span>
                    <span className="text-gray-900">
                      Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Date:</span>
                  <span className="text-gray-900">
                    {new Date(formData.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Time:</span>
                  <span className="text-gray-900">{formData.time} - {formData.endTime}</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Type:</span>
                  <span className="text-gray-900 capitalize">{formData.type.replace('-', ' ')}</span>
                </div>
                
                <div className="pt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Any symptoms, concerns, or information you'd like to share with the doctor..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={currentStep === 1 ? () => navigate(-1) : handleBack}
          >
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </Button>
          
          <div className="flex space-x-4">
            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
              >
                Continue
              </Button>
            ) : (
              <Button
                type="submit"
                isLoading={isLoading}
              >
                 {initialData ? 'Update Appointment' : 'Schedule Appointment'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;