'use server'

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function updateTrackerRow(id: string, field: string, value: string | boolean) {
  await prisma.referralTransmission.update({
    where: { id },
    data: { [field]: value }
  });
  revalidatePath('/tracker');
}

export async function createManualLog(formData: FormData) {
  await prisma.referralTransmission.create({
    data: {
      patientName: formData.get('patientName') as string,
      patientDob: formData.get('patientDob') as string || 'N/A',
      providerSeen: formData.get('providerSeen') as string || '',
      internalNotes: formData.get('internalNotes') as string || '',
      faxStatus: 'logged',
      pageCount: 0,
    }
  });
  revalidatePath('/tracker');
}