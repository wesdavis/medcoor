import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // 1. Parse the incoming webhook payload from Documo
    const payload = await request.json();
    
    // Documo typically sends the fax ID and its new status
    const faxId = payload.id || payload.faxId;
    const newStatus = payload.status; // e.g., 'sent', 'delivered', 'failed'

    if (!faxId || !newStatus) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. Find the exact referral in your database using the Documo ID
    const referral = await prisma.referralTransmission.findFirst({
      where: { faxUuid: faxId }
    });

    if (!referral) {
      return NextResponse.json({ error: 'Fax ID not found in database' }, { status: 404 });
    }

    // 3. Update the tracker status
    await prisma.referralTransmission.update({
      where: { id: referral.id },
      data: { 
        faxStatus: newStatus,
        // Optional: if it failed, automatically un-check it so Jess knows to look at it
        isCompleted: newStatus === 'failed' ? false : referral.isCompleted,
        internalNotes: newStatus === 'failed' ? `FAILED TRANSMISSION: ${payload.errorMessage || 'Unknown error'}` : referral.internalNotes
      }
    });

    // 4. Force the tracker page to refresh its data
    revalidatePath('/tracker');

    // 5. Send a 200 OK back so Documo knows you received the update
    return NextResponse.json({ success: true, status: 'Database updated' }, { status: 200 });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}