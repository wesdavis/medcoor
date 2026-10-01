'use client'

import { useRef } from 'react';
import { updateTrackerRow, createManualLog } from '../actions/tracker';

export default function TrackerClient({ initialData }: { initialData: any[] }) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleEdit = async (id: string, field: string, newValue: string) => {
    await updateTrackerRow(id, field, newValue);
  };

  const toggleComplete = async (id: string, currentStatus: boolean) => {
    await updateTrackerRow(id, 'isCompleted', !currentStatus);
  };

  const handleAdd = async (formData: FormData) => {
    await createManualLog(formData);
    formRef.current?.reset(); // Clears the form instantly after submitting
  };

  return (
    <div className="space-y-4">
      {/* QUICK ADD FORM FOR THE OFFICE GIRLS */}
      <form ref={formRef} action={handleAdd} className="bg-slate-50 p-4 border border-slate-300 flex items-end gap-4 shadow-sm">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">New Patient Name</label>
          <input required name="patientName" className="border border-slate-300 p-2 w-48 text-sm focus:ring-2 focus:ring-blue-500" placeholder="e.g., John Doe" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">DOB</label>
          <input name="patientDob" type="date" className="border border-slate-300 p-2 w-36 text-sm focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Provider Seen (Origin)</label>
          <input name="providerSeen" className="border border-slate-300 p-2 w-40 text-sm focus:ring-2 focus:ring-blue-500" placeholder="e.g., Skinner" />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Initial Notes / Request</label>
          <input name="internalNotes" className="border border-slate-300 p-2 w-full text-sm focus:ring-2 focus:ring-blue-500" placeholder="Needs GI referral ASAP..." />
        </div>
        <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-6 hover:bg-blue-700 transition-colors">
          Add to Log
        </button>
        
      </form>

      {/* SPREADSHEET TABLE */}
      <div className="bg-white border border-slate-300 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse whitespace-nowrap table-fixed">
          <thead className="bg-yellow-300 text-black font-bold uppercase text-xs">
            <tr>
              <th className="border border-slate-300 w-12">
                <div className="px-2 py-2 text-center w-full">Status</div>
              </th>
              <th className="border border-slate-300 w-32">
                <div className="resize-x overflow-hidden px-2 py-2 w-full min-w-[100px]">Date Received</div>
              </th>
              <th className="border border-slate-300 w-40">
                <div className="resize-x overflow-hidden px-2 py-2 w-full min-w-[120px]">10 Business Day Due</div>
              </th>
              <th className="border border-slate-300 w-48">
                <div className="resize-x overflow-hidden px-2 py-2 w-full min-w-[120px]">Patient Name</div>
              </th>
              <th className="border border-slate-300 w-32">
                <div className="resize-x overflow-hidden px-2 py-2 w-full min-w-[100px]">PT DOB</div>
              </th>
              <th className="border border-slate-300 w-64">
                <div className="resize-x overflow-hidden px-2 py-2 w-full min-w-[150px]">Specialist Information</div>
              </th>
              <th className="border border-slate-300 w-36">
                <div className="resize-x overflow-hidden px-2 py-2 w-full min-w-[100px]">Specialist PH</div>
              </th>
              <th className="border border-slate-300 w-36">
                <div className="resize-x overflow-hidden px-2 py-2 w-full min-w-[100px]">Specialist Fax</div>
              </th>
              <th className="border border-slate-300 w-40">
                <div className="resize-x overflow-hidden px-2 py-2 w-full min-w-[120px]">Provider Seen</div>
              </th>
              <th className="border border-slate-300 w-48">
                <div className="resize-x overflow-hidden px-2 py-2 w-full min-w-[150px]">Completed Info</div>
              </th>
              <th className="border border-slate-300 w-64">
                <div className="resize-x overflow-hidden px-2 py-2 w-full min-w-[150px]">Notes</div>
              </th>
              <th className="border border-slate-300 w-32">
                <div className="px-2 py-2 text-center w-full">Action</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {initialData.map((row) => {
              const isDone = row.isCompleted;
              const rowColor = isDone ? 'bg-green-500 text-white font-medium' : 'bg-white text-slate-900';
              const inputColor = isDone ? 'bg-green-500 text-white placeholder-green-100' : 'bg-white text-slate-900';

              return (
                <tr key={row.id} className={`${rowColor} border-b border-slate-300 hover:opacity-90`}>
                  <td className="border border-slate-300 px-2 py-1 text-center">
                    <input 
                      type="checkbox" 
                      checked={isDone} 
                      onChange={() => toggleComplete(row.id, isDone)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="border border-slate-300 px-2 py-1">
                    {new Date(row.createdAt).toLocaleDateString()}
                  </td>
                  <td className="border border-slate-300 px-2 py-1">
                    {row.dueDate ? new Date(row.dueDate).toLocaleDateString() : ''}
                  </td>
                  <td className="border border-slate-300 px-2 py-1 font-bold">
                    <input 
                      defaultValue={row.patientName || ''} 
                      onBlur={(e) => handleEdit(row.id, 'patientName', e.target.value)}
                      className={`w-full p-1 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 ${inputColor}`} 
                    />
                  </td>
                  <td className="border border-slate-300 px-2 py-1">
                    <input 
                      defaultValue={row.patientDob || ''} 
                      onBlur={(e) => handleEdit(row.id, 'patientDob', e.target.value)}
                      className={`w-full p-1 focus:outline-none focus:ring-1 focus:ring-blue-500 ${inputColor}`} 
                    />
                  </td>
                  
                  {/* Auto-filled from Specialist Database */}
                  <td className="border border-slate-300 px-2 py-1 overflow-hidden text-ellipsis">
                    {row.specialist ? `${row.specialist.name} - ${row.specialist.clinicName}` : 'Pending Assignment'}
                  </td>
                  <td className="border border-slate-300 px-2 py-1">{row.specialist?.phone}</td>
                  <td className="border border-slate-300 px-2 py-1">{row.specialist?.intakeFax}</td>
                  
                  {/* Editable Fields */}
                  <td className="border border-slate-300 px-1 py-1">
                    <input 
                      defaultValue={row.providerSeen || ''} 
                      onBlur={(e) => handleEdit(row.id, 'providerSeen', e.target.value)}
                      className={`w-full p-1 focus:outline-none focus:ring-1 focus:ring-blue-500 ${inputColor}`} 
                    />
                  </td>
                  <td className="border border-slate-300 px-1 py-1">
                    <input 
                      defaultValue={row.completedInfo || ''} 
                      onBlur={(e) => handleEdit(row.id, 'completedInfo', e.target.value)}
                      className={`w-full p-1 focus:outline-none focus:ring-1 focus:ring-blue-500 ${inputColor}`} 
                    />
                  </td>
                  <td className="border border-slate-300 px-1 py-1">
                    <input 
                      defaultValue={row.internalNotes || ''} 
                      placeholder="Add notes..."
                      onBlur={(e) => handleEdit(row.id, 'internalNotes', e.target.value)}
                      className={`w-full p-1 focus:outline-none focus:ring-1 focus:ring-blue-500 ${inputColor}`} 
                    />
                  </td>
                  <td className="border border-slate-300 px-2 py-1 text-center">
  <a 
    href={`/intake?trackerId=${row.id}&name=${encodeURIComponent(row.patientName || '')}&dob=${encodeURIComponent(row.patientDob || '')}`}
    className="bg-blue-600 text-white text-xs font-bold py-1 px-3 rounded hover:bg-blue-700 transition-colors inline-block"
  >
    Create Packet
  </a>
</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}