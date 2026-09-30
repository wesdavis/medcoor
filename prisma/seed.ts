import { PrismaClient } from '@prisma/client';
import * as xlsx from 'xlsx';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  // 1. Wipe the old local testing data
  await prisma.specialist.deleteMany({});
  console.log('Cleared existing testing data.');

  // 2. Load the spreadsheet
  const filePath = path.join(process.cwd(), 'REFERRAL CONTACTS .xlsx');
  const workbook = xlsx.readFile(filePath);

  // 3. Process the PROVIDERS tab
  const providersSheet = workbook.Sheets['PROVIDERS'];
  const providersData = xlsx.utils.sheet_to_json(providersSheet);

  for (const row of providersData as any[]) {
    if (!row['PHYSICIAN NAME']) continue; 

    await prisma.specialist.create({
      data: {
        specialty: row['SPECIALTY'] ? String(row['SPECIALTY']) : null,
        name: row['PHYSICIAN NAME'] ? String(row['PHYSICIAN NAME']) : null,
        clinicName: row['OFFICE NAME'] ? String(row['OFFICE NAME']) : null,
        address: row['ADDRESS'] ? String(row['ADDRESS']) : null,
        phone: row['PHONE'] ? String(row['PHONE']) : null,
        intakeFax: row['FAX'] ? String(row['FAX']) : null,
        npi: row['NPI'] ? String(row['NPI']) : null,
        acceptedInsurances: row['INSURANCES ACCEPTED'] ? String(row['INSURANCES ACCEPTED']) : null,
        rules: row['NOTES'] ? String(row['NOTES']) : null,
      },
    });
  }

  // 4. Process the OFFICES tab
  const officesSheet = workbook.Sheets['OFFICES'];
  const officesData = xlsx.utils.sheet_to_json(officesSheet);

  for (const row of officesData as any[]) {
    if (!row['OFFICE NAME']) continue; 

    await prisma.specialist.create({
      data: {
        specialty: row['SPECIALTY'] ? String(row['SPECIALTY']) : null,
        clinicName: row['OFFICE NAME'] ? String(row['OFFICE NAME']) : null,
        website: row['WEBSITE'] ? String(row['WEBSITE']) : null,
        address: row['LOCATIONS'] ? String(row['LOCATIONS']) : null, 
        phone: row['PHONE'] ? String(row['PHONE']) : null,
        intakeFax: row['FAX'] ? String(row['FAX']) : null,
        acceptedInsurances: row['INSURANCE'] ? String(row['INSURANCE']) : null,
        rules: row['NOTES'] ? String(row['NOTES']) : null,
      },
    });
  }

  console.log('Successfully imported the roster into AWS RDS.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });