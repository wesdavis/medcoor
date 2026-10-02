export const dynamic = 'force-dynamic';

import { PrismaClient } from '@prisma/client';

import TrackerClient from '../tracker/TrackerClient';

const prisma = new PrismaClient();

export default async function TrackerPage() {
  // Fetch existing rows
  const transmissions = await prisma.referralTransmission.findMany({
    orderBy: { createdAt: 'desc' },
    include: { specialist: true }
  });

  // NEW: Fetch specialists for the dropdowns
  const specialists = await prisma.specialist.findMany({
    orderBy: { specialty: 'asc' }
  });

  return (
    // ... Keep your existing main/header wrappers ...
    <TrackerClient initialData={transmissions} specialists={specialists} />
  );
}