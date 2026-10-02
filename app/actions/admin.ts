'use server'

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function saveProvider(formData: FormData, existingId?: string) {
  const data = {
    name: formData.get('name') as string || null,
    clinicName: formData.get('clinicName') as string || null,
    specialty: formData.get('specialty') as string || null,
    intakeFax: formData.get('intakeFax') as string || null,
    phone: formData.get('phone') as string || null,
    
    // NEW FIELDS ADDED HERE
    address: formData.get('address') as string || null,
    website: formData.get('website') as string || null,
    
    acceptedInsurances: formData.get('acceptedInsurances') as string || null,
    oonInsurance: formData.get('oonInsurance') as string || null,
    rules: formData.get('rules') as string || null,
  };

  if (existingId) {
    await prisma.specialist.update({ where: { id: existingId }, data });
  } else {
    await prisma.specialist.create({ data });
  }

  // Instantly update all connected pages
  revalidatePath('/');
  revalidatePath('/intake');
  revalidatePath('/admin');
}

export async function deleteProvider(id: string) {
  await prisma.specialist.delete({ where: { id } });
  revalidatePath('/');
  revalidatePath('/intake');
  revalidatePath('/admin');
}