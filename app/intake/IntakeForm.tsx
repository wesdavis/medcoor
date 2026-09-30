'use client'

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { generatePreview, transmitFax } from '../actions/referral';

export default function IntakeForm({ specialists }: { specialists: any[] }) {
  const searchParams = useSearchParams();
  const defaultName = searchParams.get('name') || '';
  const defaultDob = searchParams.get('dob') || '';
  const trackerId = searchParams.get('trackerId') || null;

  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [previewPdf, setPreviewPdf] = useState<string | null>(null);
  const [formDataCache, setFormDataCache] = useState<any>(null);

  async function handlePreview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus('Generating preview...');
    
    // 1. Define formData first
    const formData = new FormData(e.currentTarget);
    const result = await generatePreview(formData);

    if (result.success) {
      setPreviewPdf(result.pdfData as string);
      
      // 2. Cache all fields correctly once the preview succeeds
      setFormDataCache({
        patientName: formData.get('patientName') as string,
        patientDob: formData.get('patientDob') as string,
        specialistId: formData.get('specialistId') as string,
        trackerId: trackerId,
      });
      setStatus('');
    } else {
      setStatus(`❌ Error: ${result.error}`);
    }
    setLoading(false);
  }

  async function handleConfirm() {
    setLoading(true);
    setStatus('Transmitting to clinic...');
    
    // 3. Single, clean transmission call
    const result = await transmitFax(
      previewPdf!, 
      formDataCache.patientName, 
      formDataCache.patientDob, 
      formDataCache.specialistId,
      formDataCache.trackerId
    );
    
    if (result.success) {
      // Instantly trigger the local download for Jess's records
      const byteCharacters = atob(previewPdf!);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formDataCache.patientName.replace(/\s+/g, '_')}_Referral_Packet.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Update status and reset the form
      setStatus(`✅ Success: ${result.message}`);
      setPreviewPdf(null); 
    } else {
      setStatus(`❌ Error: ${result.error}`);
    }
    setLoading(false);
  }

  // IF PREVIEW IS READY, SHOW THE PDF VIEWER
  if (previewPdf) {
    return (
      <div className="bg-white p-6 border rounded-lg shadow-sm text-slate-900">
        <h2 className="text-xl font-bold mb-4 text-slate-800">Review Referral Packet</h2>
        
        {/* Render the Base64 PDF directly in the browser */}
        <iframe 
          src={`data:application/pdf;base64,${previewPdf}#toolbar=0`} 
          className="w-full h-96 border rounded mb-6"
        />

        <div className="flex gap-4">
          <button 
            onClick={() => setPreviewPdf(null)} 
            disabled={loading}
            className="flex-1 bg-slate-200 text-slate-800 font-bold py-3 rounded hover:bg-slate-300 transition-colors"
          >
            Edit Form
          </button>
          <button 
            onClick={handleConfirm} 
            disabled={loading}
            className="flex-1 bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700 transition-colors"
          >
            {loading ? 'Sending...' : 'Confirm & Send eFax'}
          </button>
        </div>
        {status && <div className="p-3 mt-4 text-sm font-medium bg-slate-100 rounded border border-slate-200">{status}</div>}
      </div>
    );
  }

  // OTHERWISE, SHOW THE ORIGINAL INPUT FORM
  return (
    <form onSubmit={handlePreview} className="space-y-6 bg-white p-6 border rounded-lg shadow-sm text-slate-900">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">Patient Name & Sex</label>
          <div className="flex gap-2">
            <input required name="patientName" defaultValue={defaultName} className="w-full border p-2 rounded text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Jane Doe" />
            <select name="patientSex" className="w-28 border p-2 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">DOB</label>
          {/* 4. Added defaultValue={defaultDob} here */}
          <input required type="date" name="patientDob" defaultValue={defaultDob} className="w-full border p-2 rounded text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">Patient Phone</label>
          <input required type="tel" name="patientPhone" className="w-full border p-2 rounded text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="(915) 555-0100" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">Insurance Info</label>
          <input required name="patientInsurance" className="w-full border p-2 rounded text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., BCBS TX (ID: 12345)" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-slate-700">Destination Specialist</label>
        <select required name="specialistId" className="w-full border p-2 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="" className="text-slate-500">-- Select Verified Specialist --</option>
          {specialists.map((doc) => (
            <option key={doc.id} value={doc.id} className="text-slate-900">
              {doc.name || doc.clinicName} - {doc.specialty}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-slate-700">Diagnosis / Reason for Referral</label>
        <textarea required name="notes" className="w-full border p-2 rounded h-20 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., M17.11 Knee Pain"></textarea>
      </div>

      <div className="grid grid-cols-3 gap-4 border-t border-slate-200 pt-6 mt-2">
        <div className="col-span-3 text-sm font-bold text-slate-800">Prior Authorization (If Required)</div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">Auth #</label>
          <input name="authNumber" className="w-full border p-2 rounded text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., A1234567" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700"># of Visits</label>
          <input name="authVisits" type="number" className="w-full border p-2 rounded text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., 6" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">Approval Dates</label>
          <input name="authDates" className="w-full border p-2 rounded text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="01/01/26 - 06/01/26" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-slate-700">Upload Patient Files (PDFs)</label>
        <input required type="file" multiple name="attachments" accept="application/pdf" className="w-full border p-2 rounded text-sm bg-white text-slate-900 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        <p className="text-xs text-slate-500 mt-1">Hold Ctrl (or Cmd) to select multiple files (e.g., Face Sheet, Chart Notes, Labs).</p>
      </div>

      <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors">
        {loading ? 'Building Packet...' : 'Generate Preview'}
      </button>

      {status && <div className="p-3 mt-4 text-sm font-medium bg-slate-100 text-slate-800 rounded border border-slate-200">{status}</div>}
    </form>
  );
}