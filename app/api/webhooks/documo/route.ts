import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // Documo sends the event type and the fax details in the payload
    const eventType = payload.event;
    const faxId = payload.data?.id;

    if (!faxId) {
      return NextResponse.json({ error: 'No fax ID provided' }, { status: 400 });
    }

    let newStatus = '';

    // Map Documo's outbound events to your database statuses
    if (eventType === 'fax.v1.outbound.succeed' || eventType === 'fax.v1.outbound.complete') {
      newStatus = 'success';
    } else if (eventType === 'fax.v1.outbound.failed') {
      newStatus = 'failed';
    } else {
      // If it's a different event, just return 200 so Documo knows we received it
      return NextResponse.json({ message: 'Event ignored' }, { status: 200 });
    }

    // Update the record in your database where the documoFaxId matches
    await prisma.referralTransmission.updateMany({
      where: { 
        // Note: Ensure your Prisma schema has a field storing the Documo Fax ID (e.g., documoFaxId)
        faxUuid: faxId
      },
      data: { 
        faxStatus: newStatus 
      }
    });

    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}