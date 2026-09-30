import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function createReferralPacket(data: any, attachments: Buffer[]) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const page = pdfDoc.addPage([612, 792]); 
  const { height } = page.getSize();
  const textColor = rgb(0, 0, 0);

  // Helper to easily draw text anywhere on the page
  const drawText = (text: string, x: number, y: number, isBold = false, size = 12) => {
    if (!text) return;
    page.drawText(text, { x, y: height - y, size, font: isBold ? boldFont : font, color: textColor });
  };

  // --- HEADER (Centered) ---
  drawText('Referral Request', 240, 70, true, 16);
  drawText('From the Office of: Russell Skinner, MD', 180, 95, true, 12);
  drawText('5148 Village Creek Dr Ste 300', 215, 115, true, 12);
  drawText('Plano, TX 75093', 255, 135, true, 12);
  drawText('P: 469-661-1100      F: 469-802-9590', 200, 155, true, 12);

  // --- PATIENT ROW 1 ---
  let currentY = 220;
  drawText('Patient Name:', 50, currentY, true);
  drawText(data.patientName || '', 140, currentY);
  drawText('SEX:', 420, currentY, true);
  drawText(data.patientSex || '', 460, currentY);

  // --- PATIENT ROW 2 ---
  currentY += 30;
  drawText('DOB:', 50, currentY, true);
  drawText(data.patientDob || '', 90, currentY);

  // --- PATIENT ROW 3 ---
  currentY += 30;
  drawText('Patient Phone#:', 50, currentY, true);
  drawText(data.patientPhone || '', 150, currentY);
  drawText('INSURANCE ID:', 300, currentY, true);
  drawText(data.patientInsurance || '', 400, currentY);

  // --- SPECIALIST ROW 1 ---
  currentY += 50;
  drawText('Specialty:', 50, currentY, true);
  drawText(data.specialty || '', 120, currentY);
  drawText('Name:', 330, currentY, true);
  drawText(data.specialistName || '', 375, currentY);

  // --- SPECIALIST ROW 2 ---
  currentY += 40;
  drawText('Address:', 50, currentY, true);
  drawText(data.specialistAddress || '', 115, currentY); // Maps to clinicName in DB

  // --- SPECIALIST ROW 3 ---
  currentY += 40;
  drawText('Phone:', 50, currentY, true);
  drawText(data.specialistPhone || '', 100, currentY);
  drawText('Fax:', 220, currentY, true);
  drawText(data.specialistFax || '', 255, currentY);
  drawText('NPI:', 380, currentY, true);
  drawText(data.specialistNpi || '', 415, currentY);

  // --- AUTH ROW ---
  currentY += 50;
  drawText('AUTH # :', 50, currentY, true);
  drawText(data.authNumber || '', 115, currentY);
  drawText('# of Visits:', 350, currentY, true);
  drawText(data.authVisits || '', 430, currentY);

  // --- DX / DATES ROW ---
  currentY += 45;
  drawText('DX Code:', 50, currentY, true);
  drawText(data.notes || '', 115, currentY);
  drawText('Approval Dates:', 300, currentY, true);
  drawText(data.authDates || '', 400, currentY);

  // --- FOOTER & ATTACHMENTS ---
  currentY += 60;
  drawText('*Please fax a written report to: 469-802-9590', 50, currentY, true, 12);
  currentY += 20;
  drawText('*Please contact patient with the next available appointment', 50, currentY, true, 12);

  currentY += 40;
  drawText('Attached Documents:', 50, currentY, false, 11);
  drawText('1. Demographics', 80, currentY + 15, false, 11);
  drawText('2. INS & DL', 80, currentY + 30, false, 11);
  drawText('3. Most recent OV', 80, currentY + 45, false, 11);
  drawText('4. Most recent Labs & Studies', 80, currentY + 60, false, 11);

  // Append Uploaded PDFs
  for (const attachmentBuffer of attachments) {
    const attachmentDoc = await PDFDocument.load(attachmentBuffer);
    const copiedPages = await pdfDoc.copyPages(attachmentDoc, attachmentDoc.getPageIndices());
    copiedPages.forEach((copiedPage) => pdfDoc.addPage(copiedPage));
  }

  return await pdfDoc.save();
}