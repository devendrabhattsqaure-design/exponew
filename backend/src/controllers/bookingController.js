const prisma = require('../config/db');

// Create a new booking after successful payment
exports.createBooking = async (req, res) => {
  try {
    const { userId, turfId, bookingDate, timeSlot, amount, razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentMethod } = req.body;

    const booking = await prisma.booking.create({
      data: {
        userId,
        turfId,
        bookingDate: new Date(bookingDate),
        timeSlot,
        amount,
        razorpayId: razorpayPaymentId,
        status: 'PAID',
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
      include: { turf: true, paymentDetail: true }
    });

    // Award XP to user for booking a match
    await prisma.user.update({
      where: { id: userId },
      data: { 
        xp: { increment: 50 },
        matchesPlayed: { increment: 1 }
      }
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Booking Error:', error);
    res.status(500).json({ error: 'Failed to create booking record' });
  }
};

// Get all bookings for a specific user
exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: { turf: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user bookings' });
  }
};
