import { PrismaClient } from '@prisma/client';
import IntakeForm from './IntakeForm';

const prisma = new PrismaClient();

export default async function IntakePage() {
  // Fetch only verified specialists who are accepting new patients
  const specialists = await prisma.specialist.findMany({
    orderBy: { specialty: 'asc' }
  });

  return (
    <main className="max-w-2xl mx-auto p-10 font-sans">
      <h1 className="text-2xl font-bold mb-2">New Referral Intake</h1>
      <p className="text-white-600 mb-8">Generate cover sheet and merge files securely.</p>
      
      <IntakeForm specialists={specialists} />
    </main>
  );
}