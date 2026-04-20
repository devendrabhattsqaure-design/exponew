const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data with new schema...');

  // 1. Clear existing data in correct order to respect foreign keys
  await prisma.transaction.deleteMany({});
  await prisma.wallet.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.paymentDetail.deleteMany({});
  await prisma.groupMember.deleteMany({});
  await prisma.groupBooking.deleteMany({});
  await prisma.cancellationRequest.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.turfSlot.deleteMany({});
  await prisma.turfPricing.deleteMany({});
  await prisma.turfAvailabilityOverride.deleteMany({});
  await prisma.cancellationPolicy.deleteMany({});
  await prisma.favorite.deleteMany({});
  await prisma.searchHistory.deleteMany({});
  await prisma.turf.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create User
  const user = await prisma.user.create({
    data: {
      id: 'test-user-id', // Fixed ID for easier testing
      email: 'test@turf.com',
      name: 'Test Player',
      password: 'password123',
      phone: '9876543210',
      wallet: {
        create: {
          balance: 1000
        }
      }
    }
  });

  // 3. Create Turfs
  const turfsData = [
    {
      name: 'Emerald Arena',
      location: 'Downtown District',
      city: 'Mumbai',
      state: 'Maharashtra',
      description: 'FIFA-pro synthetic grass with advanced LED lighting and premium amenities.',
      category: 'Football',
      sportTypes: ['FOOTBALL', 'CRICKET'],
      amenities: ['Wifi', 'Parking', 'Shower', 'Cafeteria'],
      rating: 4.8,
      images: ['https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80'],
    },
    {
      name: 'Skyline Terrace Pitch',
      location: 'Andheri West',
      city: 'Mumbai',
      state: 'Maharashtra',
      description: 'Elite rooftop pitch with panoramic city views and professional drainage system.',
      category: 'Football',
      sportTypes: ['FOOTBALL'],
      amenities: ['Locker Room', 'Parking', 'Beverages'],
      rating: 4.5,
      images: ['https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80'],
    },
    {
      name: 'Victory Valley',
      location: 'Bandra Reclamation',
      city: 'Mumbai',
      state: 'Maharashtra',
      description: 'The preferred choice for weekend tournaments and company matches.',
      category: 'Cricket',
      sportTypes: ['CRICKET'],
      amenities: ['Wifi', 'Shower', 'Cafeteria'],
      rating: 4.2,
      images: ['https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80'],
    }
  ];

  for (const t of turfsData) {
    const turf = await prisma.turf.create({
      data: {
        ...t,
        cancellationPolicy: {
          create: {
            freeCancellationHours: 6,
            partialRefundPercent: 50
          }
        }
      }
    });

    // Create some slots for each turf for today and tomorrow
    const d1 = new Date(); d1.setHours(0,0,0,0);
    const d2 = new Date(Date.now() + 86400000); d2.setHours(0,0,0,0);
    const dates = [d1, d2];
    const times = ['06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'];

    for (const date of dates) {
      for (const time of times) {
        await prisma.turfSlot.create({
          data: {
            turfId: turf.id,
            date: date,
            startTime: time,
            endTime: 'Next Hour',
            status: 'AVAILABLE',
            price: 2500 + Math.floor(Math.random() * 1000)
          }
        });
      }
    }
  }

  console.log('Seeding complete! User "test@turf.com" created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
