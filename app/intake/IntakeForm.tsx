'use client'

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { generatePreview, transmitFax } from '../actions/referral';

export default function IntakeForm({ specialists }: { specialists: any[] }) {
  const searchParams = useSearchParams();
  const defaultName = searchParams.get('name') || '';
  const defaultDob = searchParams.get('dob') || '';
  const trackerId = searchParams.get('trackerId') || null;
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSpecialist, setSelectedSpecialist] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [previewPdf, setPreviewPdf] = useState<string | null>(null);
  const [formDataCache, setFormDataCache] = useState<any>(null);

  const handleAuthDatesFormat = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;

    const formatPart = (str: string) => {
      // Strip everything except numbers
      const nums = str.replace(/\D/g, '');
      if (!nums) return str.trim();

      let m, d, y;
      
      if (nums.length === 8) { 
        // 8 digits: MMDDYYYY (e.g., 10212026)
        m = nums.slice(0, 2); d = nums.slice(2, 4); y = nums.slice(4, 8);
      } else if (nums.length === 6) { 
        // 6 digits: MMDDYY (e.g., 102126)
        m = nums.slice(0, 2); d = nums.slice(2, 4); y = '20' + nums.slice(4, 6);
      } else if (nums.length === 4) { 
        // 4 digits: MDYY (e.g., 3327 -> 03/03/2027)
        m = '0' + nums[0]; d = '0' + nums[1]; y = '20' + nums.slice(2, 4);
      } else if (nums.length === 5) {
        // 5 digits is tricky (e.g., 11526 could be Jan 15 or Nov 5)
        // We assume MM D YY if it starts with 10, 11, or 12
        const firstTwo = parseInt(nums.slice(0, 2));
        if (firstTwo >= 10 && firstTwo <= 12) {
          m = nums.slice(0, 2); d = '0' + nums[2]; y = '20' + nums.slice(3, 5);
        } else {
          // Otherwise assume M DD YY
          m = '0' + nums[0]; d = nums.slice(1, 3); y = '20' + nums.slice(3, 5);
        }
      } else {
        // If it doesn't match standard patterns, leave it alone so we don't delete data
        return str.trim();
      }
      return `${m}/${d}/${y}`;
    };

    // Split by the dash, format both sides independently, and stitch them back together
    const parts = val.split('-');
    e.target.value = parts.map(formatPart).join(' - ');
  };

  async function handlePreview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus('Generating preview...');
    
    // 1. Define formData first
    const formData = new FormData(e.currentTarget);
    // NEW: Intercept the browser's YYYY-MM-DD format and flip it to MM/DD/YYYY
    const rawDob = formData.get('patientDob') as string;
    if (rawDob && rawDob.includes('-')) {
      const [year, month, day] = rawDob.split('-');
      formData.set('patientDob', `${month}/${day}/${year}`);
    }
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

  const filteredSpecialists = specialists.filter(doc => 
    (doc.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (doc.clinicName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.specialty || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* PREVIEW CONTAINER - Hidden when previewPdf is null */}
      <div className={`bg-white p-6 border rounded-lg shadow-sm text-slate-900 ${previewPdf ? 'block' : 'hidden'}`}>
        <h2 className="text-xl font-bold mb-4 text-slate-800">Review Referral Packet</h2>
        
        {previewPdf && (
          <iframe 
            src={`data:application/pdf;base64,${previewPdf}#toolbar=0`} 
            className="w-full h-96 border rounded mb-6"
          />
        )}

        <div className="flex gap-4">
          <button 
            type="button"
            onClick={() => setPreviewPdf(null)} 
            disabled={loading}
            className="flex-1 bg-slate-200 text-slate-800 font-bold py-3 rounded hover:bg-slate-300 transition-colors"
          >
            Edit Form
          </button>
          <button 
            type="button"
            onClick={handleConfirm} 
            disabled={loading}
            className="flex-1 bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700 transition-colors"
          >
            {loading ? 'Sending...' : 'Confirm & Send eFax'}
          </button>
        </div>
        {status && <div className="p-3 mt-4 text-sm font-medium bg-slate-100 rounded border border-slate-200">{status}</div>}
      </div>

      {/* ORIGINAL INPUT FORM - Hidden when previewPdf has data */}
      <form onSubmit={handlePreview} className={`space-y-6 bg-white p-6 border rounded-lg shadow-sm text-slate-900 ${previewPdf ? 'hidden' : 'block'}`}>
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

        <div className="relative">
          <label className="block text-sm font-medium mb-1 text-slate-700">Destination Specialist</label>
          
          <input 
            type="text" 
            required
            placeholder="Type to search providers or clinics..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
              setSelectedSpecialist('');
              setHighlightedIndex(-1); // Reset highlight when typing
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => {
              setShowDropdown(false);
              setHighlightedIndex(-1);
            }, 200)}
            onKeyDown={(e) => {
              if (!showDropdown) return;
              
              if (e.key === 'ArrowDown') {
                e.preventDefault(); // Stop cursor from jumping
                setHighlightedIndex(prev => prev < filteredSpecialists.length - 1 ? prev + 1 : prev);
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
              } else if (e.key === 'Enter') {
                e.preventDefault(); // Stop form submission
                if (highlightedIndex >= 0 && filteredSpecialists[highlightedIndex]) {
                  const doc = filteredSpecialists[highlightedIndex];
                  setSearchTerm(`${doc.name || doc.clinicName} - ${doc.specialty}`);
                  setSelectedSpecialist(doc.id);
                  setShowDropdown(false);
                }
              }
            }}
            className="w-full border p-2 rounded text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <input type="hidden" name="specialistId" value={selectedSpecialist} />
          
          {showDropdown && filteredSpecialists.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-slate-300 mt-1 max-h-60 overflow-y-auto rounded shadow-lg">
              {filteredSpecialists.map((doc, index) => (
                  <li 
                    key={doc.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setSearchTerm(`${doc.name || doc.clinicName} - ${doc.specialty}`);
                      setSelectedSpecialist(doc.id);
                      setShowDropdown(false);
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`p-2 cursor-pointer text-sm text-slate-900 border-b border-slate-100 last:border-0 ${
                      index === highlightedIndex ? 'bg-blue-100' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold">{doc.name || doc.clinicName}</div>
                    <div className="text-xs text-slate-500">{doc.specialty}</div>
                  </li>
                ))}
            </ul>
          )}
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
            <input 
  name="authDates" 
  onBlur={handleAuthDatesFormat}
  className="w-full border p-2 rounded text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
  placeholder="01/01/2026 - 06/01/2026" 
/>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">Upload Patient Files (PDFs)</label>
          <input required type="file" multiple name="attachments" accept="application/pdf" className="w-full border p-2 rounded text-sm bg-white text-slate-900 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          <p className="text-xs text-slate-500 mt-1">Hold Ctrl (or Cmd) to select multiple files (e.g., Face Sheet, Chart Notes, Labs).</p>
        </div>

        <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors mt-6">
          {loading ? 'Building Packet...' : 'Generate Preview'}
        </button>

        {status && !previewPdf && <div className="p-3 mt-4 text-sm font-medium bg-slate-100 text-slate-800 rounded border border-slate-200">{status}</div>}
      </form>
    </>
  );
}