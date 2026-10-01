import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // Log for safety
    console.log("DOCUMO WEBHOOK PAYLOAD:", JSON.stringify(payload, null, 2));
    
    // Use the EXACT fields Documo is actually sending
    const status = payload.status; 
    const faxId = payload.messageId;

    if (!faxId) {
      console.error("Webhook missing fax ID. Payload:", payload);
      return NextResponse.json({ error: 'No fax ID provided' }, { status: 400 });
    }

    let newStatus = '';

    // Map their literal status string to your database
    if (status === 'success') {
      newStatus = 'success';
    } else if (status === 'failed' || status === 'error') {
      newStatus = 'failed';
    } else {
      return NextResponse.json({ message: 'Status ignored' }, { status: 200 });
    }

    // Update the database where it matches the messageId
    const updateResult = await prisma.referralTransmission.updateMany({
      where: { faxUuid: faxId },
      data: { faxStatus: newStatus }
    });
    
    console.log(`Database update result: ${updateResult.count} rows modified for faxUuid ${faxId}`);

    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}