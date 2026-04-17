const prisma = require('../config/db');

// Get all turfs with optional filters
exports.getAllTurfs = async (req, res) => {
  try {
    const turfs = await prisma.turf.findMany();
    res.json(turfs);
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
    res.json(turf);
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
