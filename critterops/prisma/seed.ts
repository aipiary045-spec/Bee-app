import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password.ts";
import { retentionUntil } from "../src/lib/compliance.ts";

const prisma = new PrismaClient();

async function main() {
  await prisma.routeStop.deleteMany();
  await prisma.routePlan.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceLine.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.quoteLine.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.activityNote.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.complianceForm.deleteMany();
  await prisma.chemicalApplication.deleteMany();
  await prisma.captureLog.deleteMany();
  await prisma.trapEvent.deleteMany();
  await prisma.trap.deleteMany();
  await prisma.entryPoint.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.job.deleteMany();
  await prisma.workRequest.deleteMany();
  await prisma.property.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const org = await prisma.organization.create({
    data: {
      name: "The Wildlife Pros",
      tradeName: "CritterOps",
      phone: "(405) 363-4433",
      email: "dawson@thewildlifepros.com",
      website: "https://github.com/aipiary045-spec/The-Wildlife-Pros",
      address: "Field office",
      city: "Chandler",
      state: "OK",
      zip: "74834",
      nwcoPermitNumber: "NWCO-OK-4521",
      pesticideLicense: "ODAFF-7C-11892",
    },
  });

  const dawson = await prisma.user.create({
    data: {
      organizationId: org.id,
      name: "Dawson",
      email: "dawson@thewildlifepros.com",
      phone: "(405) 363-4433",
      role: "owner",
      passwordHash: hashPassword("DawsonField1"),
      nwcoPermit: "NWCO-OK-4521",
      applicatorId: "ODAFF-7C-11892",
      color: "#00a67e",
      homeLat: 35.7017,
      homeLng: -96.8809,
    },
  });

  const riley = await prisma.user.create({
    data: {
      organizationId: org.id,
      name: "Riley Brooks",
      email: "riley@thewildlifepros.com",
      phone: "(405) 555-0144",
      role: "technician",
      passwordHash: hashPassword("RileyField1"),
      nwcoPermit: "NWCO-OK-4522",
      color: "#d97706",
      homeLat: 35.6528,
      homeLng: -97.4781,
    },
  });

  const clients = await Promise.all([
    prisma.client.create({
      data: {
        organizationId: org.id,
        firstName: "Helen",
        lastName: "Marlow",
        email: "helen.marlow@example.com",
        phone: "(405) 555-0198",
        notes: "Dogs in backyard. Prefers morning windows.",
        portalToken: "portal-helen-marlow",
        properties: {
          create: [
            {
              label: "Home",
              address1: "418 Maple Ave",
              city: "Chandler",
              zip: "74834",
              county: "Lincoln",
              lat: 35.7019,
              lng: -96.8814,
              accessNotes: "Side gate latch sticks. Attic hatch in hall closet.",
              petsOnSite: "2 dogs",
            },
          ],
        },
      },
      include: { properties: true },
    }),
    prisma.client.create({
      data: {
        organizationId: org.id,
        firstName: "Marcus",
        lastName: "Yates",
        companyName: "Yates Feed & Seed",
        email: "marcus@yatesfeed.example",
        phone: "(405) 555-0112",
        billingEmail: "accounts@yatesfeed.example",
        portalToken: "portal-yates-feed",
        properties: {
          create: [
            {
              label: "Store",
              address1: "102 W Main St",
              city: "Stroud",
              zip: "74079",
              county: "Lincoln",
              lat: 35.7489,
              lng: -96.6508,
              accessNotes: "Loading dock after 7am. Manager on site.",
            },
            {
              label: "Barn",
              address1: "880 County Road 3280",
              city: "Agra",
              zip: "74824",
              county: "Lincoln",
              lat: 35.8948,
              lng: -96.8701,
              accessNotes: "Gravel drive. Watch for cattle guard.",
            },
          ],
        },
      },
      include: { properties: true },
    }),
    prisma.client.create({
      data: {
        organizationId: org.id,
        firstName: "Priya",
        lastName: "Nair",
        email: "priya.nair@example.com",
        phone: "(405) 555-0176",
        portalToken: "portal-priya-nair",
        properties: {
          create: [
            {
              label: "Home",
              address1: "22 Redbud Ct",
              city: "Edmond",
              zip: "73013",
              county: "Oklahoma",
              lat: 35.6529,
              lng: -97.4774,
              accessNotes: "HOA. Park on street, not driveway.",
              petsOnSite: "1 cat indoors",
            },
          ],
        },
      },
      include: { properties: true },
    }),
    prisma.client.create({
      data: {
        organizationId: org.id,
        firstName: "Tom",
        lastName: "Whitaker",
        email: "tom.whitaker@example.com",
        phone: "(405) 555-0133",
        portalToken: "portal-tom-whitaker",
        properties: {
          create: [
            {
              label: "Rental",
              address1: "609 S Perkins Rd",
              city: "Stillwater",
              zip: "74074",
              county: "Payne",
              lat: 36.1156,
              lng: -97.0584,
              accessNotes: "Tenant: Leah. Lockbox 3920.",
            },
          ],
        },
      },
      include: { properties: true },
    }),
  ]);

  const helenHome = clients[0].properties[0];
  const yatesStore = clients[1].properties[0];
  const yatesBarn = clients[1].properties[1];
  const priyaHome = clients[2].properties[0];
  const tomRental = clients[3].properties[0];

  const raccoonRequest = await prisma.workRequest.create({
    data: {
      organizationId: org.id,
      clientId: clients[0].id,
      propertyId: helenHome.id,
      number: "REQ-1001",
      status: "converted",
      source: "phone",
      complaint: "Scratching in attic after dark. Droppings near north soffit.",
      targetSpecies: "raccoon",
      preferredWindow: "Weekday mornings",
    },
  });

  const ratRequest = await prisma.workRequest.create({
    data: {
      organizationId: org.id,
      clientId: clients[1].id,
      propertyId: yatesBarn.id,
      number: "REQ-1002",
      status: "quoted",
      source: "client_hub",
      complaint: "Rats in feed barn. Chew on bags overnight.",
      targetSpecies: "Norway rat",
    },
  });

  const batRequest = await prisma.workRequest.create({
    data: {
      organizationId: org.id,
      clientId: clients[2].id,
      propertyId: priyaHome.id,
      number: "REQ-1003",
      status: "new",
      source: "phone",
      complaint: "Bats circling the chimney at dusk.",
      targetSpecies: "bat",
      preferredWindow: "Evenings after 6",
    },
  });

  const raccoonQuote = await prisma.quote.create({
    data: {
      organizationId: org.id,
      clientId: clients[0].id,
      propertyId: helenHome.id,
      requestId: raccoonRequest.id,
      number: "Q-1001",
      status: "approved",
      title: "Attic raccoon trapping + soffit exclusion",
      message: "Inspect, set live traps, and seal the north soffit once the animal is out.",
      subtotalCents: 48500,
      taxCents: 2183,
      totalCents: 50683,
      approvedAt: new Date("2026-08-12T15:10:00"),
      sentAt: new Date("2026-08-12T09:00:00"),
      lines: {
        create: [
          { name: "Inspection + setup", quantity: 1, unitCents: 12500, sortOrder: 0 },
          { name: "Live trap set / check (3 nights)", quantity: 3, unitCents: 6500, sortOrder: 1 },
          { name: "Soffit exclusion + hardware cloth", quantity: 1, unitCents: 16500, sortOrder: 2 },
        ],
      },
    },
  });

  const barnQuote = await prisma.quote.create({
    data: {
      organizationId: org.id,
      clientId: clients[1].id,
      propertyId: yatesBarn.id,
      requestId: ratRequest.id,
      number: "Q-1002",
      status: "sent",
      title: "Feed barn rodent program",
      message: "Bait stations, exclusion on the north wall, and two follow-up checks.",
      subtotalCents: 62000,
      taxCents: 2790,
      totalCents: 64790,
      sentAt: new Date("2026-08-14T11:20:00"),
      validUntil: new Date("2026-08-28T23:59:00"),
      lines: {
        create: [
          { name: "Barn inspection", quantity: 1, unitCents: 15000, sortOrder: 0 },
          { name: "Tamper-resistant bait stations", quantity: 6, unitCents: 4500, sortOrder: 1 },
          { name: "Exclusion labor", quantity: 1, unitCents: 20000, sortOrder: 2 },
        ],
      },
    },
  });

  const raccoonJob = await prisma.job.create({
    data: {
      organizationId: org.id,
      clientId: clients[0].id,
      propertyId: helenHome.id,
      requestId: raccoonRequest.id,
      quoteId: raccoonQuote.id,
      number: "JOB-1001",
      title: "Attic raccoon — Maple Ave",
      type: "trapping",
      status: "scheduled",
      complaint: raccoonRequest.complaint,
      targetSpecies: "raccoon",
      instructions: "Carry NWCO complaint form. Dogs will be kenneled.",
    },
  });

  const squirrelJob = await prisma.job.create({
    data: {
      organizationId: org.id,
      clientId: clients[3].id,
      propertyId: tomRental.id,
      number: "JOB-1002",
      title: "Squirrels in soffit — Perkins rental",
      type: "exclusion",
      status: "on_site",
      complaint: "Chew hole above carport. Tenant hears them at 6am.",
      targetSpecies: "fox squirrel",
    },
  });

  const storeJob = await prisma.job.create({
    data: {
      organizationId: org.id,
      clientId: clients[1].id,
      propertyId: yatesStore.id,
      number: "JOB-1003",
      title: "Opossum under loading dock",
      type: "removal",
      status: "completed",
      complaint: "Opossum living under the dock. Customers complained.",
      targetSpecies: "opossum",
    },
  });

  const today = new Date();
  const at = (hours: number, minutes = 0) => {
    const date = new Date(today);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const visitHelen = await prisma.visit.create({
    data: {
      jobId: raccoonJob.id,
      propertyId: helenHome.id,
      technicianId: dawson.id,
      title: "Trap check — Maple Ave",
      status: "scheduled",
      startsAt: at(8, 0),
      endsAt: at(9, 0),
    },
  });
  const visitTom = await prisma.visit.create({
    data: {
      jobId: squirrelJob.id,
      propertyId: tomRental.id,
      technicianId: dawson.id,
      title: "One-way door + exclusion",
      status: "scheduled",
      startsAt: at(10, 30),
      endsAt: at(12, 30),
    },
  });
  await prisma.visit.create({
    data: {
      jobId: storeJob.id,
      propertyId: yatesStore.id,
      technicianId: riley.id,
      title: "Dock follow-up",
      status: "completed",
      startsAt: at(7, 30),
      endsAt: at(8, 15),
      completedAt: at(8, 10),
    },
  });
  await prisma.visit.create({
    data: {
      jobId: raccoonJob.id,
      propertyId: helenHome.id,
      technicianId: dawson.id,
      title: "Soffit seal (after catch)",
      status: "scheduled",
      startsAt: new Date(at(8, 0).getTime() + 24 * 60 * 60 * 1000),
      endsAt: new Date(at(10, 0).getTime() + 24 * 60 * 60 * 1000),
    },
  });

  const trap14 = await prisma.trap.create({
    data: {
      organizationId: org.id,
      serialNumber: "Trap #14",
      type: "live_box",
      status: "deployed",
      propertyId: helenHome.id,
      jobId: raccoonJob.id,
      locationNote: "Active — raccoon in attic, north soffit",
      deployedAt: new Date(Date.now() - 30 * 60 * 60 * 1000),
      lastCheckedAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
    },
  });
  await prisma.trap.create({
    data: {
      organizationId: org.id,
      serialNumber: "Trap #08",
      type: "one_way_door",
      status: "deployed",
      propertyId: tomRental.id,
      jobId: squirrelJob.id,
      locationNote: "Carport soffit — fox squirrel",
      deployedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      lastCheckedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
  });
  await prisma.trap.create({
    data: {
      organizationId: org.id,
      serialNumber: "Trap #21",
      type: "live_box",
      status: "in_stock",
      locationNote: "Shop rack B",
    },
  });

  await prisma.trapEvent.createMany({
    data: [
      {
        trapId: trap14.id,
        userId: dawson.id,
        type: "deploy",
        notes: "Set on north attic run with marshmallow bait.",
        at: new Date(Date.now() - 30 * 60 * 60 * 1000),
      },
      {
        trapId: trap14.id,
        userId: dawson.id,
        type: "check",
        notes: "Empty. Reset.",
        at: new Date(Date.now() - 26 * 60 * 60 * 1000),
      },
    ],
  });

  const soffit = await prisma.entryPoint.create({
    data: {
      propertyId: helenHome.id,
      jobId: raccoonJob.id,
      label: "North soffit return",
      area: "soffit",
      status: "identified",
      materialUsed: "Pending 1/4 in hardware cloth",
      notes: "Primary run. Photograph before seal.",
    },
  });

  await prisma.entryPoint.create({
    data: {
      propertyId: tomRental.id,
      jobId: squirrelJob.id,
      label: "Carport fascia chew",
      area: "roof",
      status: "temp_sealed",
      materialUsed: "One-way door + temporary foam",
    },
  });

  await prisma.captureLog.create({
    data: {
      jobId: storeJob.id,
      propertyId: yatesStore.id,
      technicianId: riley.id,
      species: "opossum",
      count: 1,
      disposition: "relocated",
      method: "box or live trap",
      capturedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
      relocationSite: "Lincoln County, outside city limits, landowner permission on file",
      notes: "Healthy adult. Released before 24-hour hold limit.",
    },
  });

  await prisma.chemicalApplication.create({
    data: {
      jobId: storeJob.id,
      propertyId: yatesStore.id,
      applicatorId: riley.id,
      appliedAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
      productName: "Contrac Blox",
      epaRegNumber: "12455-79",
      targetPest: "Norway rat",
      applicationRate: "4–16 oz per placement",
      amountUsed: "2 lb",
      siteDescription: "Interior bait stations along north warehouse wall",
      method: "tamper-resistant station",
      windMph: 6,
      temperatureF: 84,
    },
  });

  const submitted = new Date();
  await prisma.complianceForm.create({
    data: {
      jobId: raccoonJob.id,
      type: "nwco_complaint",
      title: "NWCO Complaint Report — Marlow attic raccoon",
      fieldsJson: JSON.stringify({
        customer: "Helen Marlow",
        location: "418 Maple Ave, Chandler, OK",
        targetSpecies: "raccoon",
        method: "box or live trap",
        landownerSignature: "on file",
        effectiveDates: "2026-08-12 to 2026-08-20",
      }),
      submittedAt: submitted,
      retentionUntil: retentionUntil(submitted),
    },
  });

  await prisma.photo.createMany({
    data: [
      {
        jobId: raccoonJob.id,
        propertyId: helenHome.id,
        entryPointId: soffit.id,
        userId: dawson.id,
        kind: "before",
        url: "/photos/before-soffit.svg",
        caption: "North soffit return before exclusion",
      },
      {
        jobId: raccoonJob.id,
        propertyId: helenHome.id,
        entryPointId: soffit.id,
        userId: dawson.id,
        kind: "damage",
        url: "/photos/damage-insulation.svg",
        caption: "Insulation trail in attic",
      },
      {
        jobId: storeJob.id,
        propertyId: yatesStore.id,
        userId: riley.id,
        kind: "after",
        url: "/photos/after-dock.svg",
        caption: "Dock skirt closed after removal",
      },
    ],
  });

  await prisma.invoice.create({
    data: {
      organizationId: org.id,
      clientId: clients[1].id,
      propertyId: yatesStore.id,
      jobId: storeJob.id,
      number: "INV-1001",
      status: "sent",
      issuedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      dueAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      subtotalCents: 27500,
      taxCents: 1238,
      totalCents: 28738,
      balanceCents: 28738,
      lines: {
        create: [
          { name: "Live trap + removal", quantity: 1, unitCents: 18500, sortOrder: 0 },
          { name: "Dock skirt repair labor", quantity: 1, unitCents: 9000, sortOrder: 1 },
        ],
      },
    },
  });

  await prisma.activityNote.create({
    data: {
      jobId: raccoonJob.id,
      userId: dawson.id,
      kind: "note",
      body: "Homeowner confirmed scratching started Monday night. No pets in attic.",
    },
  });

  const route = await prisma.routePlan.create({
    data: {
      organizationId: org.id,
      technicianId: dawson.id,
      date: at(0, 0),
      totalMiles: 0,
    },
  });
  await prisma.routeStop.createMany({
    data: [
      { routePlanId: route.id, visitId: visitHelen.id, stopOrder: 1, milesFromPrev: 0 },
      { routePlanId: route.id, visitId: visitTom.id, stopOrder: 2, milesFromPrev: 0 },
    ],
  });

  console.log("Seeded The Wildlife Pros / CritterOps demo.");
  console.log("Login: dawson@thewildlifepros.com / DawsonField1");
  console.log("Portal: /p/portal-helen-marlow");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
