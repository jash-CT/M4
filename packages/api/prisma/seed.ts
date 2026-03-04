const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@logistics.local' },
    update: {},
    create: {
      email: 'admin@logistics.local',
      password: adminPassword,
      name: 'Admin',
      role: 'admin',
    },
  });
  console.log('Created admin:', user.email);

  const vendorPassword = await bcrypt.hash('vendor123', 10);
  const vendor = await prisma.vendor.upsert({
    where: { code: 'VENDOR01' },
    update: {},
    create: {
      code: 'VENDOR01',
      name: 'Acme Supplies',
      email: 'vendor@acme.example',
      status: 'active',
      addressJson: JSON.stringify({
        line1: '123 Supplier St',
        city: 'Chicago',
        state: 'IL',
        postalCode: '60601',
        country: 'US',
      }),
    },
  });

  const vendorUser = await prisma.vendorUser.upsert({
    where: { vendorId_email: { vendorId: vendor.id, email: 'portal@acme.example' } },
    update: {},
    create: {
      vendorId: vendor.id,
      email: 'portal@acme.example',
      password: vendorPassword,
      role: 'admin',
    },
  });
  console.log('Created vendor:', vendor.code, 'user:', vendorUser.email);

  const warehouse = await prisma.warehouse.upsert({
    where: { code: 'WH01' },
    update: {},
    create: {
      code: 'WH01',
      name: 'Main Distribution Center',
      addressJson: JSON.stringify({
        line1: '500 Logistics Way',
        city: 'Dallas',
        state: 'TX',
        postalCode: '75201',
        country: 'US',
      }),
      status: 'active',
      timezone: 'America/Chicago',
      capacityJson: JSON.stringify({ totalVolumeM3: 10000, totalWeightKg: 50000 }),
    },
  });

  await prisma.warehouseZone.upsert({
    where: { warehouseId_code: { warehouseId: warehouse.id, code: 'RECV' } },
    update: {},
    create: { warehouseId: warehouse.id, code: 'RECV', name: 'Receiving', type: 'receiving' },
  });
  await prisma.warehouseZone.upsert({
    where: { warehouseId_code: { warehouseId: warehouse.id, code: 'STG' } },
    update: {},
    create: { warehouseId: warehouse.id, code: 'STG', name: 'Storage', type: 'storage' },
  });
  console.log('Created warehouse:', warehouse.code);

  const carrier = await prisma.carrier.upsert({
    where: { code: 'STUB' },
    update: {},
    create: {
      code: 'STUB',
      name: 'Stub Carrier',
      type: 'parcel',
      integrationId: 'stub',
      isActive: true,
    },
  });
  console.log('Created carrier:', carrier.code);

  const existingRule = await prisma.complianceRule.findFirst({ where: { countryCode: 'US', type: 'import' } });
  if (!existingRule) {
    await prisma.complianceRule.create({
      data: {
        name: 'US Import - Standard',
        countryCode: 'US',
        type: 'import',
        requiredDocuments: 'commercial_invoice,packing_list,customs_declaration',
        isActive: true,
      },
    });
    console.log('Created compliance rule: US Import');
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
