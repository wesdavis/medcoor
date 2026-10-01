'use server'

import { PrismaClient } from '@prisma/client';
import { createReferralPacket } from '@/lib/pdf-assembler';

const prisma = new PrismaClient();

// Step 1: Generate the PDF and return it as a Base64 string for the UI to preview
export async function generatePreview(formData: FormData) {
  try {
    const specialistId = formData.get('specialistId') as string;
    const specialist = await prisma.specialist.findUnique({ where: { id: specialistId } });
    
    if (!specialist) throw new Error('Specialist not found.');
    if (!specialist.intakeFax) throw new Error('Specialist is missing a fax number.');

    const uploadedFiles = formData.getAll('attachments') as File[];
    const buffers: Buffer[] = [];
    
    for (const file of uploadedFiles) {
      if (file && file.size > 0) {
        buffers.push(Buffer.from(await file.arrayBuffer()));
      }
    }

    const packetBytes = await createReferralPacket({
      patientName: formData.get('patientName'),
      patientSex: formData.get('patientSex'), // NEW
      patientDob: formData.get('patientDob'),
      patientPhone: formData.get('patientPhone'),
      patientInsurance: formData.get('patientInsurance'),
      notes: formData.get('notes'), // Maps to DX Code
      authNumber: formData.get('authNumber'),
      authVisits: formData.get('authVisits'),
      authDates: formData.get('authDates'),
      specialty: specialist.specialty, // NEW
      specialistName: specialist.name,
      specialistAddress: specialist.clinicName, // Using clinicName for Address
      specialistPhone: specialist.phone, // NEW
      specialistFax: specialist.intakeFax,
      specialistNpi: specialist.npi,
    }, buffers);

    // Convert to Base64 so the browser can easily render it in an iframe
    const base64Pdf = Buffer.from(packetBytes).toString('base64');
    
    return { success: true, pdfData: base64Pdf };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Step 2: The final live transmission action
export async function transmitFax(base64Pdf: string, patientName: string, patientDob: string, specialistId: string, trackerId: string | null) {
  try {
    // 1. Fetch the specialist to get their actual fax number
    const specialist = await prisma.specialist.findUnique({ where: { id: specialistId } });
    if (!specialist || !specialist.intakeFax) throw new Error('Specialist missing fax number');

    // Clean the fax number to ensure it is just digits, and guarantee it starts with +1
    const digitsOnly = specialist.intakeFax.replace(/\D/g, '');
    const cleanFaxNumber = digitsOnly.startsWith('1') ? `+${digitsOnly}` : `+1${digitsOnly}`;

    // 2. Transmit to Documo API
    const documoResponse = await fetch('https://api.documo.com/v1/faxes', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${process.env.MFAX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        faxNumber: cleanFaxNumber,
        coverLetter: false, 
        files: [
          {
            fileName: `${patientName.replace(/\s+/g, '_')}_Referral.pdf`,
            fileBase64: base64Pdf
          }
        ]
      })
    });

    // --- NEW ERROR TRAP ---
    if (!documoResponse.ok) {
      const err = await documoResponse.json();
      console.error("DOCUMO RAW ERROR PAYLOAD:", err); // Prints to Vercel logs
      
      // Attempt to grab the exact error string from Documo, or dump the whole object
      const errorMessage = err.message || err.error || JSON.stringify(err);
      throw new Error(`Documo API Error: ${errorMessage}`);
    }

    const documoData = await documoResponse.json();
    const liveFaxId = documoData.id; // The real tracking ID from Documo

    // 3. Calculate Due Date & Logging Text
    const dueDate = new Date();
    let addedDays = 0;
    while (addedDays < 10) {
      dueDate.setDate(dueDate.getDate() + 1);
      if (dueDate.getDay() !== 0 && dueDate.getDay() !== 6) {
        addedDays++;
      }
    }
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
    const completedText = `jessi sent efax ${todayStr}`;

    // 4. Update or Create the Tracker Row with the REAL tracking ID
    const dbPayload = {
      patientName,
      patientDob,
      specialistId,
      faxStatus: 'queued', // Webhook will change this to 'delivered' later
      faxUuid: liveFaxId, 
      pageCount: 1,
      dueDate: dueDate,
      isCompleted: true,
      completedInfo: completedText,
    };

    if (trackerId) {
      await prisma.referralTransmission.update({
        where: { id: trackerId },
        data: dbPayload
      });
    } else {
      await prisma.referralTransmission.create({
        data: dbPayload
      });
    }

    return { success: true, message: `Packet sent to Documo! Tracking ID: ${liveFaxId}` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}