export const dynamic = 'force-dynamic';
import { PrismaClient } from '@prisma/client';
import IntakeForm from './IntakeForm';

const prisma = new PrismaClient();

export default async function IntakePage() {
  // Fetch specialists so the searchable dropdown works
  const specialists = await prisma.specialist.findMany({
    orderBy: { specialty: 'asc' }
  });

  return (
    <main className="max-w-4xl mx-auto p-4 text-slate-900">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">New Referral Packet</h1>
        <p className="text-1xl font-bold text-white">Generate and transmit a new outbound referral.</p>
      </div>
      
      {/* This renders the IntakeForm.tsx file we updated earlier */}
      <IntakeForm specialists={specialists} />
    </main>
  );
}