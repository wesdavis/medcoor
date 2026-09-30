import { PrismaClient } from '@prisma/client';
import DirectoryClient from './DirectoryClient';


const prisma = new PrismaClient();

export default async function DirectoryPage() {
  // Fetch all providers from AWS once on the server
  const specialists = await prisma.specialist.findMany({
    orderBy: { specialty: 'asc' }
  });

  // Pass the data to the client-side UI for instant filtering
  return <DirectoryClient specialists={specialists} />;
}