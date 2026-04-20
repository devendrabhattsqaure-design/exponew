const prisma = require('../config/db');

// Get all turfs with optional filters
exports.getAllTurfs = async (req, res) => {
  try {
    const turfs = await prisma.turf.findMany({
        include: {
            admins: true
        }
    });
    // Map new schema fields backward for frontend
    const mapped = turfs.map(t => ({
      ...t,
      imageUrl: t.images && t.images.length > 0 ? t.images[0] : null,
      pricePerHour: 3500 // Generic fallback, though newer ones have detailed pricing
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch turfs' });
  }
};

// Create a new turf (Admin only)
exports.createTurf = async (req, res) => {
  try {
    const { name, location, city, state, description, category, latitude, longitude } = req.body;
    
    const turf = await prisma.turf.create({
      data: {
        name,
        location,
        city,
        state,
        description,
        category: category || 'Football',
        latitude: parseFloat(latitude) || null,
        longitude: parseFloat(longitude) || null,
        images: [], // Default empty
        amenities: [] // Default empty
      }
    });

    res.status(201).json(turf);
  } catch (error) {
    console.error('Create Turf Error:', error);
    res.status(500).json({ error: 'Failed to create turf', details: error.message });
  }
};

// Get single turf details
exports.getTurfById = async (req, res) => {
  try {
    const { id } = req.params;
    const turf = await prisma.turf.findUnique({
      where: { id },
      include: {
        pricing: true,
        cancellationPolicy: true
      }
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

// Create a new slot
exports.createTurfSlot = async (req, res) => {
  try {
    const { id: turfId } = req.params;
    let { date, startTime, endTime, price } = req.body;

    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    const slot = await prisma.turfSlot.create({
      data: {
        turfId,
        date: d,
        startTime,
        endTime,
        price: parseFloat(price),
        status: 'AVAILABLE'
      }
    });

    res.status(201).json(slot);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create slot', details: error.message });
  }
};

// Update a slot
exports.updateTurfSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { startTime, endTime, price, status } = req.body;

    const slot = await prisma.turfSlot.update({
      where: { id: slotId },
      data: {
        startTime,
        endTime,
        price: price ? parseFloat(price) : undefined,
        status
      }
    });

    res.json(slot);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update slot' });
  }
};

// Delete a slot
exports.deleteTurfSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    await prisma.turfSlot.delete({
      where: { id: slotId }
    });
    res.json({ message: 'Slot deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete slot' });
  }
};

// Seed initial mock data (Dev tool)
exports.seedTurfs = async (req, res) => {
  try {
    const mockTurfs = [
      {
        name: 'Emerald Arena',
        location: 'Downtown District',
        city: 'Metropolis',
        state: 'Central',
        description: 'FIFA-pro synthetic grass with advanced LED lighting.',
        category: 'Football'
      }
    ];

    await prisma.turf.createMany({ data: mockTurfs });
    res.json({ message: 'Success' });
  } catch (error) {
    res.status(500).json({ error: 'Seeding failed' });
  }
};
