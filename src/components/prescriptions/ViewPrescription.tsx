import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Stethoscope, Pill, Edit2, FileText, Printer, Download } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import type { Prescription } from '../../types';

interface ViewPrescriptionProps {
  prescription: Prescription;
  onClose: () => void;
  onEdit: () => void;
}

interface PatientData {
  name: string;
  idNumber: string;
  contact: string;
  email: string;
}

const ViewPrescription: React.FC<ViewPrescriptionProps> = ({
  prescription,
  onClose,
  onEdit
}) => {
  const { user } = useAuth();
  
  const prescriptionMedications = prescription.medications || [];
  const canEdit = (user?.role === 'doctor' && prescription.doctorId === user.id) || user?.role === 'admin';
  
  const [patientData, setPatientData] = useState<PatientData>({
    name: 'Loading...',
    idNumber: 'Loading...',
    contact: 'Loading...',
    email: 'Loading...'
  });
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        // First, check if prescription already has complete patient data
        const hasCompletePrescriptionData =
          !!prescription.patientName &&
          !!prescription.patientIdNumber &&
          !!prescription.patientContact &&
          !!prescription.patientEmail;

        if (hasCompletePrescriptionData) {
          // Use data from prescription if it's complete (fall back to patientId)
          setPatientData({
            name: prescription.patientName,
            idNumber: prescription.patientIdNumber || prescription.patientId,
            contact: prescription.patientContact,
            email: prescription.patientEmail
          });
        } else {
          // Otherwise fetch patient data separately to ensure we get all fields
          const response = await fetch(`http://localhost:5000/api/users/${prescription.patientId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch patient data');
          }
          
          const patient = await response.json();
          // Debug: inspect returned patient object to confirm field names
          console.log('Fetched patient:', patient);

          // Accept common field name variants for the ID number and contact
          const idNumberVal =
            patient.idNumber ??
            patient.id_number ??
            patient.identityNumber ??
            patient.identity_number ??
            patient.nationalId ??
            patient.idNo ??
            patient.documentId ??
            patient.identificationNumber ??
            patient.id ?? // some APIs return `id`
            'N/A';

          const contactVal =
            patient.contactNumber ??
            patient.phone ??
            patient.phoneNumber ??
            patient.mobile ??
            'N/A';

          setPatientData({
            name: patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'N/A',
            idNumber: idNumberVal,
            contact: contactVal,
            email: patient.email || 'N/A'
          });
        }
      } catch (error) {
        console.error('Failed to fetch patient data:', error);
        // Fallback to prescription data if available, otherwise show error
        setPatientData({
          name: prescription.patientName || 'Error loading',
          idNumber: prescription.patientIdNumber || prescription.patientId || 'Error loading',
          contact: prescription.patientContact || 'Error loading',
          email: prescription.patientEmail || 'Error loading'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [prescription]);

  const getStatusColor = (status: Prescription['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${prescription.id}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; line-height: 1.6; color: #374151; }
          .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px double #3b82f6; }
          .hospital-name { font-size: 24px; font-weight: bold; color: #1e40af; margin-bottom: 10px; }
          .document-title { font-size: 20px; color: #374151; margin-bottom: 10px; }
          .section { margin-bottom: 30px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb; }
          .section-title { font-weight: 600; color: #1e40af; margin-bottom: 15px; font-size: 16px; border-bottom: 1px solid #d1d5db; padding-bottom: 8px; }
          .medication { border: 1px solid #d1d5db; padding: 15px; margin-bottom: 15px; border-radius: 6px; background: white; }
          .medication-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 15px; }
          .notes { background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #6b7280; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="hospital-name">HEALTHCARE HOSPITAL</div>
          <div class="document-title">MEDICAL PRESCRIPTION</div>
          <div>Prescription ID: ${prescription.id} | Date: ${new Date(prescription.date).toLocaleDateString()}</div>
        </div>
        
        <div class="grid-2">
          <div class="section">
            <div class="section-title">PATIENT INFORMATION</div>
            <p><strong>Name:</strong> ${patientData.name}</p>
            <p><strong>ID Number:</strong> ${patientData.idNumber}</p>
            <p><strong>Contact:</strong> ${patientData.contact}</p>
            <p><strong>Email:</strong> ${patientData.email}</p>
          </div>
          
          <div class="section">
            <div class="section-title">PRESCRIBING DOCTOR</div>
            <p><strong>Name:</strong> ${prescription.doctorName || 'N/A'}</p>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">PRESCRIPTION DETAILS</div>
          <p><strong>Status:</strong> <span class="status" style="background: ${prescription.status === 'active' ? '#d1fae5' : prescription.status === 'completed' ? '#dbeafe' : '#fee2e2'}; color: ${prescription.status === 'active' ? '#065f46' : prescription.status === 'completed' ? '#1e40af' : '#991b1b'};">${prescription.status.toUpperCase()}</span></p>
          <p><strong>Created By:</strong> ${prescription.createdByName || 'System'}</p>
        </div>
        
        <div class="section">
          <div class="section-title">PRESCRIBED MEDICATIONS</div>
          ${prescriptionMedications.length > 0 ? 
            prescriptionMedications.map(med => `
              <div class="medication">
                <div class="medication-header">
                  <strong style="font-size: 14px;">${med.medicineName || 'Unknown Medicine'}</strong>
                  <span style="font-size: 12px; color: #6b7280;">${med.dosageForm || ''} ${med.strength ? `• ${med.strength}` : ''}</span>
                </div>
                <div class="grid-4">
                  <div><strong>Dosage:</strong><br>${med.dosage}</div>
                  <div><strong>Frequency:</strong><br>${med.frequency}</div>
                  <div><strong>Duration:</strong><br>${med.duration}</div>
                  <div><strong>Quantity:</strong><br>${med.quantity}</div>
                </div>
                ${med.instructions ? `
                  <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #d1d5db;">
                    <strong style="font-size: 13px;">Instructions:</strong>
                    <div style="font-size: 13px; margin-top: 4px;">${med.instructions}</div>
                  </div>
                ` : ''}
              </div>
            `).join('') : 
            '<p style="text-align: center; color: #6b7280; font-style: italic;">No medications prescribed</p>'
          }
        </div>
        
        ${prescription.notes ? `
          <div class="section notes">
            <div class="section-title">ADDITIONAL NOTES</div>
            <div>${prescription.notes}</div>
          </div>
        ` : ''}
        
        <div class="footer">
          <p>This is a computer-generated document. No signature is required.</p>
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} • Healthcare Hospital Management System</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleExportPDF = async () => {
    setPdfLoading(true);
    try {
      // Create a more PDF-friendly HTML content
      const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Prescription_${prescription.id}</title>
          <meta charset="UTF-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 40px; 
              line-height: 1.6; 
              color: #374151; 
              background: white;
            }
            .header { 
              text-align: center; 
              margin-bottom: 40px; 
              padding-bottom: 20px; 
              border-bottom: 3px double #3b82f6; 
            }
            .hospital-name { 
              font-size: 28px; 
              font-weight: bold; 
              color: #1e40af; 
              margin-bottom: 10px; 
            }
            .document-title { 
              font-size: 22px; 
              color: #374151; 
              margin-bottom: 10px; 
              font-weight: 600;
            }
            .section { 
              margin-bottom: 30px; 
              padding: 25px; 
              border: 1px solid #e5e7eb; 
              border-radius: 8px; 
              background: #f9fafb; 
            }
            .section-title { 
              font-weight: 700; 
              color: #1e40af; 
              margin-bottom: 20px; 
              font-size: 18px; 
              border-bottom: 2px solid #d1d5db; 
              padding-bottom: 10px; 
            }
            .medication { 
              border: 1px solid #d1d5db; 
              padding: 20px; 
              margin-bottom: 20px; 
              border-radius: 8px; 
              background: white; 
              page-break-inside: avoid;
            }
            .medication-header { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 15px; 
            }
            .grid-2 { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 25px; 
              margin-bottom: 30px;
            }
            .grid-4 { 
              display: grid; 
              grid-template-columns: 1fr 1fr 1fr 1fr; 
              gap: 20px; 
            }
            .notes { 
              background: #fef3c7; 
              padding: 20px; 
              border-radius: 8px; 
              border-left: 6px solid #f59e0b; 
            }
            .footer { 
              margin-top: 50px; 
              text-align: center; 
              font-size: 14px; 
              color: #6b7280; 
              padding-top: 25px; 
              border-top: 2px solid #e5e7eb; 
            }
            .status { 
              display: inline-block; 
              padding: 6px 16px; 
              border-radius: 20px; 
              font-size: 14px; 
              font-weight: 700; 
            }
            .patient-info p, .doctor-info p {
              margin-bottom: 8px;
              font-size: 14px;
            }
            .medication strong {
              font-size: 15px;
            }
            @media print {
              body { margin: 20px; }
              .section { page-break-inside: avoid; }
              .medication { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="hospital-name">HEALTHCARE HOSPITAL</div>
            <div class="document-title">MEDICAL PRESCRIPTION</div>
            <div style="font-size: 16px; color: #6b7280;">
              Prescription ID: ${prescription.id} | Date: ${new Date(prescription.date).toLocaleDateString()}
            </div>
          </div>
          
          <div class="grid-2">
            <div class="section">
              <div class="section-title">PATIENT INFORMATION</div>
              <div class="patient-info">
                <p><strong>Name:</strong> ${patientData.name}</p>
                <p><strong>ID Number:</strong> ${patientData.idNumber}</p>
                <p><strong>Contact:</strong> ${patientData.contact}</p>
                <p><strong>Email:</strong> ${patientData.email}</p>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">PRESCRIBING DOCTOR</div>
              <div class="doctor-info">
                <p><strong>Name:</strong> ${prescription.doctorName || 'N/A'}</p>
                <p><strong>Date Issued:</strong> ${new Date(prescription.date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">PRESCRIPTION DETAILS</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <p><strong>Prescription ID:</strong> ${prescription.id}</p>
                <p><strong>Status:</strong> 
                  <span class="status" style="background: ${prescription.status === 'active' ? '#d1fae5' : prescription.status === 'completed' ? '#dbeafe' : '#fee2e2'}; color: ${prescription.status === 'active' ? '#065f46' : prescription.status === 'completed' ? '#1e40af' : '#991b1b'};">
                    ${prescription.status.toUpperCase()}
                  </span>
                </p>
              </div>
              <div>
                <p><strong>Created By:</strong> ${prescription.createdByName || 'System'}</p>
                <p><strong>Last Updated:</strong> ${new Date(prescription.updatedAt || prescription.date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">PRESCRIBED MEDICATIONS</div>
            ${prescriptionMedications.length > 0 ? 
              prescriptionMedications.map(med => `
                <div class="medication">
                  <div class="medication-header">
                    <strong style="font-size: 16px;">${med.medicineName || 'Unknown Medicine'}</strong>
                    <span style="font-size: 14px; color: #6b7280; background: #f3f4f6; padding: 4px 12px; border-radius: 6px;">
                      ${med.dosageForm || ''} ${med.strength ? `• ${med.strength}` : ''}
                    </span>
                  </div>
                  <div class="grid-4">
                    <div><strong style="color: #374151;">Dosage:</strong><br><span style="font-size: 14px;">${med.dosage}</span></div>
                    <div><strong style="color: #374151;">Frequency:</strong><br><span style="font-size: 14px;">${med.frequency}</span></div>
                    <div><strong style="color: #374151;">Duration:</strong><br><span style="font-size: 14px;">${med.duration}</span></div>
                    <div><strong style="color: #374151;">Quantity:</strong><br><span style="font-size: 14px;">${med.quantity}</span></div>
                  </div>
                  ${med.instructions ? `
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 2px dashed #d1d5db;">
                      <strong style="font-size: 14px; color: #374151;">Special Instructions:</strong>
                      <div style="font-size: 14px; margin-top: 8px; color: #6b7280; line-height: 1.5;">${med.instructions}</div>
                    </div>
                  ` : ''}
                </div>
              `).join('') : 
              '<p style="text-align: center; color: #6b7280; font-style: italic; padding: 40px;">No medications prescribed</p>'
            }
          </div>
          
          ${prescription.notes ? `
            <div class="section notes">
              <div class="section-title">ADDITIONAL NOTES</div>
              <div style="font-size: 14px; line-height: 1.6;">${prescription.notes}</div>
            </div>
          ` : ''}
          
          <div class="footer">
            <p style="margin-bottom: 10px;">This is a computer-generated document. No signature is required.</p>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p style="margin-top: 10px; font-weight: 600;">Healthcare Hospital Management System</p>
          </div>
        </body>
        </html>
      `;

      // Method 1: Using html2pdf.js (you'll need to install it)
      // If you have html2pdf.js available:
      if (typeof window.html2pdf !== 'undefined') {
        const element = document.createElement('div');
        element.innerHTML = pdfContent;
        const opt = {
          margin: [10, 10, 10, 10],
          filename: `prescription_${prescription.id}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        await window.html2pdf().set(opt).from(element).save();
      } 
      // Method 2: Using print to PDF (fallback)
      else {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(pdfContent);
          printWindow.document.close();
          
          // Wait for content to load then trigger print dialog
          setTimeout(() => {
            printWindow.print();
            // Optional: Close the window after printing
            // printWindow.close();
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again or use the print function.');
    } finally {
      setPdfLoading(false);
    }
  };

  // Alternative PDF generation using server-side API
  const handleExportPDFServer = async () => {
    setPdfLoading(true);
    try {
      // Send prescription data to backend to generate PDF
      const response = await fetch('http://localhost:5000/api/generate-prescription-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prescription: {
            ...prescription,
            patientData,
            medications: prescriptionMedications
          }
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `prescription_${prescription.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to client-side method
      await handleExportPDF();
    } finally {
      setPdfLoading(false);
    }
  };

  const getDataColor = (value: string) => {
    if (loading) return 'text-blue-600';
    if (value === 'Error loading' || value === 'Loading...') return 'text-orange-600';
    return 'text-gray-900';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Prescription Details</h2>
          <p className="text-sm text-gray-600 mt-1">Prescription ID: {prescription.id}</p>
        </div>
        <div className="flex space-x-2">
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              leftIcon={<Edit2 className="h-4 w-4" />}
            >
              Edit
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            leftIcon={<X className="h-4 w-4" />}
          >
            Close
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Patient & Doctor Info */}
        <div className="space-y-6">
          {/* Patient Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 ml-3">Patient Information</h3>
              {loading && (
                <div className="ml-2 animate-pulse bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  Loading...
                </div>
              )}
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-gray-500 text-xs font-medium">Full Name</label>
                <p className={`font-medium ${getDataColor(patientData.name)}`}>
                  {patientData.name}
                </p>
              </div>
              <div>
                <label className="text-gray-500 text-xs font-medium">ID Number</label>
                <p className={`font-medium ${getDataColor(patientData.idNumber)}`}>
                  {patientData.idNumber}
                </p>
              </div>
              <div>
                <label className="text-gray-500 text-xs font-medium">Contact</label>
                <p className={`font-medium ${getDataColor(patientData.contact)}`}>
                  {patientData.contact}
                </p>
              </div>
              <div>
                <label className="text-gray-500 text-xs font-medium">Email</label>
                <p className={`font-medium ${getDataColor(patientData.email)}`}>
                  {patientData.email}
                </p>
              </div>
            </div>
          </div>

          {/* Doctor Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <Stethoscope className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 ml-3">Prescribing Doctor</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-gray-500 text-xs font-medium">Doctor Name</label>
                <p className="font-medium text-gray-900">{prescription.doctorName || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column - Prescription Details */}
        <div className="space-y-6">
          {/* Prescription Info Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 ml-3">Prescription Information</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-500 text-xs font-medium">Date</label>
                  <p className="font-medium text-gray-900">{new Date(prescription.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-gray-500 text-xs font-medium">Status</label>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(prescription.status)}`}>
                    {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-gray-500 text-xs font-medium">Created By</label>
                <p className="font-medium text-gray-900">{prescription.createdByName || 'System'}</p>
              </div>
            </div>
          </div>

          {/* Timeline Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 ml-3">Prescription Timeline</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-gray-500 text-xs font-medium">Created Date</label>
                <p className="font-medium text-gray-900">{new Date(prescription.createdAt || prescription.date).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-gray-500 text-xs font-medium">Last Updated</label>
                <p className="font-medium text-gray-900">{new Date(prescription.updatedAt || prescription.date).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Notes Card */}
          {prescription.notes && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Additional Notes</h3>
              <p className="text-sm text-gray-700 bg-yellow-50 border-l-4 border-yellow-400 pl-4 py-2">
                {prescription.notes}
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Medications */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-2 rounded-lg">
                <Pill className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 ml-3">Prescribed Medications</h3>
              <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {prescriptionMedications.length}
              </span>
            </div>
            
            {prescriptionMedications.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {prescriptionMedications.map((orderLine, index) => (
                  <div key={orderLine.id || index} className="border border-gray-100 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {orderLine.medicineName || 'Unknown Medicine'}
                      </h4>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                        {orderLine.dosageForm || 'Medicine'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500">Dosage:</span>
                        <p className="font-medium text-gray-900">{orderLine.dosage}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Frequency:</span>
                        <p className="font-medium text-gray-900">{orderLine.frequency}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <p className="font-medium text-gray-900">{orderLine.duration}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Quantity:</span>
                        <p className="font-medium text-gray-900">{orderLine.quantity}</p>
                      </div>
                    </div>
                    
                    {orderLine.instructions && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <span className="text-gray-500 text-xs font-medium">Instructions:</span>
                        <p className="text-xs text-gray-700 mt-1">{orderLine.instructions}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Pill className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No medications prescribed</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={handlePrint}
          leftIcon={<Printer className="h-4 w-4" />}
        >
          Print Prescription
        </Button>
        <Button
          variant="outline"
          onClick={handleExportPDF}
          disabled={pdfLoading}
          leftIcon={pdfLoading ? 
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div> : 
            <Download className="h-4 w-4" />
          }
        >
          {pdfLoading ? 'Generating PDF...' : 'Download PDF'}
        </Button>
      </div>
    </div>
  );
};

export default ViewPrescription;