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
  try {
    // Calculate 10 Business Day Due Date
    const dueDate = new Date();
    let addedDays = 0;
    while (addedDays < 10) {
      dueDate.setDate(dueDate.getDate() + 1);
      if (dueDate.getDay() !== 0 && dueDate.getDay() !== 6) {
        addedDays++;
      }
    }

    // Format DOB to MM/DD/YYYY if provided
    const rawDob = formData.get('patientDob') as string;
    let formattedDob = rawDob;
    if (rawDob && rawDob.includes('-')) {
      const [year, month, day] = rawDob.split('-');
      formattedDob = `${month}/${day}/${year}`;
    }

    await prisma.referralTransmission.create({
      data: {
        patientName: formData.get('patientName') as string,
        patientDob: formattedDob,
        providerSeen: formData.get('providerSeen') as string,
        internalNotes: formData.get('internalNotes') as string,
        priority: (formData.get('priority') as string) || 'Routine',
        dueDate: dueDate,
        // We will add the specialist logic in the next step!
      }
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTrackerRow(id: string) {
  try {
    await prisma.referralTransmission.delete({
      where: { id }
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}