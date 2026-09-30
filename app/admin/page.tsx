import { PrismaClient } from '@prisma/client';
import ProviderManager from './ProviderManager';

const prisma = new PrismaClient();

export default async function AdminPage() {
  const specialists = await prisma.specialist.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <main className="max-w-6xl mx-auto px-4 text-slate-900">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Database Administration</h1>
        <p className="text-slate-500">Manage the clinical network and routing data.</p>
      </div>

      <ProviderManager specialists={specialists} />
    </main>
  );
}