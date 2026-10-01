export const dynamic = 'force-dynamic';
import { PrismaClient } from '@prisma/client';
import TrackerClient from './TrackerClient';

const prisma = new PrismaClient();

export default async function TrackerPage() {
  const referrals = await prisma.referralTransmission.findMany({
    orderBy: { createdAt: 'desc' },
    include: { specialist: true }
  });

  return (
    <main className="p-4 w-full overflow-x-auto text-slate-900">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Live Referral Calendar</h1>
        <p className="text-1xl font-bold text-white">Auto-syncs with intake faxes. Click any text to edit.</p>
      </div>
      <TrackerClient initialData={referrals} />
    </main>
  );
}