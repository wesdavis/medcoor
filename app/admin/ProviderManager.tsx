'use client'

import { useState } from 'react';
import { saveProvider, deleteProvider } from '../actions/admin';

export default function ProviderManager({ specialists }: { specialists: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Find the specific provider data if we are editing, otherwise empty
  const currentProvider = editingId ? specialists.find(s => s.id === editingId) : {};

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await saveProvider(formData, editingId || undefined);
    setIsFormOpen(false);
    setEditingId(null);
  }

  return (
    <div>
      {/* Top Control Bar */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Active Roster ({specialists.length})</h2>
        <button 
          onClick={() => { setEditingId(null); setIsFormOpen(!isFormOpen); }}
          className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition-colors"
        >
          {isFormOpen ? 'Cancel' : '+ New Provider'}
        </button>
      </div>

      {/* Add / Edit Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8 text-slate-900 space-y-4">
          <h3 className="font-bold text-lg border-b pb-2 mb-4">
            {editingId ? 'Edit Provider' : 'Add New Provider'}
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Doctor Name</label>
              <input name="name" defaultValue={currentProvider?.name || ''} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500" placeholder="Dr. John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Clinic Name</label>
              <input name="clinicName" defaultValue={currentProvider?.clinicName || ''} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500" placeholder="Desert Medical" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Specialty</label>
              <input name="specialty" defaultValue={currentProvider?.specialty || ''} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500" placeholder="Cardiology" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Intake Fax</label>
              <input name="intakeFax" defaultValue={currentProvider?.intakeFax || ''} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500" placeholder="915-555-0199" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Accepted Insurances</label>
              <input name="acceptedInsurances" defaultValue={currentProvider?.acceptedInsurances || ''} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Out-of-Network (OON)</label>
              <input name="oonInsurance" defaultValue={currentProvider?.oonInsurance || ''} className="w-full border p-2 rounded focus:ring-2 focus:ring-red-500" placeholder="e.g. Humana, Tricare" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700">Coordinator Rules / Notes</label>
              <textarea name="rules" defaultValue={currentProvider?.rules || ''} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 h-20" placeholder="Requires recent lab work..."></textarea>
            </div>
          </div>
          
          <button type="submit" className="bg-green-600 text-white font-bold py-2 px-6 rounded hover:bg-green-700">
            Save Provider
          </button>
        </form>
      )}

      {/* Roster List */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Provider / Clinic</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Specialty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Fax</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm text-slate-900">
            {specialists.map(doc => (
              <tr key={doc.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium">{doc.name || doc.clinicName}</td>
                <td className="px-6 py-4">{doc.specialty}</td>
                <td className="px-6 py-4">{doc.intakeFax || 'No Fax'}</td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button 
                    onClick={() => { setEditingId(doc.id); setIsFormOpen(true); }}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={async () => {
                      if(confirm('Are you sure you want to delete this provider?')) {
                        await deleteProvider(doc.id);
                      }
                    }}
                    className="text-red-600 hover:underline font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}