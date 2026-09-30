'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveProvider, deleteProvider } from './actions/admin';


export default function DirectoryClient({ specialists }: { specialists: any[] }) {
  const router = useRouter();
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Extract a unique, alphabetized list of specialties
  const specialties = Array.from(
    new Set(specialists.map((doc) => doc.specialty).filter(Boolean))
  ).sort();

  // Filter the database array instantly
  const filteredSpecialists = specialists.filter((doc) => {
    const searchString = `${doc.name || ''} ${doc.clinicName || ''}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty ? doc.specialty === selectedSpecialty : true;
    return matchesSearch && matchesSpecialty;
  });

  // Action Handlers

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this provider from the network?")) {
      await deleteProvider(id);
      router.refresh(); 
    }
  };

  const openNewModal = () => {
    setEditingDoc(null);
    setIsModalOpen(true);
  };

  const openEditModal = (doc: any) => {
    setEditingDoc(doc);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDoc(null);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    
    const formData = new FormData(e.currentTarget);

    // Call your existing database save action
    await saveProvider(formData, editingDoc?.id || undefined);

    router.refresh();
    closeModal();
    setIsSaving(false);
  };

  return (
    <main className="max-w-6xl mx-auto px-4 relative">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Referral Directory</h1>
        <p className="text-slate-500">Active provider network and facility rules.</p>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-slate-100 p-4 rounded-lg border border-slate-200">
        <input
          type="text"
          placeholder="Search by doctor or clinic name..."
          className="flex-1 p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <select
          className="p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white md:w-64"
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
        >
          <option value="">All Specialties</option>
          {specialties.map((spec) => (
            <option key={spec as string} value={spec as string}>
              {spec as string}
            </option>
          ))}
        </select>

        <button 
          onClick={openNewModal}
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          + New Provider
        </button>
      </div>

      {/* Filtered Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSpecialists.length === 0 ? (
          <p className="text-slate-500 col-span-2">No providers match your search.</p>
        ) : (
          filteredSpecialists.map((doc) => (
            <div key={doc.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 text-slate-900 relative">
              
              {/* Action Buttons */}
              <div className="absolute top-6 right-6 flex gap-4">
                <button 
                  onClick={() => openEditModal(doc)} 
                  className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(doc.id)} 
                  className="text-sm font-bold text-red-600 hover:text-red-800 transition-colors"
                >
                  Delete
                </button>
              </div>

              <div className="flex justify-between items-start mb-4">
                <div className="pr-24">
                  <h2 className="text-xl font-bold text-slate-900 uppercase">
                    {doc.name || doc.clinicName}
                  </h2>
                  <div className="text-sm font-medium text-blue-600 uppercase">
                    {doc.specialty || 'General'} {doc.name && doc.clinicName ? `| ${doc.clinicName}` : ''}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-3 text-sm text-slate-700 mt-4 border-t border-slate-100 pt-4">
                <p><strong>Intake Fax:</strong> {doc.intakeFax || 'N/A'}</p>
                <p><strong>Phone:</strong> {doc.phone || 'N/A'}</p>
                <p className="col-span-2"><strong>Address:</strong> {doc.address || 'N/A'}</p>
                
                {doc.website && (
                  <p className="col-span-2"><strong>Website:</strong> <a href={doc.website} className="text-blue-500 hover:underline" target="_blank" rel="noreferrer">{doc.website}</a></p>
                )}

                {doc.acceptedInsurances && (
                  <p className="col-span-2 text-slate-600 mt-2">
                    <strong>Accepted:</strong> {doc.acceptedInsurances}
                  </p>
                )}

                {doc.oonInsurance && (
                  <div className="col-span-2 text-red-800 bg-red-50 p-2 rounded mt-2 border border-red-200">
                    <span className="font-semibold uppercase text-xs tracking-wider">⚠️ Out-of-Network (OON)</span><br />
                    {doc.oonInsurance}
                  </div>
                )}

                <p className="col-span-2 text-amber-800 bg-amber-50 p-3 rounded mt-2 text-sm border border-amber-100">
                  <strong>Coordinator Rules:</strong> {doc.rules || 'No specific rules noted.'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* POPUP MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 text-slate-900">
            <h2 className="text-2xl font-bold mb-4">{editingDoc ? 'Edit Provider' : 'Add New Provider'}</h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Doctor Name</label>
                  <input name="name" defaultValue={editingDoc?.name} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500" placeholder="Dr. John Smith" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Clinic / Facility Name</label>
                  <input name="clinicName" defaultValue={editingDoc?.clinicName} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500" placeholder="Smith Allergy Center" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Specialty</label>
                  <input required name="specialty" defaultValue={editingDoc?.specialty} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500" placeholder="e.g., ALLERGY" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Intake Fax</label>
                  <input required name="intakeFax" defaultValue={editingDoc?.intakeFax} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500" placeholder="915-555-0199" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Phone</label>
                  <input name="phone" defaultValue={editingDoc?.phone} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500" placeholder="915-555-0100" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Physical Address</label>
                <input name="address" defaultValue={editingDoc?.address} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500" placeholder="123 Medical Dr, El Paso, TX 79902" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Website URL</label>
                <input name="website" type="url" defaultValue={editingDoc?.website} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500" placeholder="https://..." />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Accepted Insurances</label>
                <input name="acceptedInsurances" defaultValue={editingDoc?.acceptedInsurances} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500" placeholder="BCBS, Medicare, PPO..." />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 text-red-600">Out-of-Network Warnings</label>
                <input name="oonInsurance" defaultValue={editingDoc?.oonInsurance} className="w-full border p-2 rounded focus:ring-2 focus:ring-red-500" placeholder="e.g., Does NOT take Cigna LocalPlus" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Coordinator Routing Rules</label>
                <textarea name="rules" defaultValue={editingDoc?.rules} className="w-full border p-2 rounded h-20 focus:ring-2 focus:ring-amber-500" placeholder="e.g., Send all labs with the referral..."></textarea>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-200">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="flex-1 bg-slate-200 text-slate-800 font-bold py-2 rounded hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-1 bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Provider'}
                </button>
              </div>
            </form>
            
          </div>
        </div>
      )}
    </main>
  );
}