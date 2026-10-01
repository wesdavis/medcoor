export const dynamic = 'force-dynamic';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function DashboardPage() {
  // Fetch all transmissions, sorted by newest first, and include the related specialist info
  const transmissions = await prisma.referralTransmission.findMany({
    orderBy: { createdAt: 'desc' },
    include: { specialist: true }
  });

  return (
    <main className="max-w-6xl mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">Transmission Outbox</h1>
        <p className="text-slate-400">Track the status of outgoing referral packets.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Destination</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fax Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200 text-slate-900 text-sm">
            {transmissions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-slate-500">
                  No outgoing referrals yet.
                </td>
              </tr>
            ) : (
              transmissions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {tx.patientName}
                  </td>
                  <td className="px-6 py-4">
                    {/* Fixed optional chaining below */}
                    {tx.specialist?.name || tx.specialist?.clinicName || 'Pending Assignment'}
                  </td>
                  <td className="px-6 py-4">
                    {/* Fixed optional chaining below */}
                    {tx.specialist?.intakeFax || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${tx.faxStatus === 'queued' ? 'bg-amber-100 text-amber-800' : ''}
                      ${tx.faxStatus === 'success' ? 'bg-green-100 text-green-800' : ''}
                      ${tx.faxStatus === 'failed' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {tx.faxStatus.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}