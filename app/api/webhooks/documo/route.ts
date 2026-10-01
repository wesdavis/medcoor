import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // This logs the exact incoming webhook to Vercel so we can read it
    console.log("DOCUMO WEBHOOK PAYLOAD:", JSON.stringify(payload, null, 2));
    
    // Extract the event type and ID (checking multiple possible structures)
    const eventType = payload.event || payload.type;
    const faxId = payload.data?.id || payload.id;

    if (!faxId) {
      console.error("Webhook missing fax ID. Payload:", payload);
      return NextResponse.json({ error: 'No fax ID provided' }, { status: 400 });
    }

    let newStatus = '';

    // Map Documo's outbound events to your database statuses
    if (eventType === 'fax.v1.outbound.succeed' || eventType === 'fax.v1.outbound.complete') {
      newStatus = 'success';
    } else if (eventType === 'fax.v1.outbound.failed') {
      newStatus = 'failed';
    } else {
      return NextResponse.json({ message: 'Event ignored' }, { status: 200 });
    }

    // Update the database
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