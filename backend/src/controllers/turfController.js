const prisma = require('../config/db');

// Get all turfs with optional filters
exports.getAllTurfs = async (req, res) => {
  try {
    const turfs = await prisma.turf.findMany();
    // Map new schema fields backward for frontend
    const mapped = turfs.map(t => ({
      ...t,
      imageUrl: t.images && t.images.length > 0 ? t.images[0] : null,
      pricePerHour: 3500
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch turfs' });
  }
};

// Get single turf details
exports.getTurfById = async (req, res) => {
  try {
    const { id } = req.params;
    const turf = await prisma.turf.findUnique({
      where: { id }
    });
    if (!turf) return res.status(404).json({ error: 'Turf not found' });
    
    // Map backward
    const mapped = {
      ...turf,
      imageUrl: turf.images && turf.images.length > 0 ? turf.images[0] : null,
      pricePerHour: 3500
    };
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch turf details' });
  }
};

// Seed initial mock data (Admin only)
exports.seedTurfs = async (req, res) => {
  try {
    const mockTurfs = [
      {
        name: 'Emerald Arena',
        location: 'Downtown District',
        description: 'FIFA-pro synthetic grass with advanced LED lighting.',
        pricePerHour: 3500,
        amenities: ['Wifi', 'Parking', 'Shower']
      },
      {
        name: 'West London Pitch',
        location: 'Skyline Terrace',
        description: 'Elite rooftop pitch with panoramic views.',
        pricePerHour: 4500,
        amenities: ['Cafeteria', 'Locker Room']
      }
    ];

    await prisma.turf.createMany({ data: mockTurfs });
    res.json({ message: 'Success' });
  } catch (error) {
    res.status(500).json({ error: 'Seeding failed' });
  }
};

// Get slots for a turf
exports.getTurfSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query; // optional date filter
    
    const where = { turfId: id };
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      where.date = d;
    }

    const slots = await prisma.turfSlot.findMany({
      where,
      orderBy: { startTime: 'asc' }
    });
    res.json(slots);
  } catch (error) {
    console.error('Fetch Slots Error:', error);
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
};
