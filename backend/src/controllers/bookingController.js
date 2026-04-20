const prisma = require('../config/db');

// Create a new booking after successful payment
exports.createBooking = async (req, res) => {
  try {
    const { userId, turfId, bookingDate, timeSlot, amount, razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentMethod } = req.body;

    // 1. Verify User exists to prevent P2003 Foreign Key errors
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      return res.status(401).json({ error: 'User session invalid. Please log out and sign in again.' });
    }

    const parsedDate = new Date(bookingDate);
    parsedDate.setHours(0, 0, 0, 0); // Normalize to midnight for matching

    // 2. Dynamic slot lookup or creation since new schema requires slotId
    let slot = await prisma.turfSlot.findFirst({
      where: {
        turfId,
        date: parsedDate,
        startTime: timeSlot
      }
    });

    if (!slot) {
      slot = await prisma.turfSlot.create({
        data: {
          turfId,
          date: parsedDate,
          startTime: timeSlot,
          endTime: 'Next Hour', 
          status: 'AVAILABLE',
          price: amount
        }
      });
    }

    // 3. Create the booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        turfId,
        slotId: slot.id,
        amount,
        razorpayId: razorpayPaymentId,
        status: 'CONFIRMED',
        paymentDetail: {
          create: {
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            paymentMethod: paymentMethod || "card",
            amount,
            status: "SUCCESS"
          }
        }
      },
      include: { turf: true, slot: true, paymentDetail: true }
    });

    // 4. Award XP and update stats
    await prisma.user.update({
      where: { id: userId },
      data: { 
        xp: { increment: 50 },
        matchesPlayed: { increment: 1 }
      }
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('CRITICAL Booking Error:', error);
    res.status(500).json({ error: error.message || 'Failed to create booking record' });
  }
};

// Get all bookings for a specific user
exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: { turf: true, slot: true },
      orderBy: { createdAt: 'desc' }
    });
    
    // Map backward for frontend expectations
    const mapped = bookings.map(b => ({
      ...b,
      bookingDate: b.slot ? b.slot.date : b.createdAt,
      timeSlot: b.slot ? b.slot.startTime : 'N/A'
    }));

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user bookings' });
  }
};
